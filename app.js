require('dotenv').config();
var express = require("express");
var app= express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose" );
var City = require("./models/city");
//var comment = require("./models/comment");
//var seedDB = require("./seeds"); 
var Comment = require("./models/comment");
var passport = require("passport");
var LocalStratergy = require("passport-local");
var User = require("./models/user");
var methodOverride = require("method-override");
var flash = require ("connect-flash");



//requring routes
var commentRoutes = require("./routes/comments"),
    cityRoutes    = require("./routes/cities"),
    indexRoutes   = require("./routes");
    


//mongoose.connect("mongodb://localhost/yelp_travel", { useNewUrlParser: true });
mongoose.connect("mongodb+srv://nathanrawson:Manoff123@cluster0-caq63.mongodb.net/test?retryWrites=true", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();


//pasport configuration
app.use(require("express-session")({
   secret: "Once again Nathan is a G", 
   resave: false,
   saveUninitialized: false
    
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user; 
   res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/cities",cityRoutes);
app.use("/cities/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp server is doing its ting");
});

