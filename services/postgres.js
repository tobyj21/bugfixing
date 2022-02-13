"use strict";
var promise = require("bluebird");
require("dotenv").config();

var options = {
   promiseLib: promise,
};
var pgp = require("pg-promise")(options);

//Parse timestamp as string
pgp.pg.types.setTypeParser(1114, function (stringValue) {
   return stringValue;
});

const config = {
   host: process.env.DB_HOST,
   port: process.env.DB_PORT,
   database: process.env.DB_NAME,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   max: 30, // use up to 30 connections
};

var db = pgp(config);

module.exports = db;
