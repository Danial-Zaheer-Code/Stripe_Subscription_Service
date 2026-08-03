import { prisma } from "../src/lib/prisma.js"

async function main() {
  await prisma.plan.upsert({
    where: { name: `FREE` },
    update: {},
    create: {
      name: `FREE`,
      priceId: `0`,
      productId: `0`,
    },
  })
  console.log('Default row seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })