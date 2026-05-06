import { Product, Category, Bundle, Designer } from './types.ts';

export const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Living Room',
    slug: 'living-room',
    image: 'https://i.imgur.com/2frVfXv.png',
    description: 'Sofas, coffee tables, and entertainment units.'
  },
  {
    id: '2',
    name: 'Bedroom',
    slug: 'bedroom',
    image: 'https://i.imgur.com/3qP6o4V.png',
    description: 'Beds, wardrobes, and bedside tables.'
  },
  {
    id: '3',
    name: 'Dining Room',
    slug: 'dining-room',
    image: 'https://i.imgur.com/MvP2FNG.jpg',
    description: 'Dining tables, chairs, and sideboards.'
  },
  {
    id: '4',
    name: 'Office',
    slug: 'office',
    image: 'https://i.imgur.com/Qsqo2yG.png',
    description: 'Desks, office chairs, and bookshelves.'
  },
  {
    id: '5',
    name: 'Decor',
    slug: 'decor',
    image: 'https://i.imgur.com/kQDXe9q.png',
    description: 'Mirrors, lighting, and artisanal accents.'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Amakisi Work Table',
    description: 'A minimalist, Afrocentric work table designed for modern productivity. Handcrafted from premium Nigerian mahogany with a sleek matte finish. Features integrated cable management and a hidden drawer for essentials.',
    price: 125000,
    category: 'Office',
    material: 'Mahogany',
    style: 'Contemporary',
    images: [
      'https://i.imgur.com/orMjYLT.png'
    ],
    isMadeInNigeria: true,
    hasAssemblyService: true,
    assemblyCost: 5000,
    isEscrowProtected: true,
    installmentOptions: ['CredPal', 'Carbon'],
    seller: {
      name: 'Taeillo Designs',
      rating: 4.8,
      isVerified: true,
      location: 'Lagos',
      tier: 'Platinum'
    },
    dimensions: {
      width: 120,
      height: 75,
      depth: 60,
      unit: 'cm'
    },
    stock: 15,
    deliverySLA: '3-5 business days',
    model3d: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/SheenChair/glTF-Binary/SheenChair.glb'
  },
  {
    id: 'p2',
    name: 'Lekki Velvet Sofa',
    description: 'Luxurious 3-seater velvet sofa in deep emerald green. Features hand-carved teak legs and high-density foam for ultimate comfort. The fabric is stain-resistant and incredibly soft to the touch.',
    price: 450000,
    category: 'Living Room',
    material: 'Velvet, Teak',
    style: 'Modern Luxury',
    images: [
      'https://i.imgur.com/5SHwpRv.png'
    ],
    isMadeInNigeria: true,
    hasAssemblyService: true,
    assemblyCost: 15000,
    isEscrowProtected: true,
    installmentOptions: ['CredPal'],
    seller: {
      name: 'HOG Furniture',
      rating: 4.5,
      isVerified: true,
      location: 'Lagos',
      tier: 'Gold'
    },
    dimensions: {
      width: 220,
      height: 85,
      depth: 95,
      unit: 'cm'
    },
    stock: 5,
    deliverySLA: '7-10 business days',
    model3d: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/SheenChair/glTF-Binary/SheenChair.glb'
  },
  {
    id: 'p3',
    name: 'Abuja Teak Dining Set',
    description: 'Solid teak dining table with 6 matching chairs. Durable and elegant for family gatherings, featuring traditional Nigerian motifs carved into the chair backs.',
    price: 680000,
    category: 'Dining Room',
    material: 'Teak',
    style: 'Traditional',
    images: [
      'https://i.imgur.com/dvUoc9p.png'
    ],
    isMadeInNigeria: true,
    hasAssemblyService: true,
    assemblyCost: 25000,
    isEscrowProtected: true,
    seller: {
      name: 'Local Artisan Collective',
      rating: 4.2,
      isVerified: false,
      location: 'Abuja',
      tier: 'Silver'
    },
    dimensions: {
      width: 180,
      height: 75,
      depth: 90,
      unit: 'cm'
    },
    stock: 2,
    deliverySLA: '14 business days',
    model3d: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Chair/glTF-Binary/Chair.glb'
  },
  {
    id: 'p4',
    name: 'Eko Lounge Chair',
    description: 'A sculptural lounge chair inspired by the Lagos coastline. Ergonomic design with premium leather upholstery and a brushed steel frame.',
    price: 185000,
    category: 'Living Room',
    material: 'Leather, Steel',
    style: 'Industrial',
    images: [
      'https://i.imgur.com/7XotXYH.png'
    ],
    isMadeInNigeria: true,
    hasAssemblyService: false,
    isEscrowProtected: true,
    seller: {
      name: 'Maksaro',
      rating: 4.9,
      isVerified: true,
      location: 'Lagos',
      tier: 'Platinum'
    },
    dimensions: {
      width: 85,
      height: 95,
      depth: 90,
      unit: 'cm'
    },
    stock: 8,
    deliverySLA: '5 business days',
    model3d: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Chair/glTF-Binary/Chair.glb'
  },
  {
    id: 'p5',
    name: 'Zaria Bookshelf',
    description: 'Modular bookshelf system made from sustainable bamboo. Perfect for home offices and libraries, offering flexible storage solutions with adjustable shelving heights.',
    price: 95000,
    category: 'Office',
    material: 'Bamboo',
    style: 'Minimalist',
    images: [
      'https://i.imgur.com/GWqiriD.png'
    ],
    isMadeInNigeria: true,
    hasAssemblyService: true,
    assemblyCost: 3500,
    isEscrowProtected: true,
    seller: {
      name: 'Eco-Artisans',
      rating: 4.6,
      isVerified: true,
      location: 'Kaduna',
      tier: 'Gold'
    },
    dimensions: {
      width: 100,
      height: 180,
      depth: 30,
      unit: 'cm'
    },
    stock: 12,
    deliverySLA: '7 business days'
  },
  {
    id: 'p6',
    name: 'Obudu Bed Frame',
    description: 'The centerpiece of a regal sanctuary. A king-sized masterpiece forged from solid Nigerian mahogany, featuring an intricate hand-woven rattan headboard. Its clean lines are accented by bespoke tribal geometric motifs, blending heritage artistry with contemporary elegance.',
    price: 320000,
    category: 'Bedroom',
    material: 'Mahogany, Rattan',
    style: 'Modern Luxury',
    images: [
      'https://i.imgur.com/abTE5Xf.png'
    ],
    isMadeInNigeria: true,
    hasAssemblyService: true,
    assemblyCost: 12000,
    isEscrowProtected: true,
    installmentOptions: ['CredPal'],
    seller: {
      name: 'Mountain Crafts',
      rating: 4.7,
      isVerified: true,
      location: 'Cross River',
      tier: 'Gold'
    },
    dimensions: {
      width: 200,
      height: 110,
      depth: 210,
      unit: 'cm'
    },
    stock: 4,
    deliverySLA: '10-12 business days'
  },
  {
    id: 'p7',
    name: 'Kano Leather Ottoman',
    description: 'Hand-stitched leather ottoman using traditional Kano tanning techniques. Versatile as a footrest or extra seating.',
    price: 45000,
    category: 'Living Room',
    material: 'Goat Leather',
    style: 'Bohemian',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=2070&auto=format&fit=crop'
    ],
    isMadeInNigeria: true,
    hasAssemblyService: false,
    isEscrowProtected: true,
    seller: {
      name: 'Northern Hides',
      rating: 4.9,
      isVerified: true,
      location: 'Kano',
      tier: 'Platinum'
    },
    dimensions: {
      width: 50,
      height: 35,
      depth: 50,
      unit: 'cm'
    },
    stock: 20,
    deliverySLA: '4-6 business days'
  },
  {
    id: 'p8',
    name: 'Ibadan Rattan Side Table',
    description: 'Lightweight and durable side table made from locally sourced rattan. Adds a touch of tropical elegance to any room.',
    price: 35000,
    category: 'Living Room',
    material: 'Rattan',
    style: 'Coastal',
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2070&auto=format&fit=crop'
    ],
    isMadeInNigeria: true,
    hasAssemblyService: false,
    isEscrowProtected: true,
    seller: {
      name: 'Vine & Weave',
      rating: 4.4,
      isVerified: false,
      location: 'Ibadan',
      tier: 'Bronze'
    },
    dimensions: {
      width: 45,
      height: 50,
      depth: 45,
      unit: 'cm'
    },
    stock: 10,
    deliverySLA: '3-5 business days'
  },
  {
    id: 'p9',
    name: 'Enugu Coal Coffee Table',
    description: 'A bold, industrial coffee table crafted from charred oak and steel. Inspired by the mining heritage of Enugu, this piece features a unique "yakisugi" finish.',
    price: 85000,
    category: 'Living Room',
    material: 'Charred Oak, Steel',
    style: 'Industrial',
    images: [
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565791380713-1756b9a05343?q=80&w=2070&auto=format&fit=crop'
    ],
    isMadeInNigeria: true,
    hasAssemblyService: false,
    isEscrowProtected: true,
    seller: {
      name: 'Coal City Crafts',
      rating: 4.6,
      isVerified: true,
      location: 'Enugu',
      tier: 'Gold'
    },
    dimensions: {
      width: 110,
      height: 40,
      depth: 60,
      unit: 'cm'
    },
    stock: 6,
    deliverySLA: '5-7 business days'
  },
  {
    id: 'p10',
    name: 'Calabar Cane Armchair',
    description: 'An airy and elegant armchair featuring hand-woven cane panels and a solid mahogany frame. Perfect for creating a relaxed, coastal vibe in your home.',
    price: 145000,
    category: 'Living Room',
    material: 'Cane, Mahogany',
    style: 'Coastal',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519947486511-46149fa0a254?q=80&w=2070&auto=format&fit=crop'
    ],
    isMadeInNigeria: true,
    hasAssemblyService: false,
    isEscrowProtected: true,
    seller: {
      name: 'Cross River Weavers',
      rating: 4.8,
      isVerified: true,
      location: 'Calabar',
      tier: 'Platinum'
    },
    dimensions: {
      width: 75,
      height: 85,
      depth: 80,
      unit: 'cm'
    },
    stock: 4,
    deliverySLA: '7-10 business days'
  },
  {
    id: 'p11',
    name: 'Jos Pine Wardrobe',
    description: 'A spacious and rustic wardrobe made from reclaimed pine. Features traditional joinery and a natural wax finish that highlights the wood grain.',
    price: 280000,
    category: 'Bedroom',
    material: 'Reclaimed Pine',
    style: 'Rustic',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=2070&auto=format&fit=crop'
    ],
    isMadeInNigeria: true,
    hasAssemblyService: true,
    assemblyCost: 15000,
    isEscrowProtected: true,
    seller: {
      name: 'Plateau Pine Works',
      rating: 4.5,
      isVerified: true,
      location: 'Jos',
      tier: 'Gold'
    },
    dimensions: {
      width: 150,
      height: 200,
      depth: 60,
      unit: 'cm'
    },
    stock: 3,
    deliverySLA: '10-14 business days'
  },
  {
    id: 'p12',
    name: 'Benin Bronze Mirror',
    description: 'A statement wall mirror with a hand-cast bronze frame featuring intricate Benin-inspired motifs. A true piece of functional art for your entryway or living room.',
    price: 120000,
    category: 'Decor',
    material: 'Bronze, Glass',
    style: 'Artisanal',
    images: [
      'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513519247354-497a8891112c?q=80&w=2070&auto=format&fit=crop'
    ],
    isMadeInNigeria: true,
    hasAssemblyService: false,
    isEscrowProtected: true,
    seller: {
      name: 'Edo Bronze Guild',
      rating: 4.9,
      isVerified: true,
      location: 'Benin City',
      tier: 'Platinum'
    },
    dimensions: {
      width: 80,
      height: 120,
      depth: 5,
      unit: 'cm'
    },
    stock: 5,
    deliverySLA: '14 business days'
  }
];

