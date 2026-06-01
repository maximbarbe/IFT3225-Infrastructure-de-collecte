const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ajv = new Ajv();
addFormats(ajv);

function validate(schema) {

    const validateFn = ajv.compile(schema);

    return (req, res, next) => {

        const valid = validateFn(req.body);

        if (!valid) {
            return res.status(400).json({
                error: "Invalid request body",
                details: validateFn.errors
            });
        }

        next();
    };
}

module.exports = validate;
