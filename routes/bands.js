var express = require("express");
var router = express.Router({mergeParams: true});
var Band = require("../models/band");
var User = require("../models/user");
var middlewareObj = require("../middleware");


//BAND PAGE
router.get("/", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "User could not be found");
            res.redirect("back");
        } else {
        Band.find({}, function(err, allBands){
            if(err) {
                console.log(err);
            } else {
                res.render("bands/profile", {bands: allBands, user: foundUser});
            }
        });
        }
    });
});

//CREATE NEW BAND
router.post("/", middlewareObj.isLoggedIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newBand = {name: name, image: image, description: desc, author: author}
    Band.create(newBand, function(err, newlyCreated){
        if(err) {
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
            req.flash("success", "Successfuly created post")
            res.redirect("/media");
        }
    });
});

//ADD NEW BAND
router.get("/new", middlewareObj.isLoggedIn, function(req, res){
    res.render("bands/new");
});

//SHOW MODE DETAIL
router.get("/:id", function(req, res){
    Band.findById(req.params.id).populate("comments").exec(function(err, foundBand){
        if(err || !foundBand) {
            req.flash("error", "Band not found");
            res.redirect("back");
        } else {
            res.render("bands/show", {band: foundBand});
        }
    });
});

//EDIT BAND
router.get("/:id/edit", middlewareObj.checkBandOwnership, function(req, res){
        Band.findById(req.params.id, function(err, foundBand){
            if(err || !foundBand){
                req.flash("error", "Band not found");
                res.redirect("/media");
            } else {
            res.render("bands/edit", {band: foundBand})
        }
    });
});


//UPDATE BAND
router.put("/:id", middlewareObj.checkBandOwnership, function(req, res){
    Band.findByIdAndUpdate(req.params.id, req.body.band, function(err, updatedBand){
        if(err){
            res.redirect("/media");
        } else {
            req.flash("success", "Successfuly edited post")
            res.redirect("/media/" + req.params.id);
        }
    })
});

// DESTROY BAND ROUTE
router.delete("/:id", middlewareObj.checkBandOwnership, function(req, res){
    Band.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/media");
        } else {
            req.flash("success", "Post deleted")
            res.redirect("/media");
        }
    });
});


module.exports = router;