const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const dbURI = require("./config/keys").mongoURI;
mongoose.connect(
  encodeURI(dbURI),
  { useNewUrlParser: true }
);
const db = mongoose.connection;
db.on("error", error => {
  console.log("MongoDB error :", error);
});
db.once("open", function() {
  console.log("Mongoose connected");
});
// mongoose
//   .connect(encodeURI(db))
//   .then(() => console.log("Mongo DB connected"))
//   .catch(error => console.log("Error connecting mongo db", error));

// Passport middleware
app.use(passport.initialize());

// Passport Config
require("./config/passportConfig")(passport);

// Use Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

// Server static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
