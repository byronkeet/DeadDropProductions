var express = require("express");
var router = express.Router({mergeParams: true});
var User = require("../models/user");
var Band = require("../models/band");
var passport = require("passport");

//HOME PAGE - ROOT ROUTE
router.get("/", function(req, res){
    res.render("landing");
});

//ABOUT PAGE
router.get("/about", function(req, res){
    res.render("about");
});

//DROP PAGE
router.get("/drop", function(req, res){
    res.render("drop");
});

//RATES PAGE
router.get("/rates", function(req, res){
    res.render("rates");
});

//AUTH ROUTES

//SHOW REGISTER FROM
router.get("/register", function(req, res){
    res.render("register");
});

//HANDLE SIGN UP LOGIC
router.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username, 
        fullName: req.body.fullName, 
        performingAs: req.body.performingAs, 
        email: req.body.email
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err) {
            req.flash("error", err.message)
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to dead DROP Productions " + user.username);
            res.redirect('/users/' + user.id);
        });
    });
});

//SHOW LOGIN FORM
router.get("/login", function(req, res){
    res.render("login");
});

router.post("/login", function(req, res, next) {
    passport.authenticate("local", function(err, user, info) {
      if (err) { 
        req.flash("error", "Something went wrong");  
        return next(err); 
      }
      if (!user) { 
        req.flash("error", "Username and Password do not match");  
        return res.redirect("/login"); 
      }
      req.logIn(user, function(err) {
        if (err) { 
            req.flash("error", "Something went wrong");
            return next(err); 
        }

        return res.redirect("/users/" + user.id);
      });
    })(req, res, next);
  });

//LOGOUT ROUTE
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!")
    res.redirect("/");
});

router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "User could not be found");
            res.redirect("back");
        } else {
            Band.find().where("author.id").equals(foundUser._id).exec(function(err, foundBand){
                if(err || !foundBand){
                    req.flash("error", "Band not found");
                    res.redirect("/media");
                } else {
            res.render("users/show", {user: foundUser, bands: foundBand});
                }
        });
    }
    });
});

module.exports = router;