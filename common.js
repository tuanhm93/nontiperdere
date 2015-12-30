var fs = require('fs'),
	config = require('./config.js'),
	neo4j = require('neo4j'),
	validator = require('validator'),
	db = new neo4j.GraphDatabase(config.dbUrl);

module.exports = {
	fs: fs,
	config: config,
	validator: validator,
	db: db
}
