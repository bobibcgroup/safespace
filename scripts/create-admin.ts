import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email =
    process.env.DEFAULT_ADMIN_EMAIL ||
    process.argv[2] ||
    'admin@example.com'
  const password =
    process.env.DEFAULT_ADMIN_PASSWORD ||
    process.argv[3] ||
    'admin123'
  const name =
    process.env.DEFAULT_ADMIN_NAME ||
    process.argv[4] ||
    'Admin User'

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
      role: 'admin',
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role: 'admin',
    },
  })

  console.log('✅ Admin user created/updated:')
  console.log(`   Email: ${user.email}`)
  console.log(`   Name: ${user.name}`)
  console.log(`   Role: ${user.role}`)
  console.log(`   Password: ${password}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

