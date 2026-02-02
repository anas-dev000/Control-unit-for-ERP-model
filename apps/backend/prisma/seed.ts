import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Tenant
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'acme' },
    update: {},
    create: {
      name: 'Acme Corp',
      domain: 'acme',
      settings: { currency: 'USD' },
    },
  });

  // 2. Create Admin User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { 
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@acme.com'
      }
    },
    update: {},
    create: {
      email: 'admin@acme.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  // 3. Create Customers
  const customers = [
    { name: 'Global Tech', email: 'billing@globaltech.com', phone: '+123456789', tenantId: tenant.id, createdBy: user.id },
    { name: 'Oceanic Systems', email: 'accounts@oceanic.io', phone: '+987654321', tenantId: tenant.id, createdBy: user.id },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { 
        tenantId_name: { 
          tenantId: c.tenantId, 
          name: c.name 
        } 
      },
      update: {},
      create: c,
    });
  }

  const dbCustomers = await prisma.customer.findMany({ where: { tenantId: tenant.id } });

  // 4. Create Invoices
  const invoice = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      customerId: dbCustomers[0].id,
      invoiceNumber: 'INV-001',
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotal: 1000,
      taxRate: 0.15,
      taxAmount: 150,
      total: 1150,
      status: 'SENT',
      createdBy: user.id,
      items: {
        create: [
          { description: 'Cloud Services', quantity: 1, unitPrice: 800, amount: 800 },
          { description: 'Maintenance', quantity: 2, unitPrice: 100, amount: 200 },
        ]
      }
    }
  });

  // 5. Create Payment
  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      customerId: dbCustomers[0].id,
      invoiceId: invoice.id,
      amount: 500,
      method: 'BANK_TRANSFER',
      reference: 'TX-7788',
      createdBy: user.id,
    }
  });

  // Update invoice paid amount
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { paidAmount: 500, status: 'PARTIAL' }
  });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
