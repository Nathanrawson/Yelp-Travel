

var Place = require("../models/Place");
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











// ================
//comment routees
// =================



router.get("/", function (req, res) {
City.findById(req.params.id).populate("places").exec(function (err, foundCity) {
    
    
        if (err) {
            console.log(err);
        } else {
            
            City.find({}, function(err, allPlaces){
     if(err){
         console.log(err);
     } else {
          res.render("Places/index", {city: foundCity, places: allPlaces, currentUser: req.user});
     }
});
          
        }
        
        });
        });

 









    

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
      var newPlace = {name: name, price: price, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
      
      City.findById(req.params.id, function(err, city){
  
  if(err){
          console.log(err);
          res.redirect("/cities");
      } else {
      
      // Create a new campground and save to DB
      Place.create(newPlace, function(err, newPlace){
          
       if(err){
                  console.log(err);
              } else {
                  //Add username and id to comment
                  newPlace.author.id = req.user._id;
                   newPlace.author.username = req.user.username;
                 
                  //save comment
                  newPlace.save();
                  city.places.push( newPlace);
                  city.save();
                  console.log( newPlace);
                  req.flash("success", "Place Added");
                  res.redirect('/cities/' + city._id);
        }
      });
      
    }
  });
});
});
});



router.get("/new", middleware.isLoggedIn, function(req, res){
City.findById(req.params.id, function(err, city){
    if(err){
    console.log(err);
}else {
     
    res.render("Places/new", {city: city});
     }
  });

});

router.get("/:_id", function (req, res) {
Place.findById(req.params.id, function (err, foundPlace) {
        if (err) {
            console.log(err);
        } else {
 
            
 
            res.render("Places/show", {place: foundPlace});
        }
    });
});

// router.post("/", upload.single('image'), function(req, res){

     
//      cloudinary.uploader.upload(req.file.path, function(err, result) {
         
         
         
//     //lookup city
//          if(err) {
//              console.log(err);
      
        
//       }   
       
//       req.body.Place.image = result.secure_url;
//       // add image's public_id to campground object
//       req.body.Place.imageId = result.public_id;
//       // add author to campground
//       req.body.Place.author = {
//         id: req.user._id,
//         username: req.user.username
        
//       };
      
//       City.findById(req.params.id, function(err, city){
  
//   if(err){
//           console.log(err);
//           res.redirect("/cities");
//       } else {
//       Place.create(req.body.place, function(err, place){
               
//               if(err){
//                   console.log(err);
//               } else {
//                   //Add username and id to comment
//                   place.author.id = req.user._id;
//                   place.author.username = req.user.username;
                 
//                   //save comment
//                   place.save();
//                   city.places.push(place);
//                   city.save();
//                   console.log(place);
//                   req.flash("success", "Place Added");
//                   res.redirect('/cities/' + city._id);
//               }
//           });
//       }
       
//       });
//     });

//     });
    




















module.exports = router;
