"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const crypto_1 = require("../utils/crypto");
const constants_1 = require("../constants");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            code: constants_1.ERROR_CODES.UNAUTHORIZED,
            message: 'Authentication token missing or invalid',
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, crypto_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        return res.status(401).json({
            code: constants_1.ERROR_CODES.UNAUTHORIZED,
            message: 'Token expired or malformed',
        });
    }
}
