/**
 * Script to create admin user
 * Run with: node scripts/create-admin.js
 * Or: npm run create-admin
 */

const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@warkopkamoe.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Super Admin';

// User Schema (simplified version matching the model)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: {
    type: String,
    enum: ['customer', 'warkop_owner', 'admin'],
    default: 'customer',
  },
  isVerified: { type: Boolean, default: false },
  warkopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warkop' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function hashPassword(password) {
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function createAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    
    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists with email: ${ADMIN_EMAIL}`);
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Name: ${existingAdmin.name}`);
      console.log(`🔑 Role: ${existingAdmin.role}`);
      console.log(`✓ Verified: ${existingAdmin.isVerified}`);
      console.log('\n💡 If you need to reset the password, delete this user from MongoDB and run this script again.');
      
      await mongoose.connection.close();
      return;
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const hashedPassword = await hashPassword(ADMIN_PASSWORD);

    // Create admin user
    const adminUser = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      phone: '081234567890',
      role: 'admin',
      isVerified: true,
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!\n');
    console.log('📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:    ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log(`👤 Name:     ${ADMIN_NAME}`);
    console.log(`🎯 Role:     admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Login at: http://localhost:3000/auth/login');
    console.log('🎛️  Admin Dashboard: http://localhost:3000/admin/dashboard\n');
    console.log('⚠️  IMPORTANT: Change the password after first login in production!');

    await mongoose.connection.close();
    console.log('\n✅ Done! MongoDB connection closed.');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
createAdmin();
