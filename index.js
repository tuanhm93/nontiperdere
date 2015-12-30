var https = require('https'),
	express = require('express'),
	moment = require('moment'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	jwt = require('jsonwebtoken'),
	accountManagement = require('./accountmanagement.js'),
	common = require('./common.js'),
	app = express();

var hskey = common.fs.readFileSync('ssl/private.key');
var hscert = common.fs.readFileSync('ssl/certificate.crt');

var options = {
	key: hskey,
	cert: hscert
};

var port = common.config.port;

app.set('superSecret', common.config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));


//Routes without protection
var routes = express.Router();
// routes.get('/register', function(req, res){
// 	res.json({token: jwt.sign({id:1, name:'hmt', age:'5', random:111}, app.get('superSecret'), {
//           expiresIn: 1000 // expires in 24 hours
//       })});
// 	var neo4j = require('neo4j');
// 	var db = new neo4j.GraphDatabase(config.dbUrl);
// 	var node = db.createNode({hello: 'world'});     // instantaneous, but...
// 	node.save(function (err, node) {    // ...this is what actually persists.
//     	if (err) {
//         	console.error('Error saving new node to database:', err);
//     	} else {
//         	console.log('Node saved to database with id:', node.id);
//     	}
// 	});
// });

routes.post('/register', accountManagement.register);

app.use('/api', routes);

//Routes has protected
var routes = express.Router();

routes.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
    	if (err) {
    		return res.json({ success: false, message: 'Failed to authenticate token.' });    
    	} else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;  
        console.log(decoded);  
        next();
    }
	});
	} else {
	    // if there is no token
	    // return an error
	    return res.status(403).send({ 
	    	success: false, 
	    	message: 'No token provided.' 
	    });
	}
});

routes.get('/protected', function(req, res){
	res.send("This is a api has protected");
});

app.use("/api", routes);

https.createServer(options, app).listen(port);
console.log('Server is listening on port: '+port);
