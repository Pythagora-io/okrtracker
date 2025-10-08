import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import User from '../models/User';
import { ROLES } from 'shared';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@okrflow.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

async function seedAdmin() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log(`Checking if admin user exists with email: ${ADMIN_EMAIL}`);
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      console.log(`Name: ${existingAdmin.name || 'Not set'}`);
      console.log('\nIf you want to reset the password, delete the user first and run this script again.');
      process.exit(0);
    }

    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const adminUser = new User({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      role: ROLES.ADMIN,
      isActive: true,
    });

    await adminUser.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('==========================================');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`Name: ${ADMIN_NAME}`);
    console.log(`Role: ${ROLES.ADMIN}`);
    console.log('==========================================');
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');
    console.log('\nYou can now log in with these credentials at:');
    console.log('http://localhost:5173/login');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
