import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check if settings already exist
  const existingSettings = await prisma.settings.findFirst()
  
  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        id: 1,
        monthlySalary: 50000,
        requiredHours: 9,
        weeklyOff: 'Sunday',
        currency: '₹',
        hideSalary: false,
      },
    })
    console.log('Default settings created')
  } else {
    console.log('Settings already exist')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
