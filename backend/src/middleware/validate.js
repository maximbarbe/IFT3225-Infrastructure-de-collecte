import Ajv from "ajv";
import addFormats from "ajv-formats";


const ajv = new Ajv();

addFormats(ajv);
// Format YYYY-MM-DDTHH:MM:SSZ
// Date en UTC
// (ajv, s. d.)
// (Klyne et Newman, 2002)
ajv.addFormat("timestamp", {
    type: "string",
    validate: (x) => {
        return /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\dZ/.test(x);
    }
});

function validate(schema) {

    const validator = ajv.compile(schema);
   
    return (req, res, next) => {
        
        const valid = validator(req.body);
        if (!valid) {
            
            return res.status(400).json({
                error: "VALIDATION_FAILED",
                message: "Le schéma utilisé est invalide."
            });
        };

        next();
    };
};


export default validate;
