var express=require('express'),
	app=express(),
	bodyParser=require('body-parser'),
	mongoose=require('mongoose'),
	methodOverride=require('method-override'),
	flash=require('connect-flash'),
	passport=require('passport'),
	LocalStrategy=require('passport-local'),
	campground=require('./models/campground'),
	Comment=require('./models/comment'),
	User=require('./models/user'),
	seedDB=require("./seed");


mongoose.connect("mongodb://localhost:27017/Yel_camp", {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(require('express-session')({
	secret:"Ritesh is developing",
	resave: false,
	saveUninitialized: false
}));

//Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
});

//seedDB();
app.set("view engine","ejs");

app.get("/",function(req,res){
	res.render("landing");
});

app.get("/campgrounds",function(req,res){
	campground.find({}, function(err, allcampgrounds){
		if(err){
			console.log(err);
		}
		else{
			res.render("campground/campground",{campgrounds:allcampgrounds});
		}
	});
	
});


app.get("/campgrounds/new", isLoggedIn, function(req, res){
	res.render("campground/new");
});

app.post("/campgrounds", isLoggedIn, function(req, res){
	var name=req.body.name;
	var img=req.body.url;
	var desc=req.body.description;
	var price=req.body.price;
	var author={
		id: req.user._id,
		username: req.user.username
	}
	var newcamp={name:name, image:img, description:desc, author: author, price:price};
	campground.create(newcamp, function(err, newlycreate){
		if(err){
			req.flash("error",err);
			res.render("back");
		}
		else{
			req.flash("success","Campground Created Successfully!!");
			res.redirect("/campgrounds");
		}
	});
	
});


app.get("/campgrounds/:id", function(req, res){
	campground.findById(req.params.id).populate("comments").exec(function(err, campg){
		if(err){
			console.log(err);
		}
		else{
			res.render("campground/show", {campground:campg});
		}
	});
});

//Edit
app.get("/campgrounds/:id/edit",checkCampgroundOwner, function(req, res){
		campground.findById(req.params.id, function(err, foundcampground){
			res.render("campground/edit", {campground:foundcampground});		
	});	
});

//Update
app.put("/campgrounds/:id",checkCampgroundOwner, function(req, res){
	campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, foundcamp){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/campgrounds");
		}
	});
});

//Delete
app.delete("/campgrounds/:id",checkCampgroundOwner, function(req, res){
	campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/campgrounds");
		}
	});
});

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
	campground.findById(req.params.id, function(err, camp){
		if(err){
			console.log(err);
		}
		else{
			res.render("comment/new", {campg:camp});
		}
	});
	
});

app.post("/campgrounds/:id/comments",isLoggedIn, function(req, res){
	campground.findById(req.params.id, function(err, campg){
		if(err){
			console.log(err);
		}
		else{
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				}
				else{
					//add username and id to comment
					comment.author.username=req.user.username;
					comment.author.id=req.user._id;
					//save comment
					comment.save();
					campg.comments.push(comment);
					campg.save();
					res.redirect("/campgrounds/"+ req.params.id);
				}
			});
		}
	});
});

//Edit Comment
app.get("/campgrounds/:id/comments/:comment_id/edit", checkCampgroundOwnerr, function(req, res){
	var campid=req.params.id;
	Comment.findById(req.params.comment_id, function(err, comment){
			res.render("comment/edit", {comment:comment,campid:campid});
	});
});

//Update Comment
app.put("/campgrounds/:id/comments/:comment_id",checkCampgroundOwnerr, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment){
		if(err){
			res.redirect("back");
		}
		else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

//Delete Comment

app.delete("/campgrounds/:id/comments/:comment_id", checkCampgroundOwnerr,function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		}
		else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});
		
// Auth Routes

//Show registration form
app.get("/register", function(req, res){
	res.render("register");
});

// handle Sign up logic
app.post("/register",function(req, res){
	var newUser=new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error",err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success","Successfully LoggedIn");
			res.redirect("/campgrounds");
		});
	});
});

// show Login form
app.get("/login", function(req, res){
	
	res.render("login");
});

//handle Login logic

app.post("/login",passport.authenticate("local",
	{

		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req, res){
	});

// logic route
app.get("/logout", function(req, res){
		req.logout();
	req.flash("success","LoggedOut Successfully");
		res.redirect("/campgrounds");
		});

// middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		next();
	}
	else{
		req.flash("error","You need to Login to do that");
		res.redirect("/login");
	}
	
}

function checkCampgroundOwner(req, res, next){
	//is user logged in?
	if(req.isAuthenticated()){
		campground.findById(req.params.id, function(err, foundcampground){
		if(err){
			req.flash("error", err.message);
			res.redirect("back");
		}
		else{
			// Does user owns the campgrounds?
			if(foundcampground.author.id.equals(req.user._id)){
				next();
			}
			else{
				req.flash("error","You don't have permission to do that");
				res.redirect("back");
			}
		}
	});	
	}else{
		req.flash("error","LogIn to do that");
		res.redirect("back");
	}
}

function checkCampgroundOwnerr(req, res, next){
	//is user logged in?
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundcomment){
		if(err){
			req.flash("error", err.message);
			res.redirect("back");
		}
		else{
			// Does user owns the campgrounds?
			if(foundcomment.author.id.equals(req.user._id)){
				next();
			}
			else{
				req.flash("error","You don't have permission to do that");
				res.redirect("back");
			}
		}
	});	
	}else{
		req.flash("error","LogIn to do that");
		res.redirect("back");
	}
}

app.listen(8000,function(){
	console.log("server has started");
});