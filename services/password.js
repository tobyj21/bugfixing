"use strict";

const bcrypt = require("bcrypt");
const saltRounds = 10;

async function hashPassword(password) {
   return new Promise(function (resolve, reject) {
      bcrypt
         .genSalt(saltRounds)
         .then((salt) => {
            return bcrypt.hash(password, salt);
         })
         .then((hash) => {
            resolve(hash);
         })
         .catch((err) => {
            console.error(err.message);
            reject(err);
         });
   });
}

function comparePasswords(password, referencePassword) {
   return new Promise(function (resolve, reject) {
      bcrypt
         .compare(password, referencePassword)
         .then((res) => {
            resolve(res);
         })
         .catch((err) => {
            console.error(err.message);
            resolve(false);
         });
   });
}

module.exports = {
   hashPassword,
   comparePasswords,
};
