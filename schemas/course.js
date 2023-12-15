//require mongoose 
const mongoose = require('mongoose');
// create course schema
const CourseSchema = new mongoose.Schema({
    name:{ type:String },
    department:{ type:String },
    instructor:{ type:String },

});

//export schema as a mongoose model
module.exports = mongoose.model("Course", CourseSchema);