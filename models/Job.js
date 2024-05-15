const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
     language: {
         type: String,
         required: true,
         enum: ['cpp', 'c', 'py']
     },
     filepath: {
         type: String,
         required: true
     },
     submittedAt: {
         type: Date,
         default: Date.now
     },
     startedAt: {
         type: Date
     },
     completedAt: {
         type: Date
     },
     output: {
         type: String
     },
     status: {
         type: String,
         enum: ['pending', 'success', 'error'],
         default: 'pending'
     }
});

const Job = mongoose.model('job', JobSchema);

module.exports = Job;