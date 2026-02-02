import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { getTenantId } from '../../lib/context';
import { ConflictError, NotFoundError } from '../../common/errors/AppError';

export class UserService {
  static async list() {
    const tenantId = getTenantId();
    return prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });
  }

  static async create(data: CreateUserDTO) {
    const tenantId = getTenantId()!;
    
    const existing = await prisma.user.findFirst({
      where: { 
        tenantId, 
        email: data.email,
        deletedAt: null
      }
    });

    if (existing) {
      throw new ConflictError('User with this email already exists in your organization');
    }

    const { password: _, ...rest } = data;
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        ...rest,
        passwordHash: hashedPassword,
        tenantId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      }
    });
  }

  static async update(id: string, data: UpdateUserDTO) {
    const tenantId = getTenantId();
    
    const user = await prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      }
    });
  }

  static async delete(id: string) {
    const tenantId = getTenantId();
    
    const user = await prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Soft delete
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });
  }
}
