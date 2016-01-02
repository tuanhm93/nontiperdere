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

	if((typeof name == "string") && (typeof email == "string") && (typeof password == "string") &&
		common.validator.isEmail(email) && common.validator.isLength(password, 6) && (name = name.trim()).length != 0){
		var time = new Date().getTime();
		query = [
			'CREATE (user:User {props})',
			'RETURN user',
		].join('\n');

		params = {
			props: {
				name: name,
				email:email,
				password: common.blueimpMd5.md5(password, common.config.HMAC_KEY),
				created_date:time,
				updated_date:time,
				avatar: common.config.AVATAR_DEFAULT,
				code: genCode(),
				code_expire_time: time,
				code_attempt: common.config.CODE_ATTEMPT
			}
		};
		common.db.cypher({
			query: query,
			params: params,
		}, function (err, results) {
			if(err){
				if(err.neo4j != undefined){
					res.json({success: false, message: "Email is already in use"});
				}else{
					res.json({success: false, message: "System error"});
				}
			}else{
				res.json({ success: true});
			}
		});
	}else{
		res.json({success: false, message: "There's something wrong with your input"});
	}
}

function login(req, res){
	if(req.body.type == 1){
		res.json({success: false, message: "LOGIN WITH FACEBOOK"});
	}else if(common.validator.isEmail(req.body.email)){
		var query = [
			'MATCH (user:User {email: {props}.email, password: {props}.password})',
			'RETURN user',
		].join('\n');

		var params = {
			props: {		
				email: req.body.email,
				password: common.blueimpMd5.md5(req.body.password, common.config.HMAC_KEY)
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
	}else{
		res.json({success: false, message: "Email or password is wrong"});
	}
}

function getCodeFromEmail(req, res){
	var email = req.body.email;
	var code = genCode();
	var expireTime = new Date().getTime() + common.config.CODE_EXPIRE_TIME;

	var query = [
			'MATCH (user:User {email: {props}.email})',
			'SET user.code = {props}.code, user.code_attempt = 0, user.code_expire_time = {props}.expireTime',
			'RETURN user',
	].join('\n');

	var params = {
		props: {		
			email: email,
			code: code,
			expireTime: expireTime
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
	var time = new Date().getTime();
	console.log(time);
	if(common.validator.isLength(password, 6)){
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
				res.json({success: false, message: "System error"});
			}else if(results.length == 0){
				res.json({success: false, message: "Email is not exist"});
			}else if(results[0].user.properties.code_attempt < common.config.CODE_ATTEMPT && results[0].user.properties.code_expire_time > time){
				if(results[0].user.properties.code == code){
					query = [
						'MATCH (user:User {email: {props}.email})',
						'SET user.password = {props}.password, user.updated_date = {props}.time, user.code_attempt = {props}.codeAttempt',
						'RETURN user'
					].join('\n');

					params = {
						props: {		
							email: email,
							password: common.blueimpMd5.md5(password, common.config.HMAC_KEY),
							time: time,
							codeAttempt: common.config.CODE_ATTEMPT
						}
					};
					common.db.cypher({
						query: query,
						params: params,
					}, function (err, results) {
						if(err){
							res.json({success: false, message: "System error"});
						}else{
							res.json({success: true});
						}
					});
				}else{
					res.json({success: false, message: "Code is incorrect"});
					query = [
						'MATCH (user:User {email: {props}.email})',
						'SET user.code_attempt = user.code_attempt + 1',
						'RETURN user'
					].join('\n');

					params = {
						props: {		
							email: email,
						}
					};
					common.db.cypher({
						query: query,
						params: params,
					}, function(err, results){

					});
				}
			}else{
				res.json({success: false, message: "Code hết hiệu lực, hoặc nhập sai quá nhiều!"});
			}
		});
	}else{
		res.json({success: false, message: "Password is too short"});
	}
}


function genCode(){
	code = "" + Math.ceil(Math.random()*9) + Math.ceil(Math.random()*9) + 
			Math.ceil(Math.random()*9) + Math.ceil(Math.random()*9) + Math.ceil(Math.random()*9);
	return parseInt(code);
}

module.exports = {
	register: register,
	login: login,
	getCodeFromEmail: getCodeFromEmail,
	resetPassword: resetPassword
};