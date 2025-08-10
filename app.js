const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const listings=require("./routes/listing.js");
const reviews = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy=require("passport-local");
const User = require("./models/user.js");
const users = require("./routes/user.js");
require('dotenv').config();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave : false,
  saveUninitialized : true,
  cookie : {
    expires: Date.now()+7*24*60*60*1000,
    maxAge : 7*24*60*60*1000,
    httpOnly : true
  }
};

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res) => {
  res.send("hello world");
});
app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.failure=req.flash("failure");
  res.locals.currUser = req.user;
  next();
})

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
app.use("/",users);


app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went wrong!"} = err;
  res.status(statusCode).render("error.ejs",{message});
});

app.listen(8080, () => {
  console.log("server is active");
});
