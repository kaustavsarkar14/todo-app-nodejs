const express = require("express");
const mongoose = require("mongoose");
let ejs = require("ejs");
require("dotenv").config();

// constants
const app = express();
const PORT = process.env.PORT || 8000;

// middlewares
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.log(err));

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  res.send(req.body);
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  res.send("login suceess");
});

app.listen(PORT, () => {
  console.log("server is running on : " + PORT);
});
