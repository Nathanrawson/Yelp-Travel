
var express = require("express");
var router = express.Router({mergeParams: true});
var City = require("../models/city");
var middleware = require("../middleware");

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
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.city.image = result.secure_url;
      // add image's public_id to campground object
      req.body.city.imageId = result.public_id;
      // add author to campground
      req.body.city.author = {
        id: req.user._id,
        username: req.user.username
      };
      City.create(req.body.city, function(err, city) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/cities/' + city.id);
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
router.put("/:id", upload.single('image'), function(req, res){
    City.findById(req.params.id, async function(err, city){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(city.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  city.imageId = result.public_id;
                  city.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            city.name = req.body.city.name;
            city.description = req.body.city.description;
            city.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/cities/" + city._id);
        }
    });
});

// Destroy City route
router.delete('/:id', function(req, res) {
  City.findById(req.params.id, async function(err, city) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(city.imageId);
        city.remove();
        req.flash('success', 'City deleted successfully!');
        res.redirect('/city');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

//middleware

module.exports = router;


