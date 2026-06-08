const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@primetrade.ai' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@primetrade.ai',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('User1234', 12);
  const user = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      role: 'USER',
    },
  });

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Set up project infrastructure',
        description: 'Initialize the backend and frontend projects with all dependencies.',
        status: 'DONE',
        priority: 'HIGH',
        userId: user.id,
      },
      {
        title: 'Implement JWT authentication',
        description: 'Add register, login, and token refresh endpoints with bcrypt password hashing.',
        status: 'DONE',
        priority: 'HIGH',
        userId: user.id,
      },
      {
        title: 'Build CRUD APIs for tasks',
        description: 'Create GET, POST, PUT, DELETE endpoints for task management.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        userId: user.id,
      },
      {
        title: 'Add role-based access control',
        description: 'Implement admin and user roles with middleware guards.',
        status: 'TODO',
        priority: 'HIGH',
        userId: user.id,
      },
      {
        title: 'Write API documentation',
        description: 'Set up Swagger UI with all endpoint documentation.',
        status: 'TODO',
        priority: 'MEDIUM',
        userId: admin.id,
      },
      {
        title: 'Deploy to production',
        description: 'Set up CI/CD pipeline and deploy backend to cloud provider.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed complete!');
  console.log(`\n📧 Admin: admin@primetrade.ai | 🔑 Password: Admin123`);
  console.log(`📧 User:  john@example.com   | 🔑 Password: User1234`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
