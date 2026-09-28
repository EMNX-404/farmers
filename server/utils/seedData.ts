import { User } from '../models/User.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { Market } from '../models/Market.ts';
import { Category } from '../models/Category.ts';
import { Product } from '../models/Product.ts';
import { WeeklyInventory } from '../models/WeeklyInventory.ts';
import { PickupSlot } from '../models/PickupSlot.ts';
import { Order } from '../models/Order.ts';
import { Review } from '../models/Review.ts';
import { Announcement } from '../models/Announcement.ts';
import { hashPassword } from './password.ts';

export async function seedDevelopmentData(): Promise<void> {
  const existingUserCount = await User.countDocuments();
  if (existingUserCount > 0) {
    console.log('[Seed] Database already contains records. Skipping seed.');
    return;
  }

  console.log('[Seed] Seeding realistic MarketLink development data...');

  const defaultPasswordHash = await hashPassword('MarketLink2026!');

  // 1. Admin
  const admin = await User.create({
    name: 'MarketLink Super Admin',
    email: 'admin@marketlink.local',
    password: defaultPasswordHash,
    role: 'admin',
    contactNumber: '+1 (555) 010-0001',
    address: '100 Market Center Way, Suite 400',
    status: 'active',
  });

  // 2. Customers
  const customerEmma = await User.create({
    name: 'Emma Watson',
    email: 'customer.emma@marketlink.local',
    password: defaultPasswordHash,
    role: 'customer',
    contactNumber: '+1 (555) 010-0002',
    address: '742 Evergreen Terrace',
    status: 'active',
  });

  const customerDavid = await User.create({
    name: 'David Chen',
    email: 'customer.david@marketlink.local',
    password: defaultPasswordHash,
    role: 'customer',
    contactNumber: '+1 (555) 010-0003',
    address: '124 Conch Street',
    status: 'active',
  });

  // 3. Markets
  const downtownMarket = await Market.create({
    name: 'Downtown Central Farmers Market',
    description: 'The historic Saturday & Sunday open-air market hosting local growers, bakers, and artisans.',
    address: '101 Market Square Plaza',
    city: 'Springfield',
    state: 'OR',
    zipCode: '97477',
    location: {
      type: 'Point',
      coordinates: [-123.02, 44.05],
    },
    marketDays: ['Saturday', 'Sunday'],
    operatingHours: '8:00 AM - 1:00 PM',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80',
  });

  const westsideMarket = await Market.create({
    name: 'Westside Community Green Market',
    description: 'Midweek and weekend neighborhood market focused on seasonal produce, honey, and fresh cheeses.',
    address: '450 Oak Tree Boulevard',
    city: 'Springfield',
    state: 'OR',
    zipCode: '97478',
    location: {
      type: 'Point',
      coordinates: [-123.08, 44.06],
    },
    marketDays: ['Wednesday', 'Saturday'],
    operatingHours: '9:00 AM - 2:00 PM',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  });

  // 4. Farmers
  const userFarmerBob = await User.create({
    name: 'Bob Miller',
    email: 'farmer.bob@marketlink.local',
    password: defaultPasswordHash,
    role: 'farmer',
    contactNumber: '+1 (555) 010-0010',
    address: '884 Miller Creek Road',
    status: 'active',
  });

  const farmerBobProfile = await FarmerProfile.create({
    user: userFarmerBob._id,
    businessName: 'Green Valley Organic Farm',
    description: 'Family-owned certified organic vegetable and greens farm operating sustainably since 1994.',
    contactNumber: '+1 (555) 010-0010',
    address: '884 Miller Creek Road, Springfield OR',
    markets: [downtownMarket._id, westsideMarket._id],
    marketDays: ['Saturday', 'Sunday'],
    pickupWindows: ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 13:00'],
    location: {
      type: 'Point',
      coordinates: [-123.01, 44.04],
    },
    approvalStatus: 'approved',
    ratingAverage: 4.8,
    ratingCount: 18,
  });

  userFarmerBob.farmerProfile = farmerBobProfile._id;
  await userFarmerBob.save();

  const userFarmerAlice = await User.create({
    name: 'Alice Green',
    email: 'farmer.alice@marketlink.local',
    password: defaultPasswordHash,
    role: 'farmer',
    contactNumber: '+1 (555) 010-0020',
    address: '320 Honeybee Hollow Lane',
    status: 'active',
  });

  const farmerAliceProfile = await FarmerProfile.create({
    user: userFarmerAlice._id,
    businessName: 'Sunrise Orchards & Apiary',
    description: 'Crisp tree fruit, berries, and raw unfiltered wildflower and clover honey.',
    contactNumber: '+1 (555) 010-0020',
    address: '320 Honeybee Hollow Lane, Springfield OR',
    markets: [downtownMarket._id],
    marketDays: ['Saturday'],
    pickupWindows: ['08:30 - 10:30', '10:30 - 12:30'],
    location: {
      type: 'Point',
      coordinates: [-122.98, 44.08],
    },
    approvalStatus: 'approved',
    ratingAverage: 4.9,
    ratingCount: 24,
  });

  userFarmerAlice.farmerProfile = farmerAliceProfile._id;
  await userFarmerAlice.save();

  // Associate farmers with markets
  downtownMarket.associatedFarmers = [farmerBobProfile._id, farmerAliceProfile._id];
  await downtownMarket.save();
  westsideMarket.associatedFarmers = [farmerBobProfile._id];
  await westsideMarket.save();

  // 5. Categories
  const catProduce = await Category.create({
    name: 'Vegetables & Greens',
    slug: 'vegetables-greens',
    description: 'Fresh crisp vegetables, greens, carrots, and root crops.',
    icon: 'Carrot',
    isActive: true,
  });

  const catFruit = await Category.create({
    name: 'Fruits & Berries',
    slug: 'fruits-berries',
    description: 'Orchard apples, pears, strawberries, and seasonal berries.',
    icon: 'Apple',
    isActive: true,
  });

  const catHoney = await Category.create({
    name: 'Honey & Preserves',
    slug: 'honey-preserves',
    description: 'Raw local honey, artisan fruit jams, and pickled vegetables.',
    icon: 'Jar',
    isActive: true,
  });

  const catDairy = await Category.create({
    name: 'Dairy & Farm Eggs',
    slug: 'dairy-eggs',
    description: 'Pasture-raised eggs, artisanal cheeses, and fresh milk.',
    icon: 'Egg',
    isActive: true,
  });

  // 6. Products
  const prodTomatoes = await Product.create({
    farmer: farmerBobProfile._id,
    name: 'Heirloom Vine-Ripened Tomatoes',
    category: catProduce._id,
    description: 'Sweet, juicy heirloom tomatoes picked ripe the morning of market. Perfect for salads and sauces.',
    price: 4.5,
    unit: 'lb',
    stockQuantity: 45,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    availabilityStatus: 'available',
    ratingAverage: 4.9,
    ratingCount: 12,
  });

  const prodSpinach = await Product.create({
    farmer: farmerBobProfile._id,
    name: 'Organic Tender Baby Spinach',
    category: catProduce._id,
    description: 'Tender, triple-washed crisp baby spinach leaves packed with nutrients.',
    price: 3.75,
    unit: 'bunch',
    stockQuantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    availabilityStatus: 'available',
    ratingAverage: 4.7,
    ratingCount: 8,
  });

  const prodCarrots = await Product.create({
    farmer: farmerBobProfile._id,
    name: 'Rainbow Crunch Carrots',
    category: catProduce._id,
    description: 'Vibrant purple, yellow, and orange heirloom sweet crunchy carrots with greens attached.',
    price: 3.5,
    unit: 'bunch',
    stockQuantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=600&q=80',
    availabilityStatus: 'available',
    ratingAverage: 4.8,
    ratingCount: 6,
  });

  const prodHoney = await Product.create({
    farmer: farmerAliceProfile._id,
    name: 'Raw Wildflower Honey (16 oz Glass Jar)',
    category: catHoney._id,
    description: 'Pure unfiltered raw wildflower honey harvested straight from our orchard apiary boxes.',
    price: 12.0,
    unit: 'jar',
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    availabilityStatus: 'available',
    ratingAverage: 5.0,
    ratingCount: 15,
  });

  const prodApples = await Product.create({
    farmer: farmerAliceProfile._id,
    name: 'Crisp Honeycrisp Apples',
    category: catFruit._id,
    description: 'Exceptionally sweet and crunchy Honeycrisp apples freshly harvested from our trees.',
    price: 3.99,
    unit: 'lb',
    stockQuantity: 60,
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    availabilityStatus: 'available',
    ratingAverage: 4.8,
    ratingCount: 11,
  });

  // 7. Weekly Inventory
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  await WeeklyInventory.create({
    product: prodTomatoes._id,
    farmer: farmerBobProfile._id,
    weekStartDate: startOfWeek,
    weekEndDate: endOfWeek,
    quantity: 45,
    price: 4.5,
    isAvailable: true,
  });

  // 8. Pickup Slots
  const nextSaturday = new Date(startOfWeek);
  nextSaturday.setDate(startOfWeek.getDate() + 5);

  const slot1 = await PickupSlot.create({
    farmer: farmerBobProfile._id,
    market: downtownMarket._id,
    pickupDate: nextSaturday,
    dayOfWeek: 'Saturday',
    startTime: '09:00',
    endTime: '11:00',
    slotCapacity: 20,
    bookedCount: 2,
    cutoffHours: 12,
    isAvailable: true,
  });

  await PickupSlot.create({
    farmer: farmerAliceProfile._id,
    market: downtownMarket._id,
    pickupDate: nextSaturday,
    dayOfWeek: 'Saturday',
    startTime: '09:00',
    endTime: '11:00',
    slotCapacity: 15,
    bookedCount: 1,
    cutoffHours: 12,
    isAvailable: true,
  });

  // 9. Sample Pre-Orders
  await Order.create({
    orderNumber: 'ML-202609-1001',
    customer: customerEmma._id,
    farmer: farmerBobProfile._id,
    market: downtownMarket._id,
    items: [
      {
        product: prodTomatoes._id,
        name: prodTomatoes.name,
        price: prodTomatoes.price,
        quantity: 2,
        unit: prodTomatoes.unit,
        subtotal: 9.0,
      },
      {
        product: prodSpinach._id,
        name: prodSpinach.name,
        price: prodSpinach.price,
        quantity: 1,
        unit: prodSpinach.unit,
        subtotal: 3.75,
      },
    ],
    totalAmount: 12.75,
    pickupDate: nextSaturday,
    pickupTimeSlot: '09:00 - 11:00',
    pickupSlot: slot1._id,
    status: 'placed',
    paymentMethod: 'cash_at_pickup',
    paymentStatus: 'pending',
    customerNotes: 'Please pack in paper bags if possible.',
    placedAt: new Date(),
  });

  await Order.create({
    orderNumber: 'ML-202609-1002',
    customer: customerDavid._id,
    farmer: farmerAliceProfile._id,
    market: downtownMarket._id,
    items: [
      {
        product: prodHoney._id,
        name: prodHoney.name,
        price: prodHoney.price,
        quantity: 1,
        unit: prodHoney.unit,
        subtotal: 12.0,
      },
    ],
    totalAmount: 12.0,
    pickupDate: nextSaturday,
    pickupTimeSlot: '09:00 - 11:00',
    status: 'accepted',
    paymentMethod: 'cash_at_pickup',
    paymentStatus: 'pending',
    placedAt: new Date(Date.now() - 3600000 * 4),
    acceptedAt: new Date(Date.now() - 3600000 * 2),
  });

  // 10. Sample Reviews
  await Review.create({
    customer: customerEmma._id,
    farmer: farmerBobProfile._id,
    product: prodTomatoes._id,
    rating: 5,
    comment: 'The sweetest heirloom tomatoes I have tasted this season! Pickup was super easy at the stall.',
    farmerResponse: {
      comment: 'Thank you so much Emma! Glad you loved them. See you this weekend!',
      respondedAt: new Date(),
    },
    isModerated: false,
  });

  // 11. Announcements
  await Announcement.create({
    title: 'Welcome to MarketLink Pre-Ordering!',
    content: 'Pre-order your favorite farm-fresh produce directly from local growers and pick up in person at the weekend market. Cash and in-person payments accepted at pickup!',
    author: admin._id,
    targetRole: 'all',
    isPublished: true,
    publishedAt: new Date(),
  });

  console.log('[Seed] MarketLink development seed data completed successfully.');
}
