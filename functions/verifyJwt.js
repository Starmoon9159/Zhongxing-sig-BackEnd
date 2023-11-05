const jwt = require('jsonwebtoken');

function verifyJwt(token, secretKey) {
    try {
        const decoded = jwt.verify(token, secretKey);
        if(decoded) return decoded;
    } catch (error) {
        return 'fail';
    }
}
module.exports = verifyJwt;