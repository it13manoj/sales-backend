"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("../../config/database");
const crypto_1 = require("../../utils/crypto");
const constants_1 = require("../../constants");
class AuthService {
    async register(data) {
        const existing = await database_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing) {
            throw { status: 409, code: constants_1.ERROR_CODES.CONFLICT, message: 'Email is already registered' };
        }
        const organization = await database_1.prisma.organization.create({
            data: {
                name: data.organizationName,
            },
        });
        const passwordHash = await (0, crypto_1.hashPassword)(data.password);
        const user = await database_1.prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                role: 'ORG_ADMIN',
                organizationId: organization.id,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                organizationId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        const token = (0, crypto_1.generateToken)({
            userId: user.id,
            organizationId: user.organizationId,
            role: user.role,
            email: user.email,
        });
        return { user, token };
    }
    async login(data) {
        const user = await database_1.prisma.user.findUnique({
            where: { email: data.email },
            include: { organization: true },
        });
        if (!user) {
            throw { status: 401, code: constants_1.ERROR_CODES.UNAUTHORIZED, message: 'Invalid email or password' };
        }
        const isValid = await (0, crypto_1.comparePassword)(data.password, user.passwordHash);
        if (!isValid) {
            throw { status: 401, code: constants_1.ERROR_CODES.UNAUTHORIZED, message: 'Invalid email or password' };
        }
        const token = (0, crypto_1.generateToken)({
            userId: user.id,
            organizationId: user.organizationId,
            role: user.role,
            email: user.email,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                organizationId: user.organizationId,
                organizationName: user.organization.name,
            },
            token,
        };
    }
    async getMe(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                organizationId: true,
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!user) {
            throw { status: 404, code: constants_1.ERROR_CODES.NOT_FOUND, message: 'User not found' };
        }
        return user;
    }
}
exports.AuthService = AuthService;
