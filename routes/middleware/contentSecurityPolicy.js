"use strict";
const crypto = require("crypto");
//Apply content security policy / set up nonces
const csp = require("helmet-csp");

module.exports = (req, res, next) => {
   const nonce = crypto.randomBytes(16).toString("hex");
   res.locals.nonce = nonce;
   csp({
      directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'", `'nonce-${nonce}'`],
         styleSrc: ["'self'", `'nonce-${nonce}'`],
         frameAncestors: ["'none'"],
         formAction: ["'self'"],
      },
   })(req, res, next);
};
