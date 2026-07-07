const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({
  connectionString: 'postgresql://amdox:amdox123@127.0.0.1:5433/amdox_erp',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'amdox-demo' },
    update: {},
    create: {
      id: 'tenant-001',
      name: 'Amdox Demo',
      slug: 'amdox-demo',
    },
  })
  console.log('Tenant created:', tenant)

  const user = await prisma.user.upsert({
    where: { email: 'admin@amdox.com' },
    update: {},
    create: {
      id: 'user-001',
      email: 'admin@amdox.com',
      name: 'Admin User',
      role: 'TENANT_ADMIN',
      tenantId: 'tenant-001',
    },
  })
  console.log('User created:', user)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())