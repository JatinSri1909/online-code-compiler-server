const Queue = require('bull');
const Job = require('./models/Job');

const { executeCpp } = require('./executeCpp');
const { executePy } = require('./executePy');
const { executeC } = require('./executeC');

const jobQueue = new Queue('job-queue');

const NUM_WORKERS = 5;

jobQueue.process(NUM_WORKERS, async ({data}) => {
    console.log(data);
    const { id: jobId } = data;
    const job = await Job.findById(jobId);
    if (!job) {
        throw new Error('Job not found');
    }
    console.log("Fetched Job ",job);
    try{
        job['startedAt'] = new Date();

    if (job.language === 'cpp'){
        output = await executeCpp(job.filepath);
    }
    else if(job.language === 'py'){
        output = await executePy(job.filepath);
    }
    else if(job.language === 'c'){
        output = await executeC(job.filepath);
    }

    job['completedAt'] = new Date();
    job['status'] = 'success';
    job['output'] = output;

    await job.save();

    console.log(job);
    }
    

     catch(error){
        job['completedAt'] = new Date();
        job['status'] = 'error';
        job['output'] = JSON.stringify(error);
        await job.save();
        console.log(job);
    }
    
    return true;
});

jobQueue.on('failed', (error) => {
    console.log(error.data.id, "failed", error.failedReason);
});

const addJobToQueue = async (jobId) => {
    await jobQueue.add({ id: jobId });
}

module.exports = { 
     addJobToQueue };