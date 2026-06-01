const Ajv = require("ajv");

const ajv = new Ajv();

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
