var mongoose = require("mongoose");

var trackSchema = new mongoose.Schema({
    title: String,
    tempo: Number,
    mixNotes: String,
    extraInfo: String,
    upload: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Track", trackSchema);