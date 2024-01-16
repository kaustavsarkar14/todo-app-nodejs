const express = require("express");
const mongoose = require("mongoose");
let ejs = require("ejs");
require("dotenv").config();

// constants
const app = express();
const PORT = process.env.PORT || 8000;
// file imports
const { cleanUpAndValidate } = require("./utils/authUtils");
const userModel = require("./models/userModel");
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

app.post("/register", async (req, res) => {
  try {
    await cleanUpAndValidate(req.body);
  } catch (error) {
    return res.send({
      status: 400,
      message: error,
    });
  }
  try {
    const userWithSameEmail = await userModel.findOne({
      email: req.body.email,
    });
    if (userWithSameEmail)
      return res.send({
        status: 500,
        message: "user with the email already exists",
      });
    const userWithSameUsername = await userModel.findOne({
      username: req.body.username,
    });
    if (userWithSameUsername)
      return res.send({
        status: 500,
        message: "username is taken",
      });
  } catch (error) {
    console.log(error);
  }
  try {
    const userObj = new userModel(req.body);
    await userObj.save();
    return res.send({
      status: 201,
      message: "registation successful",
      data: userObj,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "database error",
      data: error,
    });
  }
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
