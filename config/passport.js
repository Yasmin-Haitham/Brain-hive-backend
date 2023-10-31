const LocalStrategy = require("passport-local").Strategy;
const User = require("../schemas/user");
const bcrypt = require("bcrypt");

//implement strategy
module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email", // Assuming you're using email as the username field
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          const user = await User.findOne({ Email: username });

          if (!user) {
            return done(null, false, { message: "Incorrect email." });
          }

          const isPasswordValid = await bcrypt.compare(password, user.Password);

          if (isPasswordValid) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Incorrect password." });
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  //serialize user
  passport.serializeUser((user, done) => done(null, user.id));

  //deserialize user
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
};
