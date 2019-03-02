var express = require("express");
var router = express.Router({mergeParams: true});
var User = require("../models/user");
var Band = require("../models/band");
var passport = require("passport");

    router.get("/:id", function(req, res){
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
                res.render("users/profile", {user: foundUser, bands: foundBand});
                    }
            });
        }
        });
    });

    module.exports = router;