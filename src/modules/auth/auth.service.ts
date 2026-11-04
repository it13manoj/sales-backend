import { prisma } from '../../config/database';
import { hashPassword, comparePassword, generateToken } from '../../utils/crypto';
import { ERROR_CODES } from '../../constants';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw { status: 409, code: ERROR_CODES.CONFLICT, message: 'Email is already registered' };
    }

    const organization = await prisma.organization.create({
      data: {
        name: data.organizationName,
      },
    });

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
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

    const token = generateToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
      email: user.email,
    });

    return { user, token };
  }

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { organization: true },
    });

    if (!user) {
      throw { status: 401, code: ERROR_CODES.UNAUTHORIZED, message: 'Invalid email or password' };
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw { status: 401, code: ERROR_CODES.UNAUTHORIZED, message: 'Invalid email or password' };
    }

    const token = generateToken({
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

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
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
      throw { status: 404, code: ERROR_CODES.NOT_FOUND, message: 'User not found' };
    }

    return user;
  }
}

