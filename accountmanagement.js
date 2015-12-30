var common = require('./common.js');

var register = function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	
	var time = new Date().getTime();
	var node = db.createNode({name: name, email:email, password:password, created_date:time, updated_date:time});
	node.save(function (err, node) {
    	if (err) {
        	console.error('Error saving new node to database:', err);
    	} else {
        	console.log('Node saved to database with id:', node.id);
    	}
	});
}

module.exports = {
	setup: setup,
	register: register
};
