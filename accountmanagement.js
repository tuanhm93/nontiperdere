var common = require('./common.js');

var register = function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;

	if(common.validator.isEmail(email)&&common.validator.isLength(password, 6)&&common.validator.trim(name).length != 0){
		// Check email in db
		var time = new Date().getTime();
		var node = common.db.createNode({name: name, email:email, password:password, created_date:time, updated_date:time, code: genCode()});
		node.save(function (err, node) {
			if (err) {
				res.json({ result: "fail" });
			} else {
				res.json({ result: "success" });
			}
		});
	}else{
		res.json({ result: "fail" });
	}
}

module.exports = {
	register: register
};

var genCode = function(){


	return "1234";
}
