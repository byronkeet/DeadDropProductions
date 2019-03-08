var express = require("express");
var router = express.Router({mergeParams: true});
var Comment = require("../models/comment");
var middlewareObj = require("../middleware");

//COMMENT ROUTES
//COMMENT NEW ROUTE
router.get("/new", middlewareObj.isLoggedIn, function(req, res){
    Band.findById(req.params.id, function(err, band){
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {band: band});
        }
    });
});

//COMMENT CREATE ROUTE
router.post("/", middlewareObj.isLoggedIn, function(req, res){
    Band.findById(req.params.id, function(err, band){
        if(err) {
            req.flash("error", "Band not found")
            res.redirect("/");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong")
                    console.log(err);
                } else {
                    //add id and username to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    band.comments.push(comment);
                    band.save();
                    req.flash("success", "Successfuly created comment")
                    res.redirect("/media/" + band._id);
            }
            });
        }
    })
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middlewareObj.checkCommentOwnership, function(req, res){
    Band.findById(req.params.id, function(err, foundBand){
        if(err || !foundBand){
            req.flash("error", "Band not found");
            return req.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {band_id: req.params.id, comment: foundComment});
            }
        });
    });
    
});

//COMMENT UPDATE ROUTE
router.put("/:comment_id", middlewareObj.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/media/" + req.params.id);
        }
    });
});

//COMMENT DELETE ROUTE
router.delete("/:comment_id", middlewareObj.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/media/" + req.params.id);
        }
    });
});


module.exports = router;

