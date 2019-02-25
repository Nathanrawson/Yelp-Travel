var express = require("express");
var router = express.Router({mergeParams: true});
var City = require("../models/city");
var Comment = require("../models/comment");
var middleware = require("../middleware");




// ================
//comment routees
// =================

router.get("/new", middleware.isLoggedIn, function(req, res){
City.findById(req.params.id, function(err, city){
    if(err){
    console.log(err);
}else {
     
    res.render("comments/new", {city: city});
     }
  });

});

router.post("/",  middleware.isLoggedIn, function(req, res){
    //lookup city
    City.findById(req.params.id, function(err, city){
       if(err){
           console.log(err);
           res.redirect("/cities");
       } else {
           Comment.create(req.body.comment, function(err, comment){
               if(err){
                   console.log(err);
               } else {
                   //Add username and id to comment
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                 
                   //save comment
                   comment.save();
                   city.comments.push(comment);
                   city.save();
                   console.log(comment);
                   req.flash("success", "Comment Added");
                   res.redirect('/cities/' + city._id);
               }
           });
       }
    });
    //create new comment
    //connect new comment to city
    //redirect city show page
});

//comments edit route
router.get("/:comment_id/edit", function(req, res){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            }else {
                res.render("comments/edit",{city_id: req.params.id, comment:foundComment});
            }
        });
   
});

//comments update ropute
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //logic
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
            console.log(err);
        }else {
            res.redirect("/cities/" + req.params.id );
        }
    });
});


router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
 Comment.findByIdAndRemove(req.params.comment_id, function(err){{
     if (err){
          res.redirect("back");
     } else {
         res.redirect("back");
     }
 }});
});
//middleware




module.exports = router;