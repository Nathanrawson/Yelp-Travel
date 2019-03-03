var mongoose = require("mongoose");

var citySchema = new mongoose.Schema({
    name: String,
    image: String,
    imageId: String,
    
    description: String,
    location: String,
    lat: Number,
    Lng: Number,
    
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
            ref:"comment"
        }
        ]
});



module.exports = mongoose.model("City", citySchema);