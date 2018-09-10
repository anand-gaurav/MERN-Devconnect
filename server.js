const express = require("express");
const mongoose = require("mongoose");

const posts = require("./routes/api/posts");
const profile = require("./routes/api/profile");
const users = require("./routes/api/users");

const app = express();

const db = require("./config/keys").mongoURI;

//Connect to mongo db

mongoose
  .connect(db)
  .then(() => console.log("Mongo DB connected"))
  .catch(error => console.log("Error connecting mongo db", error));

app.get("/", (req, res) => res.send("Hello World "));

app.use("/api/posts", posts);
app.use("/api/profile", profile);
app.use("/api/users", users);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
