//jshint esversion: 6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const findOrCreate = require("mongoose-findorcreate");


const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
}));


app.use(passport.initialize());
app.use(passport.session());

app.listen(process.env.PORT || 3000, function() {
  console.log("hello there.");
});

password = process.env.PASSWORD;

mongoose.connect("mongodb+srv://admin-jonas:"+password+"@cluster0.uajgt.mongodb.net/userDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  list: Array,
  googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

var User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://web-production-291e.up.railway.app/auth/google/list",
    passReqToCallback: true,
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(request, accessToken, refreshToken, profile, done) {
    User.findOrCreate({ googleId: profile.id, username: profile.emails[0].value },{list: ["Example","Hit the Plus button to add New Item","<--Click here to delete item"]}, {saveIfFound: false}, function (err, user) {
      return done(err, user);
    });
  }
));

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/login", function(req, res) {
  if (req.isAuthenticated()){
    res.redirect("/list");
  }else{
    res.render("login");
  }
});

app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if (err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/list");
      });
    }
  });
});

app.get("/register", function(req, res) {
  res.render("register");
});


app.post("/register", function(req, res) {
  User.register({username: req.body.username},req.body.password ,function(err ,user){
    if (err){
      console.log(err);
      res.redirect("/register");
    }else{
      user.list=["Example","Hit the Plus button to add New Item","<--Click here to delete item"];
      user.save();
      passport.authenticate("local")(req, res, function(){
        res.redirect("/list");
      });
    }
  });
});

app.get("/auth/google",
  passport.authenticate("google", { scope:
      ["profile","email" ] }
));

app.get( "/auth/google/list",
    passport.authenticate( "google", {
        successRedirect: "/list",
        failureRedirect: "/login"
}));

app.get("/list", function(req, res){
  if(req.isAuthenticated()){
    User.findById(req.user.id, function(err, result){
      if(err){
        console.log(err);
      }else{
        listItem = result.list;
        res.render("list",{newListItem: result.list});
      }
    });
  }else{
    res.redirect("/");
  }
});


app.post("/submit",function(req, res){
  User.findById(req.user.id, function(err, result){
    if(err){
      console.log(err);
    }else{
      listItem.push(req.body.newItem);
      result.list=listItem;
      result.save();
      res.redirect("/list");
    }
  });
});

app.post("/delete", function(req, res){
  let index = listItem.indexOf(req.body.checkbox);
  listItem.splice(index,1);
  User.findById(req.user.id, function(err, result){
    if(err){
      console.log(err);
    }else{
      result.list=listItem;
      result.save();
      res.redirect("/list");
    }
  });
});

app.get("/logout",function(req, res){
  req.logout();
  res.redirect("/");
});
