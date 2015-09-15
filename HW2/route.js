// vendor library
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var mysql      = require('mysql');
// custom library
// model
var Model = require('./model');
var connection = mysql.createConnection({
	 host     : 'localhost',
	 user     : 'root',
	 password : 'root',
	 database : 'dbUsers'
 });
 

 connection.connect();
// index
var index = function(req, res, next) {
	 if(!req.isAuthenticated()) {
			res.redirect('/signin');
	 } else {

			var user = req.user;

			if(user !== undefined) {
				 user = user.toJSON();
			}
			res.render('index', {title: 'Home', user: user});
	 }
};

var updateInfo = function(req,res,next){
	 if(!req.isAuthenticated()){
			res.redirect('/login');
	 }
	 else{
			var user = req.user;
			if(user !== undefined){
				 user = user.toJSON();
			}
			res.render('updateInfo',{title:'Update Contact Info', user:user});
	 }
};


var updateInfoPost = function(req,res,next){
	if(!req.isAuthenticated()){
				res.json({ message: "You are not logged in!" });
			
	 }
	 else{
	 var user = req.body;
	 var usernamePromise = null;
	 console.log(user.userId);
	 usernamePromise = new Model.User({uName:req.session.username}).fetch();
     console.log(req.query);
	 return usernamePromise.then(function(model) {
			if(model) {
				 console.log("here!!");
				 
				 
				 //connection.query('UPDATE tblUsers SET fName = ? WHERE userId = ?', [user.fName, user.userId]);
				 connection.query('UPDATE tblUsers SET ? where userId = ? ', [req.query, user.userId], function (err, result) {
	if(!err){
		console.log("Response recorded");
	 res.json({ message: "Your information has been updated" });

		//res.redirect(307, '/' + req.path);
		
		//res.redirect("/results.htm?ans1="+ans1+"&ans2="+ans2+"&ans3="+ans3+"&feedback="+feedback);
		//res.end();
	}
	else{
		console.log("Error!");
	}
	res.end();
});
				 // usernamePromise.set('lName', user.lName);
				 // usernamePromise.set('fName', user.fName);
				 // usernamePromise.save().then(function(model) {
				 //    console.log("in save");
				 //    // sign in the newly registered user
				 //    signInPost(req, res, next);
				 // });   
			} else {
				 //****************************************************//
				 // MORE VALIDATION GOES HERE(E.G. PASSWORD VALIDATION)
				 //****************************************************//
			 res.json({ message: "There was a problem with this action" });
			}
	 });
}
};

// sign in
// GET
var signIn = function(req, res, next) {
	 if(req.isAuthenticated()) res.redirect('/');
	 res.render('signin', {title: 'Sign In'});
};

// sign in
// POST
var signInPost = function(req, res, next) {
	 passport.authenticate('local', { successRedirect: '/',
													failureRedirect: '/signin'}, function(err, user, info) {
			if(err) {
				 //return res.render('signin', {title: 'Sign In', errorMessage: err.message});
				sess=req.session;
				console.log(sess.sessionID);
				res.json({ sessionID: sess.sessionID, menu: " Update Contact Information, Log out" })
			} 

			if(!user) {
				res.json({ errorMessage: info.message});
			}
			return req.logIn(user, function(err) {
				 if(err) {
						res.json({ errorMessage: info.message});
				 } else {
						 console.log("login");
						 req.session.username = user.username;
						 res.json({ sessionID: req.sessionID, menu: " Update Contact Information, Log out" });
				 }
			});
	 })(req, res, next);
};

// sign up
// GET
var signUp = function(req, res, next) {
	 if(req.isAuthenticated()) {
			res.redirect('/');
	 } else {
			res.render('signup', {title: 'Sign Up'});
	 }
};

// sign up
// POST
var signUpPost = function(req, res, next) {
	 var user = req.query;
	 var usernamePromise = null;
	 usernamePromise = new Model.User({uName: user.username}).fetch();

	 return usernamePromise.then(function(model) {
	 	var pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
	 		if(!pattern.test( user.email )){
	 			res.json({ message: "There was a problem with your registration." });
	 		}
			if(model) {
				res.json({ message: "There was a problem with your registration. Username already exists" });
			} else {
				 //****************************************************//
				 // MORE VALIDATION GOES HERE(E.G. PASSWORD VALIDATION)
				 //****************************************************//
				 var password = user.password;
				 //var hash = bcrypt.hashSync(password);

				 var signUpUser = new Model.User({uName: user.username, pWord: user.password, fName: user.fName, lName: user.lName,
																					address: user.address, city:user.city, state: user.state,email:user.email, 
																					zip:user.zip });

				 signUpUser.save().then(function(model) {
					res.json({ message:"Your account has been registered"});
						// console.log("Here!!");
						// // sign in the newly registered user
						// signInPost(req, res, next);
				 });	
			}
	 });
};
var viewUsers = function(req,res,next){
	        var query = "SELECT * FROM ?? WHERE ?? LIKE ? AND ?? LIKE ?";
        var table = [
	        "tblUsers",
	        "fName",
	        "%"+req.query.fName+"%",
	        "lName",
	        "%"+req.query.lName+"%"
        ];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
        	console.log(query);
            if(err) {
            	// console.log(query);
                res.json({
                	// "Error" : true, 
                	"errMessage" : "Database connection error!"
                });
            } else if(rows.length==0){
                res.json({
                	"errMessage" : "No such user!"
   			 	});
            }
            else if(rows.length>0){
                var output = JSON.stringify(rows);
                res.json({
	            	"user_list":output    	
	            });
            }
        });
	// }
}
// sign out
var signOut = function(req, res, next) {
	console.log("here!!00");
	 if(!req.isAuthenticated()) {
			res.json({ message: "You are not currently logged in" })
	 } else {
			req.session.destroy();
			req.logout();
			res.json({ message: " You have been logged out" })
		 // res.redirect('/signin');
	 }
};

// 404 not found
var notFound404 = function(req, res, next) {
	 res.status(404);
	 res.render('404', {title: '404 Not Found'});
};
var getProducts = function(req, res, next){

};
var modifyProduct = function(req, res, next){

};
// export functions
/**************************************/
// index
module.exports.index = index;

// sigin in
// GET
module.exports.signIn = signIn;
// POST
module.exports.signInPost = signInPost;
module.exports.getProducts = getProducts;
// sign up
// GET
module.exports.signUp = signUp;
// POST
module.exports.signUpPost = signUpPost;

// sign out
module.exports.signOut = signOut;

// 404 not found
module.exports.notFound404 = notFound404;

module.exports.updateInfo = updateInfo;
module.exports.updateInfoPost = updateInfoPost;
module.exports.viewUsers = viewUsers;
module.exports.modifyProduct = modifyProduct;