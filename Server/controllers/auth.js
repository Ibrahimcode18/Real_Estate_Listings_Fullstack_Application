const passport = require('koa-passport');
const basicAuth = require('../strategies/basic');
const jwtAuth = require('../strategies/jwt');

// Register BOTH strategies with Koa-Passport
passport.use(basicAuth);
passport.use(jwtAuth);

// Export specific guards for different situations
module.exports = {
 // Used ONLY for the /login route to exchange credentials for a token
    requireBasic: passport.authenticate(['basic'], { session: false }),

    // Used for all other protected routes (checking the token)
    requireJWT: passport.authenticate(['jwt'], { session: false })
};