const crypto = require("crypto");
const bcrypt = require("bcrypt");


//https://stackoverflow.com/a/69936899
async function generateAPIKey() {
    const key = await(bcrypt.hash(crypto.randomUUID(), 10));
    return key;
};


module.exports = {
    generateAPIKey
};