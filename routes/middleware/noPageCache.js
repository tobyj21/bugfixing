"use strict";
module.exports = (req, res, next) => {
   //Middleware should be used on any page which displays sensitive identifiable data
   res.header("Cache-Control", "no-store");
   next();
};
