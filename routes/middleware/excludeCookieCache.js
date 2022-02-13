"use strict";
module.exports = (req, res, next) => {
   res.set("Cache-Control", "no-cache='Set-Cookie, Set-Cookie2'");
   next();
};
