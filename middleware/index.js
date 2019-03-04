var Band = require("../models/band");
var User = require("../models/user");
var Comment = require("../models/comment");
var Track = require("../models/track");

var middlewareObj = {};

middlewareObj.checkBandOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Band.findById(req.params.id, function(err, foundBand){
            if(err || !foundBand){
                req.flash("error", "Band not found")
                res.redirect("back");
            } else {
                if(foundBand.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that")
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that")
        res.redirect("back");
    }
}

middlewareObj.checkTrackOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        User.findById(req.params.id, function(err, foundUser){
            if(err || !foundUser){
                req.flash("error", "User not found")
                res.redirect("back");
            } else {
                Track.findById(req.params.track_id, function(err, foundTrack){
                    if(err || !foundTrack){
                        req.flash("error", "Track not found");
                        res.redirect("back");
                    } else {
                        if(foundTrack.author.id.equals(req.user._id)){
                            next();
                        } else {
                            req.flash("error", "You do not have permission to do that");
                            res.redirect("back");
                        }
                    }
                });
            }
        });
        
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}


middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                //does user own the comment?
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that")
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that")
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that")
    res.redirect("/login");
}

module.exports = middlewareObj;