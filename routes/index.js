var express = require("express");
var router = express.Router({mergeParams: true});
var User = require("../models/user");
var passport = require("passport");
var nodemailer = require("nodemailer");
var async = require("async");
var crypto = require("crypto");

// configure dotenv
require('dotenv').config();

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
        <p>Hello, Welcome to Dead Drop Productions!</p>
        <p>Thank you for choosing Dead Drop to produce your artist vision, we are really looking forward to creating something great with you.</p>
        <p>Please click the link below to complete registration and authenticate your account.</p>
        <p>http://${req.headers.host}/</p>
        <p>You now have access to your Artist Profile where you can begin uploading your stems to our servers. Our head engineer will be in contact with you once they have been received.</p>
        <p>Please take note of the recording guidelines to make sure you have included all the correct stems for your songs. Download the PDF attached for more info.</p>
        <p>If you have any issues logging in or uploading your stems, please contact our support team at Support@deaddropproductions.net</p>
        `;

    User.register(newUser, req.body.password, function(err, user){
      if(err) {
          req.flash('error', 'Username or Email already exists');
          return res.redirect("/register");
      }
      
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.USER_EMAIL, // generated ethereal user
            pass: process.env.USER_EMAIL_PASSWORD  // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"DDP" <support@deaddropproductions.net>', // sender address
        to: req.body.email, // list of receivers
        subject: 'Welcome to Dead Drop Productions', // Subject line
        html: output, // html body
        attachments: [{
          filename: 'Recording Checklist',
          path: 'http://localhost:3000/downloads/RECORDING%20CHECKLIST.pdf',
          contentType: 'application/pdf'
        }]
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });


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


// FORGOT PASSWORD ROUTE
router.get('/forgot', function(req, res) {
    res.render('forgot');
  });
  
  router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if(err){
            req.flash('error', 'Something went wrong');
            return res.redirect('/forgot');
          }
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          host: 'mail.privateemail.com', 
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
              user: process.env.USER_EMAIL, // generated ethereal user
              pass: process.env.USER_EMAIL_PASSWORD  // generated ethereal password
          }
        });
        var mailOptions = {
          to: user.email,
          from: '"DDP" <support@deaddropproductions.net>',
          subject: 'Dead Drop Productions Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });
  
  //RESET PASSWORD ROUTES
  router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if(err){
            req.flash('error', 'Something went wrong');
            return res.redirect('/forgot');
      }
      if (!user) {
        req.flash('error', 'Password reset link is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {token: req.params.token});
    });
  });
  
  router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if(err){
            req.flash('error', 'Something went wrong');
            return res.redirect('back');
          }
          if (!user) {
            req.flash('error', 'Password reset link is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              if(err){
                req.flash('error', 'Something went wrong');
                return res.redirect('back');
              }
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                if(err){
                  req.flash('error', 'Something went wrong');
                  return res.redirect('back');
                }
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          host: 'mail.privateemail.com', 
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
              user: process.env.USER_EMAIL, // generated ethereal user
              pass: process.env.USER_EMAIL_PASSWORD  // generated ethereal password
          },
          
        });
        var mailOptions = {
          to: user.email,
          from: '"DDP" <support@deaddropproductions.net>',
          subject: 'Dead Drop Productions: Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect("/");
    });
  });


module.exports = router;