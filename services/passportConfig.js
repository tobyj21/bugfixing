"use strict";
var db = require("../services/postgres");

const passport = require("passport");
const passwordService = require("../services/password");
const { Strategy: LocalStrategy } = require("passport-local");

passport.serializeUser((user, done) => {
   done(null, user.id);
});

passport.deserializeUser((id, done) => {
   let user = {};
   db.any(
      `
  select u.id,   email,   u.password 
  from users u 
  where u.id = $1`,
      [id]
   )
      .then(function (data) {
         user = {
            id: data[0].id,
            email: data[0].email,
            password: data[0].password,
         };
         done(null, user);
      })
      .catch(function (error) {
         console.log(error);
      });
});

//Local strategy (email / password)
passport.use(
   new LocalStrategy({ usernameField: "email", passwordField: "password" }, async function (email, password, done) {
      email = email.toLowerCase().trim();

      try {
         const user = await getUser({ email });

         //Where user found
         if (user) {
            let passwordMatch;
            //Only do password match check where user account has a password
            if (user.password) {
               passwordMatch = await passwordService.comparePasswords(password, user.password);
            }

            if (passwordMatch) {
               return done(null, user);
            } else {
               return done(null, false, { message: "Invalid email or password" });
            }
         }

         //Where no user found
         if (!user) {
            return done(null, false, { message: "Invalid email or password" });
         }
      } catch (error) {
         console.log(error);
      }
   })
);

function getUser({ email }) {
   return new Promise(async function (resolve, reject) {
      db.any(`select u.id,  u.password from users u where email = $1`, [email])
         .then(function (data) {
            resolve(data[0]);
         })
         .catch(function (error) {
            console.log(error);
         });
   });
}
