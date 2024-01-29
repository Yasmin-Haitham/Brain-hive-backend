const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  points: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  user: { type: String, required: true },
});

module.exports = mongoose.model("Achievement", achievementSchema);
