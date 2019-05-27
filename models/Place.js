var mongoose = require("mongoose");

var placeSchema = new mongoose.Schema({
     //Name Of Campgound
    name: {
        type: String,
        required: true,
    },

    //Image For Campground
    image: {
        type: String,
        required: true,
    },

    //Campground Description
    description: {
        type: String,
        required: true,
    },
    
    
     //Google Maps + Geocode Data

    //Location - Lat + Lng = Location
    location: {
        type: String,
        required: true,
    },
    
        //latitude
        lat: {
            type: Number,
            required: true,
        },
    
        //Longitude
        lng: {
            type: Number,
            required: true,
        },

    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    
        
});



module.exports = mongoose.model("place", placeSchema);




