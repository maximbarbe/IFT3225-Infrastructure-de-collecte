const Ajv = require("ajv");
const addFormats = require("ajv-formats");


const ajv = new Ajv();

addFormats(ajv);
// Format YYYY-MM-DDTHH:MM:SSZ
// Date en UTC
// https://ajv.js.org/guide/formats.html#user-defined-formats
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
ajv.addFormat("timestamp", {
    type: "string",
    validate: (x) => {
        return /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\dZ/.test(x);
    }
});


// https://expressjs.com/en/guide/writing-middleware/
function validate(schema) {

    const validator = ajv.compile(schema);
   
    return (req, res, next) => {
        
        const valid = validator(req.body);
        if (!valid) {
            
            return res.status(400).json({
                error: "Validation failed",
                details: validator.errors
            });
        }

        next();
    };
}

module.exports = validate;
