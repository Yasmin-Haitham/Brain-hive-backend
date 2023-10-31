const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    Name: { type: String },
    Email: { type: String, unique: true, sparse: true },
    Password: { type: String },
    PhoneNumber: { type: String },      
    LearningStyle: { type: String },
    UserType: { type: String }
});

module.exports = mongoose.model("user", userSchema);