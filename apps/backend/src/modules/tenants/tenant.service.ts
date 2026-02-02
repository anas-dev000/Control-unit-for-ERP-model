import prisma from '../../lib/prisma';
import { getTenantId } from '../../lib/context';
import { NotFoundError } from '../../common/errors/AppError';
import { UpdateTenantDTO } from './tenant.dto';

export class TenantService {
  static async getCurrent() {
    const id = getTenantId();
    const tenant = await prisma.tenant.findUnique({
      where: { id: id!, deletedAt: null }
    });

    if (!tenant) {
      throw new NotFoundError('Company');
    }

    return tenant;
  }

  static async update(data: UpdateTenantDTO) {
    const id = getTenantId();
    
    return prisma.tenant.update({
      where: { id: id! },
      data,
    });
  }
}
