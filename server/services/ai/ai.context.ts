import { Market } from '../../models/Market.ts';
import { FarmerProfile } from '../../models/FarmerProfile.ts';
import { Product } from '../../models/Product.ts';
import { Category } from '../../models/Category.ts';
import { AIRetrievedContext } from './ai.types.ts';

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export async function buildAIContext(query: string): Promise<{ contextText: string; summary: { marketsFound: number; farmersFound: number; productsFound: number } }> {
  const queryLower = query.toLowerCase();
  
  // 1. Detect day of week in query
  const detectedDays = DAYS_OF_WEEK.filter((day) => queryLower.includes(day));

  // 2. Query markets
  const marketFilter: any = { status: 'active' };
  if (detectedDays.length > 0) {
    marketFilter.marketDays = {
      $in: detectedDays.map((d) => new RegExp(d, 'i')),
    };
  }

  const markets = await Market.find(marketFilter)
    .limit(8)
    .populate('associatedFarmers', 'businessName marketDays')
    .lean();

  // 3. Query farmers
  const farmerFilter: any = { approvalStatus: 'approved' };
  if (detectedDays.length > 0) {
    farmerFilter.marketDays = {
      $in: detectedDays.map((d) => new RegExp(d, 'i')),
    };
  }

  const farmers = await FarmerProfile.find(farmerFilter)
    .limit(8)
    .populate('markets', 'name marketDays')
    .lean();

  // 4. Query products
  // Extract keywords (filter out common stopwords)
  const stopWords = new Set([
    'what', 'which', 'where', 'when', 'who', 'how', 'does', 'have', 'there',
    'available', 'product', 'products', 'sell', 'market', 'farmer', 'farmers',
    'open', 'time', 'pickup', 'pre-order', 'order', 'can', 'you', 'give', 'tell',
    'please', 'this', 'that', 'with', 'from', 'about', 'some', 'any', 'the'
  ]);

  const rawTokens = queryLower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w) && !DAYS_OF_WEEK.includes(w));

  let productFilter: any = { availabilityStatus: 'available' };
  if (rawTokens.length > 0) {
    const regexOr = rawTokens.map((token) => ({ name: { $regex: token, $options: 'i' } }));
    productFilter.$or = regexOr;
  }

  let products = await Product.find(productFilter)
    .limit(10)
    .populate('farmer', 'businessName')
    .populate('category', 'name')
    .lean();

  // If no products matched the specific tokens, retrieve standard in-stock products
  if (products.length === 0 && rawTokens.length === 0) {
    products = await Product.find({ availabilityStatus: 'available' })
      .limit(6)
      .populate('farmer', 'businessName')
      .populate('category', 'name')
      .lean();
  }

  // Build Context Text
  let contextParts: string[] = [];

  contextParts.push('=== CURRENT MARKETLINK DATABASE DATA ===');

  contextParts.push('\n[ACTIVE MARKETS]:');
  if (markets.length === 0) {
    contextParts.push('No active markets found matching the query.');
  } else {
    markets.forEach((m: any) => {
      const associated = (m.associatedFarmers || [])
        .map((f: any) => f.businessName || 'Unnamed Farm')
        .join(', ');
      contextParts.push(
        `- ${m.name}: Address: "${m.address}". Operating Days: [${(m.marketDays || []).join(', ')}]. Hours: ${m.operatingHours}. Attending Farmers: [${associated || 'None listed'}].`
      );
    });
  }

  contextParts.push('\n[APPROVED FARMERS & STALLS]:');
  if (farmers.length === 0) {
    contextParts.push('No approved farmers found matching the query.');
  } else {
    farmers.forEach((f: any) => {
      const marketNames = (f.markets || [])
        .map((m: any) => m.name || 'Market')
        .join(', ');
      const coords = f.location?.coordinates || [0, 0];
      contextParts.push(
        `- ${f.businessName}: Farm Address: "${f.address}". GPS: [lat: ${coords[1]}, lng: ${coords[0]}]. Days: [${(f.marketDays || []).join(', ')}]. Markets: [${marketNames || 'None'}]. Pickup Windows: [${(f.pickupWindows || []).join(', ')}]. Contact: ${f.contactNumber}.`
      );
    });
  }

  contextParts.push('\n[AVAILABLE PRODUCTS IN STOCK]:');
  if (products.length === 0) {
    contextParts.push('No specific products in stock matched the search criteria.');
  } else {
    products.forEach((p: any) => {
      const farmerName = p.farmer?.businessName || 'Local Farm';
      const catName = p.category?.name || 'Produce';
      contextParts.push(
        `- ${p.name} ($${p.price.toFixed(2)} per ${p.unit}): Sold by "${farmerName}", Category: ${catName}, Stock: ${p.stockQuantity} ${p.unit}, Status: ${p.availabilityStatus}. Description: ${p.description}`
      );
    });
  }

  contextParts.push('\n[ORDERING POLICY & RULES]:');
  contextParts.push(
    '- MarketLink operates on a PRE-ORDER FOR IN-PERSON PICKUP model.\n' +
    '- There are NO online payments, NO credit card charges, and NO home delivery/couriers.\n' +
    '- Customers select products, market location, and pickup time slot.\n' +
    '- Payment is strictly paid in cash or in-person at pickup.\n' +
    '- Order lifecycle: placed -> accepted by farmer -> ready for pickup -> completed at pickup (or declined/cancelled).'
  );

  return {
    contextText: contextParts.join('\n'),
    summary: {
      marketsFound: markets.length,
      farmersFound: farmers.length,
      productsFound: products.length,
    },
  };
}
