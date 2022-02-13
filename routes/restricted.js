"use strict";
var express = require("express");
var app = express();

//CSRF protection
const csurf = require("csurf");
const csrfProtection = csurf({});

//Restricted page
app.post("/loadSomething", csrfProtection, async function (req, res, next) {
   res.send({
      status: "success",
      data: "Here is some restricted content from the server",
   });
});

module.exports = app;
