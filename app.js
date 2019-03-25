const express       = require("express"),
      app           = express(),
      bodyParser    = require("body-parser"),
      http          = require("http"),
      port          = process.env.PORT || 3000,
      mongoose      = require("mongoose"),
      flash         = require("connect-flash"),
      passport      = require("passport"),
      localStrategy = require("passport-local"),
      methodOverride = require("method-override"),
      expressSession = require("express-session"),
      Track         = require("./models/track"),
      Comment       = require("./models/comment"),
      User          = require("./models/user"),
      Path          = require("path"),
      multer        = require("multer");
      






//REQUIRING ROUTES
var indexRoutes     = require("./routes/index"),
    commentRoutes   = require("./routes/comments"),
    userRoutes      = require("./routes/users");

var url = process.env.DATABASEURL || "mongodb://localhost:27017/dead_drop_productions";
mongoose.connect(url, { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public" ));
app.use(methodOverride("_method"));
app.use(flash());


//PASSPORT CONFIGURATION
app.use(expressSession({
    secret: "This too shall pass",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/users", userRoutes);


app.listen(port, function(){
    console.log(`DDP app listening on port ${port}!`);
});