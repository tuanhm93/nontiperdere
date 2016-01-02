var fs = require('fs'),
	config = require('./config.js'),
	neo4j = require('neo4j'),
	validator = require('validator'),
	blueimpMd5 = require('blueimp-md5'),
	db = new neo4j.GraphDatabase(config.DATABASE_URL);
	

module.exports = {
	fs: fs,
	config: config,
	validator: validator,
	db: db,
	blueimpMd5: blueimpMd5
}
