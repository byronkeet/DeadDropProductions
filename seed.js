var mongoose = require("mongoose");
var Band = require("./models/band");
var Comment = require("./models/comment");

var data = [
    {
        name: "Tim Tim Band", 
        image: "https://images.unsplash.com/photo-1495582699501-4dc05e58b69f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
        description: "Best double name band in the universe"
    },
    {
        name: "Skreemo", 
        image: "https://images.unsplash.com/photo-1477611160464-0b9fb6404529?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "They yell like hell"
    },
    {
        name: "Start The Tinder", 
        image: "https://images.unsplash.com/photo-1512140528825-526de61a5bcb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "This band knows how to pull the cheeeeeks"
    }
]

function seedDB(){
    //Remove all bands
    Band.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed bands");
        //Remove all comments
        Comment.remove({}, function(err){
            if(err){
                console.log(err);
            }
            console.log("removed comments");
            //Add a few bands
            data.forEach(function(seed){
                Band.create(seed, function(err, band){
                    if(err){
                        console.log(err);
                    } else {
                        console.log("added a band");
                        //Create comments
                        Comment.create(
                            {
                                text: "So rad they gave me tinitus!",
                                author: "Listener_69"
                            }, function(err, comment){
                                if(err){
                                    console.log(err);
                                } else {
                                    band.comments.push(comment);
                                    band.save();
                                    console.log("created new comment");
                                }
                            });
                    }
                });
            });
        });
    });
}

module.exports = seedDB;