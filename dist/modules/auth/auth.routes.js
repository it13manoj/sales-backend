"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const ratelimit_middleware_1 = require("../../middleware/ratelimit.middleware");
const router = (0, express_1.Router)();
const controller = new auth_controller_1.AuthController();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    organizationName: zod_1.z.string().min(1),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
router.post('/register', ratelimit_middleware_1.authRateLimiter, (0, validate_middleware_1.validateBody)(registerSchema), controller.register);
router.post('/login', ratelimit_middleware_1.authRateLimiter, (0, validate_middleware_1.validateBody)(loginSchema), controller.login);
router.get('/me', auth_middleware_1.authenticate, controller.getMe);
exports.default = router;
