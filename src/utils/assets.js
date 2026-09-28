// MarketLink Local Image Assets Catalog
import logoImg from '../assets/logo/Screenshot 2026-09-26 220833.png';

// Hero Sections
import heroFarm1 from '../assets/hero-sections/farm1.jpg';
import hero9 from '../assets/hero-sections/download (9).jpg';
import hero10 from '../assets/hero-sections/download (10).jpg';
import hero11 from '../assets/hero-sections/download (11).jpg';
import hero12 from '../assets/hero-sections/download (12).jpg';

// Fruits and Vegie Stalls
import stallAix from '../assets/fruits-and-vegie-stalls/Aix upload.jpg';
import stallVenice from '../assets/fruits-and-vegie-stalls/Farmers market, Venice 🍓.jpg';
import stall10 from '../assets/fruits-and-vegie-stalls/download (10).jpg';
import stall11 from '../assets/fruits-and-vegie-stalls/download (11).jpg';
import stall12 from '../assets/fruits-and-vegie-stalls/download (12).jpg';
import stall14 from '../assets/fruits-and-vegie-stalls/download (14).jpg';
import stallPosi from '../assets/fruits-and-vegie-stalls/posi🌶️.jpg';
import stallSun from '../assets/fruits-and-vegie-stalls/🌞.jpg';
import stallYalta from '../assets/fruits-and-vegie-stalls/📍Yalta.jpg';
import stallVibrant from '../assets/fruits-and-vegie-stalls/Vibrant Summer Wallpapers for Your Screen.jpg';

// Fruits & Vegies Produce
import prodDownload from '../assets/fruits-vegies/download.jpg';
import prod1 from '../assets/fruits-vegies/download (1).jpg';
import prod2 from '../assets/fruits-vegies/download (2).jpg';
import prod3 from '../assets/fruits-vegies/download (3).jpg';
import prod4 from '../assets/fruits-vegies/download (4).jpg';
import prod5 from '../assets/fruits-vegies/download (5).jpg';
import prod6 from '../assets/fruits-vegies/download (6).jpg';
import prod7 from '../assets/fruits-vegies/download (7).jpg';
import prod8 from '../assets/fruits-vegies/download (8).jpg';
import prod13 from '../assets/fruits-vegies/download (13).jpg';
import prodApples from '../assets/fruits-vegies/Fresh Dewy Apples in the Orchard.jpg';
import prodLemons from '../assets/fruits-vegies/Lemons, limonlar_.jpg';
import prodTomatoes from '../assets/fruits-vegies/🍅🍅.jpg';
import prodGarden from '../assets/fruits-vegies/The Garden Nymph.jpg';
import prodHarvest from '../assets/fruits-vegies/Harvest Home_ Alpine Bounty.jpg';
import prodBounty from '../assets/fruits-vegies/390_ Nine Favorite Things_.jpg';
import prodPhoto from '../assets/fruits-vegies/Photo_.jpg';

export const ASSETS = {
  logo: logoImg,
  heroes: [heroFarm1, hero9, hero10, hero11, hero12],
  stalls: [
    stallAix,
    stallVenice,
    stall10,
    stall11,
    stall12,
    stall14,
    stallPosi,
    stallSun,
    stallYalta,
    stallVibrant,
  ],
  produce: [
    prodTomatoes,
    prodApples,
    prodLemons,
    prod1,
    prod2,
    prod3,
    prod4,
    prod5,
    prod6,
    prod7,
    prod8,
    prod13,
    prodDownload,
    prodHarvest,
    prodGarden,
    prodBounty,
    prodPhoto,
  ],
};

export function getProductImage(product, index = 0) {
  if (product?.imageUrl && !product.imageUrl.includes('unsplash')) {
    return product.imageUrl;
  }
  const name = (product?.name || '').toLowerCase();
  if (name.includes('tomato')) return prodTomatoes;
  if (name.includes('apple')) return prodApples;
  if (name.includes('lemon')) return prodLemons;
  if (name.includes('spinach') || name.includes('green') || name.includes('salad')) return prod1;
  if (name.includes('carrot') || name.includes('root')) return prod2;
  if (name.includes('honey')) return prod3;
  if (name.includes('egg') || name.includes('dairy') || name.includes('cheese')) return prod4;
  if (name.includes('berry') || name.includes('strawb')) return prod5;

  const idx = Math.abs((name.length + index) % ASSETS.produce.length);
  return ASSETS.produce[idx];
}

export function getMarketImage(market, index = 0) {
  if (market?.imageUrl && !market.imageUrl.includes('unsplash')) {
    return market.imageUrl;
  }
  const name = (market?.name || '').toLowerCase();
  if (name.includes('downtown') || name.includes('central')) return stallAix;
  if (name.includes('westside') || name.includes('community')) return stallVenice;
  const idx = Math.abs((name.length + index) % ASSETS.stalls.length);
  return ASSETS.stalls[idx];
}

export function getFarmerImage(farmer, index = 0) {
  const name = (farmer?.businessName || '').toLowerCase();
  if (name.includes('green valley')) return stall10;
  if (name.includes('sunrise') || name.includes('apiary')) return stallSun;
  const idx = Math.abs((name.length + index) % ASSETS.stalls.length);
  return ASSETS.stalls[idx];
}
