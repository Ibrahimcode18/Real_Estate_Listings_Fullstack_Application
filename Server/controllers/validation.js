const { Validator, ValidationError } = require('jsonschema');

const userSchema = require('../schemas/user.json').definitions.user;
const userUpdateSchema = require('../schemas/user.json').definitions.userUpdate;
const propertySchema = require('../schemas/property.json').definitions.property;
const propertyUpdateSchema = require('../schemas/property.json').definitions.propertyUpdate;
const locationSchema = require('../schemas/location.json').definitions.location;
const agentSchema = require('../schemas/agent.json').definitions.agent;
const agentUpdateSchema = require('../schemas/agent.json').definitions.agentUpdate;

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
exports.validateProperty = makeKoaValidator(propertySchema, 'property');
exports.validatePropertyUpdate = makeKoaValidator(propertyUpdateSchema, 'propertyUpdate');
exports.validateLocation = makeKoaValidator(locationSchema, 'location');
exports.validateAgent = makeKoaValidator(agentSchema, 'agent');
exports.validateAgentUpdate = makeKoaValidator(agentUpdateSchema, 'agentUpdate');