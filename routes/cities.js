
var express = require("express");
var router = express.Router({mergeParams: true});
var City = require("../models/city");
var middleware = require("../middleware");
var NodeGeocoder = require("node-geocoder");

var options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
    
};


var geocoder = NodeGeocoder(options);
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
     
};
var API = ("jWecDPH-PWHErrEr-DSbddugIrM");
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
 cloud_name: 'dng8alzfo', 
  api_key:process.env.CLOUDINARY_API_KEY , 
 
  api_secret:  process.env.CLOUDINARY_API_SECRET
});

//index = show all cities

router.get("/", function(req, res){
// get all cities from DB
 City.find({}, function(err, allCities){
     if(err){
         console.log(err);
     } else {
         res.render("cities/index" ,{cities: allCities, currentUser: req.user});
     }
     
 });
});


//res.render("cities" ,{cities:cities});
//CREATE ROUTE
//put all this code inside of the Geocoder call back for google maps 
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  
  geocoder.geocode(req.body.location, function (err, data) {
    cloudinary.uploader.upload(req.file.path, function(result) {
      // add cloudinary url for the image to the campground object under image property
      image = result.secure_url;
 
      if (err || !data.length) {
          console.log(err);
        req.flash('error', 'Invalid address');
        return res.redirect('back');
      }
      
      var lat = data[0].latitude;
      var lng = data[0].longitude;
      var location = data[0].formattedAddress;
      var newCity = {name: name, price: price, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
      
      // Create a new campground and save to DB
      City.create(newCity, function(err, newlyCreated){
        if(err){
          console.log(err);
        } else {
          //redirect back to campgrounds page
          console.log(newlyCreated);
          res.redirect("/city");
        }
      });
    });
  });
});

router.get("/new" ,middleware.isLoggedIn, function(req, res){
    res.render("cities/new");
});

// shows - more info about one city

router.get("/:id", function (req, res) {
City.findById(req.params.id).populate("comments").exec(function (err, foundCity) {
        if (err) {
            console.log(err);
        } else {
 
            if (!foundCity) {
                return res.status(400).send("Item not found.");
            }
 
            res.render("cities/show", {city: foundCity});
        }
    });
});

   


// Edit City Route
router.get("/:id/edit" , middleware.checkCityOwnership,function(req, res){
          City.findById(req.params.id, function(err, foundCity){
                if(err){
        res.redirect("/cities");
                }else {
               res.render("cities/edit", {city: foundCity});
                }
          });

 });

// Update City Route
router.put("/:id", middleware.checkCityOwnership, upload.single("image"), function (req, res) {

    geocoder.geocode(req.body.city.location, function (err, data) {

        //Error Handling For Autocomplete API Requests

        //Error handling provided by google docs -https://developers.google.com/places/web-service/autocomplete 
        if (err || data.status === 'ZERO_RESULTS') {
            req.flash('error', 'Invalid address, try typing a new address');
            return res.redirect('back');
        }

        //Error handling provided by google docs -https://developers.google.com/places/web-service/autocomplete 
        if (err || data.status === 'REQUEST_DENIED') {
            req.flash('error', 'Something Is Wrong Your Request Was Denied');
            return res.redirect('back');
        }

        //Error handling provided by google docs -https://developers.google.com/places/web-service/autocomplete 
        if (err || data.status === 'OVER_QUERY_LIMIT') {
            req.flash('error', 'All Requests Used Up');
            return res.redirect('back');
        }

        //Credit To Ian For Fixing The Geocode Problem - https://www.udemy.com/the-web-developer-bootcamp/learn/v4/questions/2788856
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;

        cloudinary.uploader.upload(req.file.path, function (result) {
            if (req.file.path) {
                // add cloudinary url for the image to the campground object under image property
                req.body.city.image = result.secure_url;
            }

            var newData = { name: req.body.city.name, image: req.body.city.image, description: req.body.city.description, price: req.body.city.price, location: location, lat: lat, lng: lng };


            //Updated Data Object
            City.findByIdAndUpdate(req.params.id, { $set: newData }, function (err, city) {
                if (err) {
                    //Flash Message
                    req.flash("error", err.message);

                    //Redirects Back
                    res.redirect("back");
                }
                else {
                    //Flash Message
                    req.flash("success", "Successfully Updated!");

                    //Redirects To Edited Campground
                    res.redirect("/cities/" + city._id);
                }
            }); //End Campground/findBoyIdAndUpdate
        }); //Ends Cloudinary Image Upload
    }); //Ends Geocoder()
}); //Ends Put Router

// Destroy City route
router.delete("/:id", middleware.checkCityOwnership, function (req, res) {
    City.findByIdAndRemove(req.params.id, function (err) {
        if (err) {

            //Redirects To Root Featured Camps 
            res.redirect("/cities");
        }
        else {

            //Redirects To Root Featured Camps 
            res.redirect("/cities");
        }
    });
});


//middleware

module.exports = router;


