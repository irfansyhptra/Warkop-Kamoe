/**
 * Script to reset admin password
 * Run with: node scripts/reset-admin-password.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@warkopkamoe.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123';

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
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function resetAdminPassword() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    const adminUser = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    
    if (!adminUser) {
      console.log(`❌ Admin user not found with email: ${ADMIN_EMAIL}`);
      console.log('💡 Run "npm run create-admin" to create the admin user first.');
      await mongoose.connection.close();
      return;
    }

    console.log(`✓ Found admin user: ${adminUser.name} (${adminUser.email})`);
    console.log('🔒 Updating password...');

    // Hash new password
    const hashedPassword = await hashPassword(ADMIN_PASSWORD);
    
    // Update password
    adminUser.password = hashedPassword;
    adminUser.isVerified = true; // Ensure admin is verified
    await adminUser.save();

    console.log('✅ Admin password updated successfully!\n');
    console.log('📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:    ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log(`👤 Name:     ${adminUser.name}`);
    console.log(`🎯 Role:     ${adminUser.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Login at: http://localhost:3000/auth/login');
    console.log('🎛️  Admin Dashboard: http://localhost:3000/admin/dashboard\n');

    await mongoose.connection.close();
    console.log('✅ Done! MongoDB connection closed.');
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
resetAdminPassword();
