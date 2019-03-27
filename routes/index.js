var express = require("express");
var router = express.Router({mergeParams: true});
var User = require("../models/user");
var passport = require("passport");
var nodemailer = require("nodemailer");

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

//MIXES PAGE
router.get("/mixes", function(req, res){
    res.render("mixes");
})

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
    const output = `
        <p>WELCOME TO DEAD DROP PRODUCTIONS</p>
        <h3>${req.body.name}</h3>
        <p>Thank you for signing up with Dead Drop Productions. Please click the link below to authenticate your account.</p>
        <p>http://localhost:3000/</p>
        
    `;
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.yandex.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.USER_EMAIL, // generated ethereal user
            pass: process.env.USER_EMAIL_PASSWORD  // generated ethereal password
        },
        tls:{
        rejectUnauthorized:false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"BK" <keetbis@yandex.com>', // sender address
        to: req.body.email, // list of receivers
        subject: 'Welcome to Dead Drop Productions', // Subject line
        text: 'Hello world?', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
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



module.exports = router;