var common = require('./common.js');
var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport("SMTP",{
	service: "Gmail",
	auth: {
		user:"tuvichat@gmail.com",
		pass:"123456aA@"
	}
});

function register(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;

	if(common.validator.isEmail(email)&&common.validator.isLength(password, 6)&&common.validator.trim(name).length != 0){
		// Check email in db
		var query = [
			'MATCH (user:User {email: {props}.email})',
			'RETURN user',
		].join('\n');

		var params = {
			props: {		
				email: email
			}
		};

		common.db.cypher({
			query: query,
			params: params,
		}, function (err, results) {
			if(err){
				res.json({ success: false, message: "System Error"});
			}else{
				if(results.length == 0){	
					var time = new Date().getTime();
					query = [
						'CREATE (user:User {props})',
						'RETURN user',
					].join('\n');

					params = {
						props: {
							name: name,
							email:email,
							password:password,
							created_date:time,
							updated_date:time,
							code: genCode()
						}
					};
					common.db.cypher({
						query: query,
						params: params,
					}, function (err, results) {
						if(err){
							res.json({ success: false, message: "System Error"});
						}else{
							res.json({ success: true});
						}
					});
				}else{
					res.json({ success: false, message: "Email is already in used"});
				}	
			}
		});
	}else{
		res.json({ success: false, message: "Something wrong with your input" });
	}
}

function login(req, res){
	if(req.body.type == common.config.FACEBOOK_LOGIN){

	}else{
		var email = req.body.email;
		var password = req.body.password;
		var query = [
			'MATCH (user:User {email: {props}.email, password: {props}.password})',
			'RETURN user',
		].join('\n');

		var params = {
			props: {		
				email: email,
				password: password
			}
		};

		common.db.cypher({
			query: query,
			params: params,
		}, function (err, results) {
			if(err){
				res.json({success: false, message: "System error"});
			}else if(results.length == 0){
				res.json({success: false, message: "Email or password is wrong"});
			}else{
				res.json({success: true, results });
			}
		});
	}
}

function getCodeFromEmail(req, res){
	var email = req.body.email;
	var code = genCode();

	var query = [
			'MATCH (user:User {email: {props}.email})',
			'SET user.code = {props}.code',
			'RETURN user',
	].join('\n');

	var params = {
		props: {		
			email: email,
			code: code
		}
	};

	common.db.cypher({
		query: query,
		params: params,
	}, function (err, results) {
		if(err){
			res.json({success: false, message: "System error"});
		}else if(results.length == 0){
			res.json({success: false, message: "Email is not exist"});
		}else{
			var mailOptions={
				to: email,
				subject: "[FORGOT PASSWORD]",
				text: "Your code securiry is: "+ code
			};
			smtpTransport.sendMail(mailOptions, function(err, inf){
				if(err){
					// res.send(err);
					res.json({success: false, message: "System error"});
				}else{
					res.json({success: true});
				}
			});
		}
	});
}

function resetPassword(req, res){
	var email = req.body.email;
	var code = req.body.code;
	var password = req.body.password;
	if(common.validator.isLength(password, 6)){
		var query = [
				'MATCH (user:User {email: {props}.email, code: {props}.code})',
				'SET user.password = {props}.password',
				'RETURN user',
		].join('\n');

		var params = {
			props: {		
				email: email,
				code: code,
				password: password
			}
		};

		common.db.cypher({
			query: query,
			params: params,
		}, function (err, results) {
			if(err){
				res.json({success: false, message: "System error"});
			}else if(results.length == 0){
				res.json({success: false, message: "Email or code is incorrect"});
			}else{
				res.json({success: true});
			}
		});
	}else{
		res.json({success: false, message: "Password is too short"});
	}
}


function genCode(){
	code = "" + Math.ceil(Math.random()*9) + Math.ceil(Math.random()*9) + 
			Math.ceil(Math.random()*9) + Math.ceil(Math.random()*9) + Math.ceil(Math.random()*9);
	return code;
}

module.exports = {
	register: register,
	login: login,
	getCodeFromEmail: getCodeFromEmail,
	resetPassword: resetPassword
};


