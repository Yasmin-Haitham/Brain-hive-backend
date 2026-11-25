require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParse = require("body-parser");

const uri = process.env.CONNECTION_STRING;

// Signs session cookies. Must be set in production; the fallback is for local dev only.
const sessionSecret = process.env.SESSION_SECRET || "dev-only-insecure-secret";
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET must be set in production");
}

//create express server
const app = express();

//middlewares
app.use(bodyParse.json());
app.use(bodyParse.urlencoded({ extended: true }));

// Set up CORS options
const corsOptions = {
  origin: "http://localhost:3000", // client's URL
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(
  session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 43200000, // 12 hours in milliseconds
    },
  })
);
//cookie parser
app.use(cookieParser(sessionSecret));
//set port
const port = process.env.PORT || 3030;


//define routers
const userRouter = require("./routes/user");
const courseRouter = require("./routes/courses");
const todoRoutes = require("./routes/todo");

//connect the database
mongoose
  .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

//passport init

app.use(passport.initialize());
app.use(passport.session());



//body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

// router
app.use("/user", userRouter);
app.use("/courses", courseRouter);
app.use("/todos", todoRoutes);

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
        return res.redirect("/user/logout"); 
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
