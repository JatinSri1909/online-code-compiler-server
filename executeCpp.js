const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const outputPath = path.join(__dirname, 'output');
if(!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filePath) => {
    const jobId = path.basename(filePath).split('.')[0];
    const outPath = path.join(outputPath, `${jobId}.exe`);
    return new Promise((resolve, reject) => {
                exec(`g++ ${filePath} -o ${outPath} &&  ${outPath} `,
                 (error, stdout, stderr) => {
                    error && reject({error, stderr});
                    stderr && reject(stderr);
                    resolve(stdout);
                 }
                );
            });
        };

        module.exports = {
            executeCpp};
