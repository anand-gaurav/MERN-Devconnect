const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");

const posts = require("./routes/api/posts");
const profile = require("./routes/api/profile");
const users = require("./routes/api/users");

const app = express();

//Body parser middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

const db = require("./config/keys").mongoURI;

//Connect to mongo db

mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("Mongo DB connected"))
  .catch(error => console.log("Error connecting mongo db", error));

//Passport middleware
app.use(passport.initialize());
//Passport config
require("./config/passportConfig")(passport);

app.use("/api/posts", posts);
app.use("/api/profile", profile);
app.use("/api/users", users);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
