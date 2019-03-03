var express = require("express");
var router = express.Router({mergeParams: true});
var User = require("../models/user");
var Track = require("../models/track");
var passport = require("passport");
var middlewareObj = require("../middleware");

//PROFILE PAGE ROUTE
router.get("/:id", middlewareObj.isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "User could not be found");
            res.redirect("back");
        } else {
            Track.find().where("author.id").equals(foundUser._id).exec(function(err, foundTrack){
                if(err || !foundUser){
                    req.flash("error", "Track not found");
                    res.redirect("/user/" + req.params.id);
                } else {
            res.render("users/profile", {user: foundUser, tracks: foundTrack});
                }
        });
    }
    });
});

//ADD NEW TRACK
router.get("/:id/tracks/new", middlewareObj.isLoggedIn, function(req, res){
    res.render("users/new");
});

//CREATE NEW TRACK
router.post("/", middlewareObj.isLoggedIn, function(req, res){
    var title = req.body.title;
    var image = req.body.image;
    var tempo = req.body.tempo;
    var mixNotes = req.body.mixNotes;
    var extraInfo = req.body.extraInfo;
    var upload = req.body.upload;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newTrack = {title: title, image: image, tempo: tempo, mixNotes: mixNotes, extraInfo: extraInfo, upload: upload, author: author};
    Track.create(newTrack, function(err, newlyCreated){
        if(err) {
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
            req.flash("success", "Successfuly uploaded track");
            req.redirect("/users/" + req.params.id);
        }
    });
});

module.exports = router;