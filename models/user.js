var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    fullName: String,
    performingAs: String,
    email: String,
    password: String,
    tracks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Track"
        }
    ]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);