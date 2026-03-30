const BasicStrategy = require('passport-http').BasicStrategy;
const users = require('../models/users'); 
const bcrypt = require('bcrypt');

const verifyPassword = function (user, password) {
    // Safety check: ensure both exist before trying to compare
    if (!password || !user || !user.password) return false;
    const isMatch = bcrypt.compareSync(password, user.password);
    return isMatch
}

const checkUserAndPass = async (username, password, done) => {
    try {
        // Look up the user in the DB
        const result = await users.findByUsername(username);
        
        if (result.length) {
            const user = result[0];
            // Check the password
            if (verifyPassword(user, password)) {
                console.log(`Successfully authenticated user ${username}`);
                return done(null, user); // Success! Pass the user object to the route
            } else {
                console.log(`Password incorrect for user ${username}`);
            }
        } else {
            console.log(`No user found with username ${username}`);
        }

        // Failure
        return done(null, false);
        
    } catch (error) {
        // This will now catch DB errors AND Bcrypt crash errors
        console.error(`Error during auth for ${username}:`, error);
        return done(error); // System Error
    }
}

const strategy = new BasicStrategy(checkUserAndPass);
module.exports = strategy;