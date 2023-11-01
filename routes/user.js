const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
require("../config/passport.js")(passport);
const User = require("../schemas/user");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");

// router get users
router.get("/", async (req, res) => {
  try {
    let userList = await User.find({});
    res.json(userList);
  } catch (err) {
    res.status(401).send({ message: err });
  }
});

// Create a route for retrieving data of the logged-in user
router.get("/profile", (req, res) => {
  // Check if the user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.status(200).json({ user: req.user });
  console.log(req.user);
});

//router create user
router.post("/create", async function (req, res) {
  console.log("body", req.body);
  const body = req.body;
  //Create a joi schema for the user to validate data types
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(25),
    lastName: Joi.string().min(3).max(25),
    email: Joi.string().email(),
    password: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/),
    phoneNumber: Joi.string(),
    LearningStyle: Joi.string()
      .valid("visual", "auditory", "read", "kinesthetic")
      .insensitive(),
    UserType: Joi.string()
      .valid("student", "instructor", "admin")
      .insensitive(),
  });
  //create const object error and store value if body matches schema of joi
  const { error } = schema.validate(body);
  if (error) {
    res.status(401).send({ message: "Invalid Data" });
  } else {
    const newUser = new User({
      Name: body.firstName + " " + body.lastName,
      Email: body.email,
      Password: body.password,
      PhoneNumber: body.phoneNumber,
      LearningStyle: body.LearningStyle,
      UserType: body.UserType,
    });
    //after parsing the body and creating a new user before adding to db password must be encrypted
    bcrypt.hash(newUser.Password, 10, async (err, hash) => {
      if (err) throw err;
      newUser.Password = hash;
      newUser
        .save()
        .then(() => console.log("new user saved"))
        .catch((e) => res.status(500).send(e));
      res.send("New User Created");
    });
  }
});

// Login User Route
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Handle unsuccessful login
      return res
        .status(401)
        .json({ success: false, message: "Authentication failed" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // Handle successful login
      return res
        .status(200)
        .json({ success: true, message: "Login successful" });
    });
  })(req, res, next);
});

// Update User Route
router.put("/update/:id", async (req, res) => {
  const userId = req.params.id;
  const updatedUserData = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updatedUserData },
      { new: true }
    );

    if (!user) {
      return res.status(404).send("User not found.");
    }

    res.status(200).send("User updated successfully.");
  } catch (error) {
    res.status(500).send("Error updating user.");
  }
});

// Logout User Route
router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).send("User logged out successfully.");
  }); // Passport's logout method
});

module.exports = router;
