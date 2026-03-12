const { Validator, ValidationError } = require('jsonschema');
const userSchema = require('../schemas/user.json').definitions.user;
const userUpdateSchema = require('../schemas/user.json').definitions.userUpdate;

// A Factory function: It creates a custom checker function for a specific schema
const makeKoaValidator = (schema, resource) => {
    const v = new Validator();
    const validationOptions = {
        throwError: true,
        propertyName: resource
    };

    // This is the actual Middleware function Koa will run
    return async (ctx, next) => {
        const body = ctx.request.body;
        try {
            v.validate(body, schema, validationOptions);
            await next(); // If valid, pass to the next function (the Route)
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error(error);
                ctx.status = 400; // Bad Request
                ctx.body = error;
            } else {
                throw error;
            }
        }
    }
}


exports.validateUser = makeKoaValidator(userSchema, 'user');
exports.validateUserUpdate = makeKoaValidator(userUpdateSchema, 'userUpdate');