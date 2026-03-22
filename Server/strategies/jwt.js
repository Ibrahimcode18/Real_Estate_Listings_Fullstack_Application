const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const users = require('../models/users'); // Your Week 6 user model

// In a real app, this MUST be in a .env file!
const secretKey = 'my_super_secure_secret_key_123';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secretKey
};
const checkJwtPayload = async (jwt_payload, done) => {
    try {
        // The payload contains the data we packed into the token (like ID and role)
        // We verify the user still exists in our database
        const result = await users.getById(jwt_payload.ID);

        if (result.length) {
            console.log(`Successfully authenticated user via JWT: ${result[0].username}`);
            return done(null, result[0]); // Pass the full user object to the route
        } else {
            console.log("JWT matched, but user no longer exists in DB.");
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
};
module.exports = new JwtStrategy(opts, checkJwtPayload);