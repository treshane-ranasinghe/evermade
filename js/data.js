// Product catalogue — static data (no backend).
// Prices are placeholders — update them to your real prices.
const CURRENCY = 'Rs ';
const FREE_SHIP = 15000;
const IMG = name => `assets/images/${name}.jpg`;
const UK_SIZES = ['6', '8', '10', '12', '14', '16', '18', '20'];

const PRODUCTS = [
  {
    id: 'aura-abstract-gown', name: 'Aura Abstract Gown', category: 'midi', price: 12950,
    images: [IMG('aura-gown')],
    colors: [{ name: 'Abstract Coral', hex: '#e2563f' }],
    sizes: UK_SIZES, badge: 'Bestseller', rating: 4.9, reviews: 64,
    desc: 'Art in motion. A strapless, fit-and-flare gown in an abstract coral print with a fitted bodice and a full, floor-sweeping skirt.'
  },
  {
    id: 'ruby-button-front-maxi', name: 'Ruby Button-Front Maxi', category: 'midi', price: 10950,
    images: [IMG('ruby-maxi')],
    colors: [{ name: 'Ruby', hex: '#b8261e' }],
    sizes: UK_SIZES, badge: 'New', rating: 4.8, reviews: 38,
    desc: 'A sleeveless maxi with a sharp collar, plunging neckline and a full button-front placket. Classic details, effortless shape.'
  },
  {
    id: 'ivory-broderie-mini', name: 'Ivory Broderie Mini', category: 'mini', price: 7450,
    images: [IMG('ivory-mini')],
    colors: [{ name: 'Ivory', hex: '#f3efe6' }],
    sizes: UK_SIZES, badge: 'New', rating: 4.8, reviews: 52,
    desc: 'A textured white mini with a V-neckline, softly puffed sleeves and a flattering fitted waist. Made for sunny days.'
  },
  {
    id: 'gingham-tie-set', name: 'Gingham Tie-Front Set', category: 'coords', price: 9450,
    images: [IMG('gingham-set')],
    colors: [{ name: 'White / Red Gingham', hex: '#c8404a' }],
    sizes: UK_SIZES, rating: 4.7, reviews: 41,
    desc: 'A crisp white wrap top with a bow tie at the waist, paired with a tiered red gingham maxi skirt.'
  },
  {
    id: 'tropicana-puff-mini', name: 'Tropicana Puff-Sleeve Mini', category: 'mini', price: 7950,
    images: [IMG('tropicana-mini')],
    colors: [{ name: 'Tropical Print', hex: '#2f9b6a' }],
    sizes: UK_SIZES, badge: 'Limited', rating: 4.9, reviews: 77,
    desc: 'A sweetheart-neck mini in a bold tropical print with puff sleeves. Holiday energy, all year round.'
  },
  {
    id: 'ivory-slit-maxi', name: 'Ivory Slit Maxi', category: 'midi', price: 8950,
    images: [IMG('slit-maxi-2'), IMG('slit-maxi')],
    colors: [{ name: 'Ivory', hex: '#f3efe6' }],
    sizes: UK_SIZES, rating: 4.8, reviews: 46,
    desc: 'A minimalist square-neck maxi on delicate straps with a thigh-high side slit. Clean, cool and endlessly versatile.'
  },
  {
    id: 'scarlet-puff-midi', name: 'Scarlet Puff-Sleeve Midi', category: 'midi', price: 9950, oldPrice: 12950,
    images: [IMG('red-puff-midi')],
    colors: [{ name: 'Scarlet', hex: '#c0201f' }],
    sizes: UK_SIZES, badge: 'Sale', rating: 5.0, reviews: 112,
    desc: 'Our best seller. An off-shoulder midi with puff sleeves, a tie-front bodice and a skirt that swings with every step.'
  },
  {
    id: 'mocha-wrap-coord', name: 'Mocha Wrap Co-ord', category: 'coords', price: 9950,
    images: [IMG('mocha-coord')],
    colors: [{ name: 'Mocha', hex: '#5a3a2c' }],
    sizes: UK_SIZES, badge: 'Limited', rating: 4.8, reviews: 29,
    desc: 'A boxy cropped top and a high-waisted wrap midi skirt with a button detail and front split. Limited stock.'
  },
  {
    id: 'lemon-sorbet-midi', name: 'The Evermade Midi', category: 'midi', price: 8450,
    images: [IMG('lemon-midi')],
    colors: [{ name: 'Lemon Sorbet', hex: '#efe39f' }],
    sizes: UK_SIZES, badge: 'Bestseller', rating: 4.9, reviews: 90,
    desc: 'Our signature midi in soft lemon. A high round neck, fitted bodice, pleated skirt and hidden pockets.'
  },
  {
    id: 'rose-stripe-shirt-dress', name: 'Rosé Stripe Shirt Dress', category: 'midi', price: 8950,
    images: [IMG('rose-shirt-dress')],
    colors: [{ name: 'Rosé Stripe', hex: '#d9909f' }],
    sizes: UK_SIZES, rating: 4.7, reviews: 35,
    desc: 'A sleeveless pink pinstripe shirt dress with a self-tie belt and a flowing midi skirt.'
  },
  {
    id: 'riviera-stripe-shorts-set', name: 'Riviera Stripe Shorts Set', category: 'coords', price: 7950,
    images: [IMG('stripe-shorts-set')],
    colors: [{ name: 'Blue Stripe', hex: '#7f95b8' }],
    sizes: UK_SIZES, badge: 'New', rating: 4.8, reviews: 22,
    desc: 'A cropped short-sleeve shirt and matching high-waisted shorts in crisp blue stripes. Weekend-ready.'
  },
  {
    id: 'stripe-bandeau-coord', name: 'Stripe Bandeau Co-ord', category: 'coords', price: 8450,
    images: [IMG('stripe-bandeau-set')],
    colors: [{ name: 'Grey Stripe', hex: '#8e939b' }],
    sizes: UK_SIZES, rating: 4.7, reviews: 31,
    desc: 'A shirred bandeau top on skinny straps with a matching high-rise maxi skirt. Breezy and effortlessly put-together.'
  },
  {
    id: 'polka-strapless-midi', name: 'Polka Strapless Midi', category: 'midi', price: 9450,
    images: [IMG('polka-midi')],
    colors: [{ name: 'Ivory Polka', hex: '#f1ede4' }],
    sizes: UK_SIZES, rating: 4.9, reviews: 48,
    desc: 'A strapless sweetheart midi in a classic black-on-ivory polka dot with a full, fluid skirt.'
  }
];
