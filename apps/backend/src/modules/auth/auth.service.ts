import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { RegisterDTO, LoginDTO } from './auth.dto';
import { ConflictError, UnauthorizedError } from '../../common/errors/AppError';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';

export class AuthService {
  static async register(data: RegisterDTO) {
    const existingUser = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Using transaction to create Tenant and Admin User
    return await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: data.companyName,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: data.email,
          passwordHash: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'ADMIN',
        },
      });

      const tokens = this.generateTokens(user.id, tenant.id, user.role);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
        },
        ...tokens,
      };
    });
  }

  static async login(data: LoginDTO) {
    const user = await prisma.user.findFirst({
      where: { email: data.email },
      include: { tenant: true },
    });

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateTokens(user.id, user.tenantId, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
      },
      ...tokens,
    };
  }

  private static generateTokens(userId: string, tenantId: string, role: string) {
    const accessToken = generateAccessToken({ userId, tenantId, role });
    const refreshToken = generateRefreshToken({ userId, tenantId, role });
    return { accessToken, refreshToken };
  }
}
