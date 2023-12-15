const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    Name: { type: String },
    Email: { type: String, unique: true, sparse: true },
    Password: { type: String },
    PhoneNumber: { type: String },      
    LearningStyle: { type: String },
    UserType: { type: String },
    Field:{type: String},
    ProfilePicturePath: { type: String },
    CoverPicturePath: { type: String },
    VisualPercent: { type: Number },
    AuditoryPercent: { type: Number },
    ReadingPercent: { type: Number },
    KinestheticPercent: { type: Number },
    enrolledCourses:{type: Object}
});

module.exports = mongoose.model("user", userSchema);