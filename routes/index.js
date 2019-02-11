var express = require("express");
var router = express.Router({mergeParams: true});
var User = require("../models/user");
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
    var newUser = new User({username: req.body.username, fullName: req.body.fullName, performingAs: req.body.performingAs, email: req.body.email});
    User.register(newUser, req.body.password, function(err, user){
        if(err) {
            req.flash("error", err.message)
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to dead DROP Productions " + user.username);
            res.redirect("/media");
        });
    });
});

//SHOW LOGIN FORM
router.get("/login", function(req, res){
    res.render("login");
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/media",
        failureRedirect: "/login"
    }), function(req, res){

});

//LOGOUT ROUTE
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!")
    res.redirect("/");
});



module.exports = router;