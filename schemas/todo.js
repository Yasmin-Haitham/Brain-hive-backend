//create todo item schema for mongo db

const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true,
        default: 'User'
    }
    
});

module.exports = mongoose.model('Todo', todoSchema);
