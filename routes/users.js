var express = require("express");
var router = express.Router({mergeParams: true});
var User = require("../models/user");
var Comment = require("../models/comment");
var Track = require("../models/track");
var passport = require("passport");
var middlewareObj = require("../middleware");
var multer = require("multer");
var stream = require("stream");
var upload = require("../config/multer.config");
var s3 = require("../config/s3.config");
var awsWorker = require("../controllers/aws.controller");



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

function extendTimeout (req, res, next) {
    res.setTimeout(86400000, function () { console.log('Request has timed out.');
    res.send(408);});
    next();
  };

//CREATE NEW TRACK
router.post("/:id/tracks/", extendTimeout, upload.single("file"),  function(req, res){
    var s3Client = s3.s3Client;
    var params = s3.uploadParams;
    
    params.Key = req.file.originalname;
    params.Body = req.file.buffer;
        
    s3Client.upload(params, (err, data) => {
        if (err) {
            req.flash("error", "No File Selected!");
            res.redirect("back");
        } else {
            if(req.file == undefined){
                req.flash("error", "No File Selected");
                res.render("users/new");
            } else {
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
                        });
                    }
                });  
            }
        }
    });
});

//TRACK DETAIL PAGE
router.get("/:id/tracks/:track_id", middlewareObj.checkTrackOwnership, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err || !foundUser){
            req.flash("error", "User could not be found");
            res.redirect("back");
        } else {
            Track.findById(req.params.track_id).populate("comments").exec(function(err, foundTrack){
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

//TRACK DELETE ROUTE
router.delete("/:id/tracks/:track_id/", middlewareObj.checkTrackOwnership, function(req, res){
    Track.findByIdAndRemove(req.params.track_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Track deleted");
            res.redirect("/users/" + req.params.id);
        }
    });
});

//ADD NEW COMMENT ROUTE
router.get("/:id/tracks/:track_id/comments/new", function(req, res){
    Track.findById(req.params.track_id, function(err, track){
        if(err || !track){
            req.flash("error", "Track not found");
            res.redirect("back");
        } else {
            res.render("comments/new", {track: track});
        }
    });
});

//CREATE COMMENT ROUTE
router.post("/:id/tracks/:track_id/comments", function(req, res){
    Track.findById(req.params.track_id, function(err, foundTrack){
        if(err || !foundTrack){
            req.flash("error", "Track not found");
            res.redirect("back");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err || !comment) {
                    req.flash("error", "Something went wrong");
                    res.redirect("back");
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    console.log(comment);
                    foundTrack.comments.push(comment);
                    foundTrack.save();
                    console.log(foundTrack);
                    req.flash("success", "Successfuly created comment");
                    res.redirect("/users/" + req.params.id + "/tracks/" + foundTrack._id);
                }
            });
        }
    });
});

//COMMENT DELETE ROUTE
router.delete("/:id/tracks/:track_id/comments/:comment_id", middlewareObj.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/users/" + req.params.id + "/tracks/" + req.params.track_id);
        }
    });
});


module.exports = router;