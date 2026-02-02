import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
  userId?: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export const getTenantId = (): string | undefined => {
  return tenantStorage.getStore()?.tenantId;
};

export const getUserId = (): string | undefined => {
  return tenantStorage.getStore()?.userId;
};