export const BUNDLES: Bundle[] = [
  {
    id: 'b1',
    name: 'The Lagos Executive Suite',
    description: 'A complete home office setup for the modern professional. Includes the Amakisi Work Table, Zaria Bookshelf, and a premium ergonomic chair.',
    price: 255000,
    discountPrice: 220000,
    image: 'https://i.imgur.com/7rkjmR9.jpg',
    productIds: ['p1', 'p5'],
    category: 'Office'
  },
  {
    id: 'b2',
    name: 'Emerald Living Room Set',
    description: 'Transform your living space with this luxurious velvet and teak collection. Includes the Lekki Velvet Sofa, Eko Lounge Chair, and Kano Leather Ottoman.',
    price: 680000,
    discountPrice: 610000,
    image: 'https://i.imgur.com/YfE8HiE.jpg',
    productIds: ['p2', 'p4', 'p7'],
    category: 'Living Room'
  },
  {
    id: 'b3',
    name: 'The Obudu Grand Bedroom',
    description: 'An curated editorial sanctuary that pairs our flagship mahogany bed frame with artisan-carved side tables. A celebration of Nigerian textures and modern minimalist luxury.',
    price: 390000,
    discountPrice: 350000,
    image: 'https://i.imgur.com/rsxWl2P.jpg',
    productIds: ['p6', 'p8'],
    category: 'Bedroom'
  },
  {
    id: 'b4',
    name: 'The Coastal Retreat',
    description: 'Bring the relaxed vibe of the coast into your home. Includes the Calabar Cane Armchair and the Ibadan Rattan Side Table.',
    price: 180000,
    discountPrice: 155000,
    image: 'https://i.imgur.com/hFLEfZ7.jpg',
    productIds: ['p10', 'p8'],
    category: 'Living Room'
  }
];

export const DESIGNERS: Designer[] = [
  {
    id: 'd1',
    name: 'Amina Yusuf',
    bio: 'A visionary in contemporary African minimalism, Amina fuses traditional Sahelian geometric patterns with ultra-modern silhouettes. Her work has been featured in international design biennials.',
    image: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=1974&auto=format&fit=crop',
    styles: ['Minimalist', 'Sahelian'],
    notableWorks: ['The Sahara Suite', 'Zaria Lamp Series']
  },
  {
    id: 'd2',
    name: 'Koffi Mensah',
    bio: 'A master of sculptural hardwoods, Koffi specializes in reclaimed Iroko and Sapele. His designs bridge the gap between functional furniture and fine art.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
    styles: ['Sculptural', 'Brutalist'],
    notableWorks: ['The Monolith Table', 'Accra Lounge Chair']
  },
  {
    id: 'd3',
    name: 'Zuri Okocha',
    bio: 'Zuri is a pioneer in textile integration. By fusing hand-woven Aso-Oke with geometric metal frames, she creates pieces that are tactile, vibrant, and culturally rich.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop',
    styles: ['Textile-Forward', 'Industrial'],
    notableWorks: ['Indigo Bench', 'Loom Armchair']
  }
];
