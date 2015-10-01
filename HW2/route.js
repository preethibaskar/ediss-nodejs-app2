// vendor library
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var mysql      = require('mysql');
var sync = require('sync');
// custom library
// model
var Model = require('./model');
// var connection = mysql.createConnection({
// 	 host     : 'ediss.ckhbt5h3z4bl.us-east-1.rds.amazonaws.com',
// 	 user     : 'preethiaws',
// 	 password : 'preethiaws',
// 	 database : 'ediss'
//  });
var connection = mysql.createConnection({
	 host     : 'localhost',
	 user     : 'root',
	 password : 'root',
	 database : 'dbUsers'
 });
 var activeSession = false;
 var activeUser = {};

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

var checkActiveSessions = function(req){
	console.log("checking");
	var query = "Select * from tblUsers WHERE session_id is not null and ip_addr = '"+req.connection.remoteAddress+"'";
	console.log(query);
			 connection.query(query,function(err,rows){
			 if(err){
				 res.json({"message":"There was a problem with this action!"});
						   	}
			 if(rows > 0){
			 	activeSession = true;
			 	activeUser = row[0];
			 }
			 });
 return activeSession;
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
				 connection.query('UPDATE tblUsers SET ? where userId = ? ', [req.body, user.userId], function (err, result) {
	if(!err){
		console.log("Response recorded");
	 res.json({ message: "Your information has been updated" });

		//res.redirect(307, '/' + req.path);
		
		//res.redirect("/results.htm?ans1="+ans1+"&ans2="+ans2+"&ans3="+ans3+"&feedback="+feedback);
		//res.end();
	}
	else{
		console.log("There was a problem with this action");
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
				//sess=req.session;
				//console.log(sess.sessionID);
				res.json({ sessionID: sess.sessionID, menu: " Update Contact Information, Log out" })
			} 

			if(!user) {
				res.json({ errorMessage: info.message});
			}
			return req.logIn(user, function(err) {
				 if(err) {
						res.json({ errorMessage: info.message});
				 } else {
				 			console.log("*******");
						 console.log(req.connection.remoteAddress);
						 activeUser = user;
						 req.session.username = activeUser.uName;
						 req.session.usertype = activeUser.usertype;
						  var query = "UPDATE tblUsers set session_id= NULL, ip_addr = NULL WHERE ip_addr='"+req.connection.remoteAddress+"'";
						   connection.query(query,function(err,rows){
						   	if(err){
						   		 res.json({
                       			 "message":"There was a problem with this action!"       
                    			 });
						   	}
						   });
						 var query = "UPDATE tblUsers set session_id= '"+req.sessionID+"' , ip_addr = '"+req.connection.remoteAddress+"' WHERE uName='"+user.uName+"'";
           				 connection.query(query,function(err,rows){
               			 console.log(query);
                		 if(err)
                   			 res.json({
                       			 "message":"There was a problem with this action!"       
                    		});
               			
            			 else {
            			 activeSession = true;
						 if(req.session.usertype == "admin"){
						 	var menu_items = "View products, View users, modify products, log out, update contact information";
						 }
						 else{
						 	var menu_items = "View products, Update Contact Information, Log out";
						 }
						 res.json({ sessionID: req.sessionID, menu: menu_items});
						 }
						 });
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
	 var user = req.body;
	 var usernamePromise = null;
	 if(user.uName == undefined || user.lName == undefined || user.state == undefined || 
	 	user.zip == undefined || user.pWord == undefined || user.fName == undefined || user.address == undefined||
	 	user.city == undefined || user.email == undefined){
	 	res.json({message : "There was a problem with your registration." });
	 }
         else{
	 usernamePromise = new Model.User({uName: user.uName}).fetch();

	 return usernamePromise.then(function(model) {
	 	var reg = /^\d+$/;
	 	var pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;

	 		if(!pattern.test( user.email ) || user.state.length > 2 || user.zip.length > 5 || !(reg.test(user.zip)) ){
	 			res.json({ message: "There was a problem with your registration." });
	 		}
			else if(model) {
				res.json({ message: "There was a problem with your registration. Username already exists" });
			} else {
				 //****************************************************//
				 // MORE VALIDATION GOES HERE(E.G. PASSWORD VALIDATION)
				 //****************************************************//
				 var password = user.pWord;
				 //var hash = bcrypt.hashSync(password);

				 var signUpUser = new Model.User({uName: user.uName, pWord: user.pWord, fName: user.fName, lName: user.lName,
																					address: user.address, city:user.city, state: user.state,email:user.email, 
																					zip:user.zip, usertype:user.usertype });

				 signUpUser.save().then(function(model) {
					res.json({ message:"Your account has been registered"});
						// console.log("Here!!");
						// // sign in the newly registered user
						// signInPost(req, res, next);
				 });	
			}
	 });
        }
};
var viewUsers = function(req,res,next){
	var query = "Select * from tblUsers WHERE session_id is not null and ip_addr = '"+req.connection.remoteAddress+"'";
	console.log(query);
			 connection.query(query,function(err,rows){
			 if(err){
				 res.json({"message":"There was a problem with this action!"});
						   	}
			 else{
			 	if(rows){
				 	console.log("checking inside");
			 		activeSession = true;
			 		activeUser = rows[0];
	    			console.log(activeUser);
			    }
			    viewusers(req,res);
			 }
			 });
};

function viewusers(req,res){

if(!activeSession || activeUser.usertype != "admin"){
				res.json({ message: "You are not logged in as admin!" });
			
	 }

	 else{
	 	 if(req.query.fName == undefined && req.query.lName == undefined){
	 	var query = "SELECT * from tblUsers";
	 }else{
	        var query = "SELECT * FROM ?? WHERE ?? LIKE ? OR ?? LIKE ?";
	 
        var table = [
	        "tblUsers",
	        "fName",
	        "%"+req.query.fName+"%",
	        "lName",
	        "%"+req.query.lName+"%"
        ];
        query = mysql.format(query,table);
    }
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
    }
	// }
}

	// sign out
var signOut = function(req, res, next) {
	console.log("here!!00");
	//var activeSession = false;
	
	
	var query = "Select * from tblUsers WHERE session_id is not null and ip_addr = '"+req.connection.remoteAddress+"'";
	console.log(query);
			 connection.query(query,function(err,rows){
			 if(err){
				 res.json({"message":"There was a problem with this action!"});
						   	}
			 else{
			 	if(rows.length > 0){
				 	console.log("checking inside");
			 		activeSession = true;
			 		activeUser = rows[0];
	    			console.log(activeUser);
			    }
			    logout(req,res);
			 }
			 });
		

};

function logout(req,res){
	console.log("in log out");

	if(activeSession == false) {
			res.json({ message: "You are not currently logged in" });
	 } else {
			activeSession = false;
			 var query = "UPDATE tblUsers set session_id= NULL, ip_addr = NULL WHERE ip_addr='"+req.connection.remoteAddress+"'";
			 console.log(query);
			 connection.query(query,function(err,rows){
			 if(err){
				 res.json({"message":"There was a problem with this action!"});
						   	}
			 });
			 req.session.destroy();
			req.logout();
			res.json({ message: " You have been logged out" })
		 // res.redirect('/signin');
	 }
}
// 404 not found
var notFound404 = function(req, res, next) {
	 res.status(404);
	 res.render('404', {title: '404 Not Found'});
};
var getProducts = function(req, res, next){
	if(req.query.productId == undefined && req.query.category == undefined && req.query.keyword == undefined){
		var query = "select * from product inner join product_category_mapping";
	}
	else{
	var query = "SELECT distinct p.* FROM product p INNER JOIN product_category_mapping c ON p.product_id = c.product_id WHERE p.product_id = "+req.query.productId+" OR category LIKE '"+req.query.category+"' OR (title LIKE '"+req.query.keyword+"' OR description LIKE '"+req.query.keyword+"')";
       } 
       connection.query(query,function(err,rows){
        	console.log(query);
            if(err) {
            	console.log(query);
                res.json({
                	// "Error" : true, 
                	"errMessage" : "Database connection error!"
                });
            } else if(rows.length==0){
                res.json({
                	"errMessage" : "No such product!"
   			 	});
            }
            else if(rows.length>0){
                var output = JSON.stringify(rows);
                res.json({
	            	"product_list":output    	
	            });
            }
        });
    	// }
};
var modifyProduct = function(req, res, next){
	if(!req.isAuthenticated() || req.session.usertype != "admin"){
				res.json({ message: "You are not logged in as admin!" });
			
	 }
	 else{
 var mess;
       // if(req.session.userType=="admin") {
            var query = "UPDATE product set title= '"+req.body.productTitle+"', description ='"+req.body.productDescription+"' WHERE product_id='"+req.body.productId+"'";
            connection.query(query,function(err,rows){
                console.log(query);
                if(err)
                    res.json({
                        "message":"There was a problem with this action!"       
                    });
                else
                    res.json({
                        "message":"The product information has been updated!"       
                    });
            }); 
        }
       // }
        // else {
        //     res.json({
        //                 "message":"There was a problem with this action!"       
        //     });
        // }
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
