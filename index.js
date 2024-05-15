const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const { generateFile } = require('./generateFile');
const { addJobToQueue } = require('./jobQueue');
const Job = require('./models/Job');

const app = express();
PORT = process.env.PORT || 5000;
MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/status', async(req, res) => {
    const jobId = req.query.id;
    console.log("status requested: ", jobId);
    if (!jobId) {
        return res.status(400).json({ success: false, message: 'Job ID is required' });
    }
    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }
        return res.status(200).json({ success: true, job });
    } catch (error) {
        return res.status(404).json({ success: false, error: JSON.stringify(error) });
    }
});

app.post('/run', async(req, res) => {
    const { language = 'cpp', code } = req.body;
    console.log(language, code.length);
    if (!code) {
        return res.status(400).json({ success: false, message: 'Code is required' });
    }

    let job;

    try{

    // generate a file with content from the request
    const filepath = await generateFile(language, code);

    // save the job in the database
    job = await new Job({ language, filepath }).save(); 
    const jobId = job['_id'];
    addJobToQueue(jobId); 
    console.log(job);
    res.status(201).json({ success: true , jobId });
    } catch (err) {
        return res.status(500).json({success: false, err: JSON.stringify(err)})
    }
    });

const connectDb = async () => {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to MongoDB with ${mongoose.connection.host}`);
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
};

connectDb();