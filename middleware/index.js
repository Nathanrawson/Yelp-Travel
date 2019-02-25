//all the middleware goes here
var City = require("../models/city");
var Comment = require("../models/comment");
var middlewareObj = {};


middlewareObj.checkCityOwnership = function(req, res, next){
    
     if(req.isAuthenticated()){
       
          City.findById(req.params.id, function(err, foundCity){
    
    if(err){
        res.redirect("back");
    } else {
        
        // Added block to check if city exists
        if (!foundCity) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
          // does the user own the city
          if(foundCity.author.id.equals(req.user._id)) {
               next();
          
          } else {
               res.redirect("back");
             
              
          }
       }
 });
    } else {
        console.log("you need to be logged in burt");
        res.redirect("back");
    }
}; 


middlewareObj.checkCommentOwnership = function (req, res, next){
    
     if(req.isAuthenticated()){
       
          Comment.findById(req.params.comment_id, function(err, foundComment){
    
    if(err){
        res.redirect("back");
    } else {
          // does the user own the city
          if(foundComment.author.id.equals(req.user._id)) {
               next();
          
          } else {
               res.redirect("back");
             
              
          }
       }
 });
    } else {
        console.log("you need to be logged in burt");
        res.redirect("back");
    }
};
    

middlewareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First!");
    res.redirect("/login");
};


module.exports = middlewareObj;

