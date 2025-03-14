import { PrismaClient, UserRole } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@opengrove.local' },
    update: {},
    create: {
      email: 'admin@opengrove.local',
      name: 'Admin User',
      hashedPassword: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create a test creator
  const creatorPassword = await bcrypt.hash('creator123', 10);
  const creatorUser = await prisma.user.upsert({
    where: { email: 'creator@opengrove.local' },
    update: {},
    create: {
      email: 'creator@opengrove.local',
      name: 'Test Creator',
      hashedPassword: creatorPassword,
      role: UserRole.CREATOR,
      emailVerified: new Date(),
    },
  });

  const creator = await prisma.creator.upsert({
    where: { userId: creatorUser.id },
    update: {},
    create: {
      userId: creatorUser.id,
      username: 'testcreator',
      bio: 'I create amazing digital products!',
      website: 'https://testcreator.com',
    },
  });

  console.log('✅ Creator created:', creator.username);

  // Create a test customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@opengrove.local' },
    update: {},
    create: {
      email: 'customer@opengrove.local',
      name: 'Test Customer',
      hashedPassword: customerPassword,
      role: UserRole.CUSTOMER,
      emailVerified: new Date(),
    },
  });

  const customer = await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
    },
  });

  console.log('✅ Customer created:', customerUser.email);

  // Create test products
  const digitalProduct = await prisma.product.create({
    data: {
      creatorId: creator.id,
      name: 'Ultimate JavaScript Guide',
      slug: 'ultimate-javascript-guide',
      description: 'A comprehensive guide to mastering JavaScript',
      type: 'DIGITAL',
      pricingModel: 'FIXED',
      price: 29.99,
      currency: 'USD',
      published: true,
      enableAffiliate: true,
      affiliateCommission: 30,
    },
  });

  console.log('✅ Digital product created:', digitalProduct.name);

  const subscriptionProduct = await prisma.product.create({
    data: {
      creatorId: creator.id,
      name: 'Premium Membership',
      slug: 'premium-membership',
      description: 'Get access to all premium content',
      type: 'SUBSCRIPTION',
      pricingModel: 'SUBSCRIPTION',
      price: 9.99,
      currency: 'USD',
      published: true,
    },
  });

  console.log('✅ Subscription product created:', subscriptionProduct.name);

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });