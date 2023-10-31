//require mongoose 
const mongoose = require('mongoose');
// create course schema
const CourseSchema = new mongoose.Schema({
    // course has ID, Department, Instructor, Name, Content
    id: {type: String},
    department:{ type:String },
    instructor:{ type:String },
    name:{ type:String },
    content:{ type:String }

});

//export schema as a mongoose model
module.exports = mongoose.model("Course", CourseSchema);