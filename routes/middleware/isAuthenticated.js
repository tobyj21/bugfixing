"use strict";

module.exports = (req, res, next) => {
   if (req.user) {
      next();
   } else {
      console.log("Request rejected: not logged in. Redirecting to home");

      res.redirect("/");
   }
};
