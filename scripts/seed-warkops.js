// Script to seed sample warkops into MongoDB
// Usage: node scripts/seed-warkops.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not defined in .env. Set it before running this script.');
  process.exit(1);
}

const warkopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  phone: { type: String, default: '' },
  images: { type: [String], default: [] },
  categories: { type: [String], default: [] },
  openingHours: { type: Array, default: [] },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
}, { timestamps: true });

const Warkop = mongoose.models.Warkop || mongoose.model('Warkop', warkopSchema);

const samples = [
  {
    name: 'Warkop Mawar',
    description: 'Kopi tradisional dan aneka jajanan.',
    address: 'Jl. Merdeka No.1',
    city: 'Banda Aceh',
    phone: '081234567890',
    images: [],
    categories: ['kopi', 'snack'],
    openingHours: [
      { day: 'Senin', open: '08:00', close: '22:00', isOpen: true },
    ],
    latitude: 5.55,
    longitude: 95.32,
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Kopi Senja',
    description: 'Suasana nyaman untuk ngopi malam.',
    address: 'Jl. Teuku Umar No.12',
    city: 'Banda Aceh',
    phone: '082345678901',
    images: [],
    categories: ['kopi', 'dessert'],
    openingHours: [
      { day: 'Senin', open: '10:00', close: '23:00', isOpen: true },
    ],
    latitude: 5.56,
    longitude: 95.33,
    isVerified: false,
    isActive: true,
  },
  {
    name: 'Warung Kopi Kita',
    description: 'Rasa kopi lokal terbaik.',
    address: 'Jl. Teungku Chik Di Tiro',
    city: 'Banda Aceh',
    phone: '083456789012',
    images: [],
    categories: ['kopi'],
    openingHours: [
      { day: 'Senin', open: '06:00', close: '20:00', isOpen: true },
    ],
    latitude: 5.57,
    longitude: 95.34,
    isVerified: true,
    isActive: true,
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    const existing = await Warkop.countDocuments();
    console.log(`Existing warkops in DB: ${existing}`);

    if (existing === 0) {
      console.log('Seeding sample warkops...');
      await Warkop.insertMany(samples);
      console.log('Seeding complete.');
    } else {
      console.log('DB already has warkops. No changes made.');
    }

    await mongoose.connection.close();
    console.log('Disconnected.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
