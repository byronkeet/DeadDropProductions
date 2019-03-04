var express = require("express");
var router = express.Router({mergeParams: true});
var User = require("../models/user");
var Track = require("../models/track");
var passport = require("passport");
var middlewareObj = require("../middleware");

//PROFILE PAGE ROUTE
router.get("/:id", middlewareObj.isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err || !foundUser){
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
router.post("/:id/tracks/", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err || !foundUser){
            req.flash("error", "User not found");
            res.redirect("back");
        } else {
            Track.create(req.body.track, function(err, track){
                if(err || !track){
                    req.flash("error", "Something went worng");
                    res.redirect("back");
                } else {
                    //add id and username to track
                    track.author.id = req.user._id;
                    track.author.username = req.user.username;
                    track.save();
                    foundUser.tracks.push(track);
                    foundUser.save();
                    req.flash("success", "Successfuly created track");
                    res.redirect("/users/" + req.params.id);
                }
            })
        }
    })
})

//TRACK DETAIL PAGE
router.get("/:id/tracks/:track_id", middlewareObj.checkTrackOwnership, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err || !foundUser){
            req.flash("error", "User could not be found");
            res.redirect("back");
        } else {
            Track.findById(req.params.track_id, function(err, foundTrack){
                if(err || !foundTrack){
                    req.flash("error", "Track could not be found");
                    res.redirect("back");
                } else {
                    res.render("users/show", {track: foundTrack, user: foundUser});
                }
            });
        }
    });
});

module.exports = router;