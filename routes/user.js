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
  res.send(req.user);
  console.log("profile nav: " + req.user);
});

//router create user
router.post("/create", async function (req, res) {
  console.log("body", req.body);

  const body = req.body;

  // Create a Joi schema for user data validation
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(25),
    lastName: Joi.string().min(3).max(25),
    email: Joi.string().email(),
    password: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/),
    phoneNumber: Joi.string(),
    LearningStyle: Joi.string()
      .valid("visual", "auditory", "read", "kinesthetic", null)
      .insensitive(),
    //specializations joi validate is string
    specializations: Joi.string(),

    // userType: Joi.string()
    //   .valid("student", "instructor", "admin")
    //   .insensitive(),
  });

  // Validate user input against the schema
  const { error } = schema.validate(body);

  if (error) {
    // Send a 400 Bad Request response for invalid data
    return res
      .status(400)
      .send({ message: "Invalid Data", details: error.details });
  }

  try {
    // Check if the user with the given email already exists
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      // Send a 409 Conflict response if the user already exists
      return res.status(409).send({ message: "User already exists" });
    }

    // Create a new user object
    const newUser = new User({
      Name: body.firstName + " " + body.lastName,
      Email: body.email,
      Password: body.password,
      PhoneNumber: body.phoneNumber,
      LearningStyle: body.learningStyle,
      UserType: body.userType,
      Field: body.specializations,
      enrolledCourses: {},
    });

    // Encrypt the user's password before saving to the database
    const hashedPassword = await bcrypt.hash(newUser.Password, 10);
    newUser.Password = hashedPassword;

    // Save the new user to the database
    await newUser.save();

    console.log("New user saved");

    // Send a 201 Created response
    res.status(201).send("New User Created");
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error creating user:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Login User Route
router.post("/login", async (req, res, next) => {
  await passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Handle unsuccessful login
      return res
        .status(401)
        .json({ success: false, message: "Authentication failed" });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      // Set a cookie to indicate that the user is logged in
      res.cookie("isLoggedIn", true, {
        httpOnly: true,
        expires: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
      });
      // Handle successful login
      return res
        .status(200)
        .send({
          success: true,
          message: "Login successful",
          uid: user._id,
          LearningStyle: user.LearningStyle,
        });
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
  }); // Passport's logout method
  res.status(200).send("User logged out successfully.");
});





module.exports = router;
