import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MiniLedger database...');

  // Create demo user
  const demoPhone = '+919876543210';
  const user = await prisma.user.upsert({
    where: { phoneNumber: demoPhone },
    update: {},
    create: {
      phoneNumber: demoPhone,
    },
  });

  console.log(`Demo user ready: ${user.phoneNumber} (ID: ${user.id})`);

  // Clean old seed loans for this user
  await prisma.loan.deleteMany({
    where: { userId: user.id },
  });

  const now = new Date();

  // 1. Pending Loan (due in 5 days)
  const dueFuture = new Date();
  dueFuture.setDate(now.getDate() + 5);

  await prisma.loan.create({
    data: {
      userId: user.id,
      friendName: 'Rohan Sharma',
      amount: new Prisma.Decimal('1500.00'),
      dueDate: dueFuture,
      status: 'PENDING',
      notes: 'Weekend trip dinner share',
    },
  });

  // 2. Overdue Loan (due 4 days ago)
  const duePast = new Date();
  duePast.setDate(now.getDate() - 4);

  await prisma.loan.create({
    data: {
      userId: user.id,
      friendName: 'Priya Patel',
      amount: new Prisma.Decimal('2800.50'),
      dueDate: duePast,
      status: 'PENDING',
      notes: 'Concert ticket advance',
    },
  });

  // 3. Repaid Loan
  const dueRepaid = new Date();
  dueRepaid.setDate(now.getDate() - 10);
  const repaidAt = new Date();
  repaidAt.setDate(now.getDate() - 2);

  await prisma.loan.create({
    data: {
      userId: user.id,
      friendName: 'Amit Verma',
      amount: new Prisma.Decimal('1200.00'),
      dueDate: dueRepaid,
      status: 'REPAID',
      repaidAt,
      notes: 'Electricity bill contribution',
    },
  });

  console.log('Seed completed successfully: 3 test loans created (1 pending, 1 overdue, 1 repaid).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
