"use strict";
var express = require("express");
var app = express();

//Load middlewares
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
const passport = require("passport");

//Issue new ajax csrf login token
app.get("/ajaxLoginToken", csrfProtection, function (req, res) {
   const csrfToken = req.csrfToken();
   res.json({ csrfToken });
   console.log("New csrf token issued", csrfToken);
});

//AJAX login

//app.post("/ajaxLogin", csrfProtection, function (req, res, next) {
app.post("/ajaxLogin", function (req, res, next) {
   passport.authenticate("local", async function (err, user, info) {
      if (err) return next(err);
      //Handle unsuccessful authentication
      if (!user) {
         console.log("credential error");
         return res.send({
            status: "error",
         });
      }

      //Handle successful login
      req.logIn(user, function (err) {
         if (err) return next(err);

         //Clear old cookie (otherwise it was possible to re-use the old csrf token during a subsequent session)
         res.clearCookie("_csrf");

         // Regenerate session
         var passportObject = req.session.passport;
         req.session.regenerate(function (err) {
            //req.session.passport is now undefined
            req.session.passport = passportObject;

            req.session.save(function (err) {
               //Bugfix: added 0.5 second wait as logon was failing randomly. Adding this wait appears to fix it.
               setTimeout(() => {
                  console.log("Login successful: sending new csrf token");
                  //Send new csrf token for the newly created session
                  //                  const csrf = req.csrfToken();
                  return res.send({
                     status: "success",
                     //                     csrf,
                  });
               }, 500);
            });
         });
      });
   })(req, res, next);
});

app.get("/logout", function (req, res) {
   console.log("loggin out");
   req.logout();
   //Clear cookie so that csrf token can't be reused on later session
   res.clearCookie("_csrf");
   setTimeout(() => {
      res.redirect("/");
   }, 100);
   setTimeout(() => {
      req.session.destroy();
   }, 3000);
});

module.exports = app;
