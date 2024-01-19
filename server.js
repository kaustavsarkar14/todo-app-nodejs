const express = require("express");
const mongoose = require("mongoose");
let ejs = require("ejs");
require("dotenv").config();
const bcrypt = require("bcrypt");
const validator = require("validator");
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session);
// constants
const app = express();
const PORT = process.env.PORT || 8000;
const store = new mongodbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});
const isAuth = require("./middleware/isAuth");
// file imports
const { cleanUpAndValidate } = require("./utils/authUtils");
const userModel = require("./models/userModel");
const todoModel = require("./models/todoModels");
// middlewares
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.log(err));
app.get('/',isAuth, (req, res)=>{
  res.redirect('/dashboard')
})
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
    const hashedPassword = await bcrypt.hash(
      req.body.password,
      Number(process.env.SALT)
    );
    const userObj = new userModel({ ...req.body, password: hashedPassword });
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
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.send({
      status: 400,
      message: "username/password cannot be empty",
    });
  let user;
  if (validator.isEmail(username)) {
    user = await userModel.findOne({ email: username });
    if (!user)
      return res.send({
        status: 400,
        message: "user with the email not found",
      });
  } else {
    user = await userModel.findOne({ username });
    if (!user)
      return res.send({
        status: 400,
        message: "user with the username not found",
      });
  }
  const isMatched = await bcrypt.compare(password.toString(), user.password);
  if (!isMatched) return res.send({ status: 400, message: "wrong password" });
  req.session.isAuth = true;
  req.session.user = user;
  res.redirect("/dashboard")
});
app.get("/dashboard", isAuth, (req, res) => {
  res.render("dashboard");
});
app.post("/logout", isAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send({
        status: 500,
        message: "there was some problem in logout",
      });
    }
    return res.redirect("/login");
  });
});
app.post("/logout-from-all", isAuth, async (req, res) => {
  const sessionsSchema = new mongoose.Schema(
    { _id: String },
    { strict: false }
  );
  const sessionsModel = mongoose.model("session", sessionsSchema);
  try {
    const deleteDb = await sessionsModel.deleteMany({
      "session.user.username": req.session.user.username,
    });
    if (deleteDb)
      return res.send({ status: 200, message: "logged out from all" });
  } catch (err) {
    console.log(err);
    return res.send({ status: 500, message: "database error" });
  }
});
app.post("/create-todo", isAuth, async (req, res) => {
  const todoText = req.body.todo;
  const username = req.session.user.username;
  if (!todoText || todoText == "")
    return res.send({ status: 400, message: "todo is empty" });
  try {
    const todoObj = new todoModel({ todoText, username });
    const todoDoc = await todoObj.save();
    res.send({ status: 201, message: "todo created", data: todoDoc });
  } catch (error) {
    console.log(error);
    res.send({ status: 500, message: "database error", error: error });
  }
});
app.post("/edit-todo", isAuth, async (req, res) => {
  const { id, newText } = req.body;
  try {
    const todo = await todoModel.findOne({ _id: id });
    if (!todo) res.send({ status: 400, message: "todo not found" });
    if (todo.username != req.session.user.username)
      res.send({ status: 400, message: "unauthorized request" });
    try {
      const updateDoc = await todoModel.findOneAndUpdate({_id:id}, {todoText:newText})
      return res.send({status:200, message:"todo edited", data:updateDoc})
    } catch (error) {
      console.log(error)
      return res.send({ status: 500, message: "database error" });
    }
  } catch (error) {
    return res.send({ status: 500, message: "database error" });
  }
});
app.get('/get-todo',isAuth,async (req, res)=>{
  try {
    const todos = await todoModel.find({username:req.session.user.username})
    res.send(todos)
  } catch (error) {
    
  }
})
app.listen(PORT, () => {
  console.log("server is running on : " + PORT);
});
