"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = authorizeRoles;
const constants_1 = require("../constants");
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                code: constants_1.ERROR_CODES.UNAUTHORIZED,
                message: 'User is not authenticated',
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                code: constants_1.ERROR_CODES.FORBIDDEN,
                message: `Forbidden: requires one of roles [${allowedRoles.join(', ')}]`,
            });
        }
        next();
    };
}
