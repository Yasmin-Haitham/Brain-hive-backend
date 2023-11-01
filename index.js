require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

const uri = process.env.CONNECTION_STRING;

//create express server
const app = express();

//set port
const port = process.env.PORT || 3030;

// Set up CORS options
const corsOptions = {
  origin: "http://localhost:3000", // Replace with your client's actual URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

//define user router
const userRouter = require("./routes/user");

//connect the database
mongoose
  .connect(uri, {})
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

//passport init

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 43200000, // 12 hours in milliseconds
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

//body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

// router
app.use("/user", userRouter);

// session managment middleware
app.use((req, res, next) => {
  if (req.session && req.session.userId) {
    const currentTime = Date.now();
    const lastActivityTime = req.session.lastActivityTime || currentTime;

    if (currentTime - lastActivityTime > 43200000) {
      // 12 hours have passed since the last activity; log out the user
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
        // Redirect or respond to log out
        return res.redirect("/logout"); // You need to define a logout route
      });
    } else {
      req.session.lastActivityTime = currentTime;
    }
  }
  next();
});

app.listen(port, () => {
  console.log(`this server is up and running on: ${port}`);
});
