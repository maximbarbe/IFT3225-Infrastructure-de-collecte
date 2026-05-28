const Ajv = require("ajv");
const ajv = new Ajv();



const measurementSchema = {
};


const validateMeasurement = ajv.compile(measurementSchema);

module.exports = validateMeasurement;