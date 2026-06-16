export type StoreHeroSlide = {
  title: string;
  subtitle: string;
  image: string;
  search: string;
};

export type StoreCategoryTile = {
  name: string;
  hint: string;
  image: string;
  search?: string;
};

export type StoreCategoryGroup = {
  id: string;
  items: StoreCategoryTile[];
};

export type StoreSection = {
  title: string;
  subtitle?: string;
  category?: string;
  search?: string;
  products?: string[];
};

export type StoreOfferCard = {
  title: string;
  description: string;
  image: string;
  search: string;
};

export type StoreCategoryShowcase = {
  title: string;
  items: StoreCategoryTile[];
};

export const storeTopNav = [
  "Deals",
  "Grocery",
  "Electronics",
  "Mobiles",
  "Laptops",
  "Fashion",
  "Beauty",
  "Home",
  "Vehicles",
  "More",
] as const;

export const promoStripItems = [
  "Pay with Pi",
  "Verified Sellers",
  "Secure Shopping",
  "New Deals Daily",
  "Fresh Grocery Picks",
  "Electronics Week",
  "Fast Cart Checkout",
] as const;

export const heroSlides: StoreHeroSlide[] = [
  {
    title: "Big Pi Deals",
    subtitle: "Shop trusted products across the SMAJ ecosystem with Pi-powered checkout.",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=85",
    search: "Deals",
  },
  {
    title: "Electronics Week",
    subtitle: "Phones, gaming, headphones, and laptops from verified SMAJ sellers.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=85",
    search: "Electronics",
  },
  {
    title: "Fashion Deals",
    subtitle: "Discover premium looks, everyday essentials, and Pi-exclusive savings.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=85",
    search: "Fashion",
  },
  {
    title: "Home Essentials",
    subtitle: "Refresh your space with furniture, decor, kitchen picks, and appliances.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=85",
    search: "Home",
  },
];

export const categoryTiles: StoreCategoryTile[] = [
  { name: "Deals", hint: "Pi Savings", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=85", search: "Deals" },
  { name: "Grocery", hint: "Fresh Food", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85", search: "Grocery" },
  { name: "Electronics", hint: "Tech Picks", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85", search: "Electronics" },
  { name: "Mobiles", hint: "Smart Phones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85", search: "Phone" },
  { name: "Laptops & Desktops", hint: "Work Setup", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85", search: "Laptop" },
  { name: "Beauty", hint: "Glow Care", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85", search: "Beauty" },
  { name: "Gift Cards", hint: "Digital Value", image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=85", search: "Gift" },
  { name: "Women's Fashion", hint: "Style Edit", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85", search: "Dress" },
  { name: "Men's Fashion", hint: "Daily Wear", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85", search: "Men" },
  { name: "Home Appliances", hint: "Smart Living", image: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=900&q=85", search: "Appliance" },
  { name: "Health", hint: "Daily Wellness", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=85", search: "Health" },
  { name: "Vehicles", hint: "Cars Trucks", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85", search: "Vehicle" },
  { name: "Wearables", hint: "Smart Gear", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=85", search: "Watch" },
  { name: "Bags", hint: "Travel Ready", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85", search: "Bag" },
  { name: "Handbags", hint: "Luxury Carry", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85", search: "Handbag" },
  { name: "Televisions", hint: "Bigger Screens", image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=85", search: "TV" },
  { name: "Footwear", hint: "Every Step", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", search: "Shoes" },
  { name: "Camera", hint: "Capture Life", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85", search: "Camera" },
  { name: "Gaming", hint: "Play More", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=85", search: "Gaming" },
  { name: "Men Care", hint: "Fresh Routine", image: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=900&q=85", search: "Men Care" },
  { name: "Personal Care", hint: "Daily Care", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85", search: "Personal Care" },
  { name: "Makeup", hint: "Color Edit", image: "https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=900&q=85", search: "Makeup" },
  { name: "Watches", hint: "Time Style", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85", search: "Watch" },
  { name: "Eyewear", hint: "Clear Vision", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85", search: "Eyewear" },
  { name: "Sports & Fitness", hint: "Train Better", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85", search: "Sports" },
  { name: "Fragrances", hint: "Signature Scent", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85", search: "Perfume" },
  { name: "Baby", hint: "Tiny Essentials", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=85", search: "Baby" },
  { name: "Toys & Games", hint: "Playtime", image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=85", search: "Toys" },
  { name: "Stationery", hint: "Work Tools", image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=85", search: "Stationery" },
  { name: "Furniture", hint: "Room Upgrade", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85", search: "Furniture" },
  { name: "Digital Cards", hint: "Instant Value", image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=85", search: "Digital" },
  { name: "Skincare", hint: "Skin Glow", image: "https://images.unsplash.com/photo-1556228578-dd6f54fcf57d?auto=format&fit=crop&w=900&q=85", search: "Skincare" },
  { name: "Kitchen & Dining", hint: "Chef Setup", image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85", search: "Kitchen" },
  { name: "Large Appliances", hint: "Home Power", image: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=900&q=85", search: "Appliance" },
  { name: "Home Improvement", hint: "Fix Better", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=85", search: "Tools" },
  { name: "Mobile Accessories", hint: "Charge Up", image: "https://images.unsplash.com/photo-1585338447937-7082f8fc763d?auto=format&fit=crop&w=900&q=85", search: "Accessories" },
  { name: "Computer Accessories", hint: "Desk Gear", image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=900&q=85", search: "Computer" },
  { name: "Headphones", hint: "Pure Sound", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85", search: "Headphones" },
  { name: "Hair Care", hint: "Healthy Hair", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85", search: "Hair" },
  { name: "Home Decor", hint: "Design Touch", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=85", search: "Decor" },
  { name: "Kids Fashion", hint: "Little Looks", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85", search: "Kids" },
  { name: "Pet Store", hint: "Pet Care", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=85", search: "Pet" },
  { name: "Automotive", hint: "Road Ready", image: "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?auto=format&fit=crop&w=900&q=85", search: "Automotive" },
  { name: "Books", hint: "Read More", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85", search: "Books" },
  { name: "Music & Media", hint: "Audio Fun", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=85", search: "Music" },
  { name: "Baby Luxury", hint: "Premium Baby", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=85", search: "Baby" },
  { name: "Jewelry", hint: "Golden Style", image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85", search: "Jewelry" },
  { name: "New Arrivals", hint: "Fresh Picks", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=85", search: "New" },
  { name: "Bestsellers", hint: "Top Choice", image: "https://images.unsplash.com/photo-1607082352121-fa243f3dde32?auto=format&fit=crop&w=900&q=85", search: "Best" },
  { name: "Top Rated", hint: "Trusted Picks", image: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=900&q=85", search: "Top" },
  { name: "Sportswear", hint: "Active Style", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85", search: "Sportswear" },
  { name: "Bath & Bedding", hint: "Home Comfort", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85", search: "Bedding" },
  { name: "Snacks & Drinks", hint: "Quick Bites", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85", search: "Snacks" },
  { name: "Laundry", hint: "Clean Home", image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=900&q=85", search: "Laundry" },
];

export const categoryGroups: StoreCategoryGroup[] = [
  { id: "group-1", items: categoryTiles.slice(0, 12) },
  { id: "group-2", items: categoryTiles.slice(12, 23) },
  { id: "group-3", items: categoryTiles.slice(23, 33) },
  { id: "group-4", items: categoryTiles.slice(33, 44) },
  { id: "group-5", items: categoryTiles.slice(44, 54) },
];

export const vehicleTiles: StoreCategoryTile[] = [
  { name: "Cars", hint: "Road Deals", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85", search: "Car" },
  { name: "Motorcycles", hint: "Fast Commute", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=85", search: "Motorcycle" },
  { name: "Bicycles", hint: "Ride Light", image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=85", search: "Bicycle" },
  { name: "Buses", hint: "Fleet Value", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=85", search: "Bus" },
  { name: "Trucks", hint: "Heavy Move", image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=85", search: "Truck" },
  { name: "Ships & Boats", hint: "Water Travel", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=85", search: "Boat" },
  { name: "Airplanes", hint: "Sky Travel", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=85", search: "Airplane" },
  { name: "Helicopters", hint: "Rotor Flight", image: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=900&q=85", search: "Helicopter" },
];

export const sectionCategories: StoreCategoryTile[] = [
  { name: "Women's Fashion", hint: "Style Edit", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85", search: "Dress" },
  { name: "Men's Fashion", hint: "Modern Wear", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85", search: "Men" },
  { name: "Beauty", hint: "Glow Care", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85", search: "Beauty" },
  { name: "Home & Kitchen", hint: "Better Living", image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85", search: "Home" },
  { name: "Home Appliances", hint: "Smart Living", image: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=900&q=85", search: "Appliance" },
  { name: "Electronics", hint: "Tech Picks", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85", search: "Electronics" },
  { name: "Mobiles & Accessories", hint: "Pi Phones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85", search: "Phone" },
  { name: "Laptops & Accessories", hint: "Desk Setup", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85", search: "Laptop" },
  { name: "Kids Fashion", hint: "Little Looks", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85", search: "Kids" },
  { name: "Health & Nutrition", hint: "Daily Wellness", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=85", search: "Health" },
  { name: "Grocery", hint: "Home Staples", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85", search: "Food" },
  { name: "Furniture", hint: "Room Upgrade", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85", search: "Furniture" },
  { name: "Fragrances", hint: "Signature Scent", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85", search: "Perfume" },
  { name: "Baby", hint: "Tiny Essentials", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=85", search: "Baby" },
  { name: "Toys", hint: "Playtime", image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=85", search: "Toys" },
  { name: "Eyewear", hint: "Clear Vision", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85", search: "Eyewear" },
  { name: "Sports & Outdoor", hint: "Train Better", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85", search: "Sports" },
  { name: "Automotive", hint: "Road Ready", image: "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?auto=format&fit=crop&w=900&q=85", search: "Automotive" },
  { name: "Stationery", hint: "Work Tools", image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=85", search: "Stationery" },
];

export const homeSections: StoreSection[] = [
  { title: "Top Deals Today", search: "Deals" },
  { title: "Mobile Deals", category: "Mobiles", search: "Phone" },
  { title: "Electronics Deals", category: "Electronics", search: "Electronics" },
  { title: "Fashion Deals", category: "Fashion", search: "Fashion" },
  { title: "Best Sellers", search: "Best" },
  { title: "New Arrivals", search: "New" },
  { title: "Recommended For You", search: "Recommended" },
  { title: "Bestsellers For You", search: "Top" },
  { title: "Hot Pi Deals", search: "Deals" },
  { title: "Lowest Prices On Top Brands", search: "Top" },
  { title: "Vehicle Deals", category: "Vehicles", search: "Vehicle" },
  { title: "Bestsellers In Fashion", category: "Fashion" },
  { title: "Top Deals In Home", category: "Home" },
  { title: "Top Bulk Deals In Grocery", search: "Food" },
];

export const storeOfferCards: StoreOfferCard[] = [
  {
    title: "Free Accessories",
    description: "with selected phones",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85",
    search: "Phone accessories",
  },
  {
    title: "Buy 2 Get 10% Off",
    description: "Beauty products",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85",
    search: "Beauty",
  },
  {
    title: "Extra 20% Off",
    description: "Laptops & accessories",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
    search: "Laptop",
  },
  {
    title: "Special Pi Deals",
    description: "Limited time offers",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=85",
    search: "Deals",
  },
];

export const storeCategoryShowcases: StoreCategoryShowcase[] = [
  {
    title: "Women's Fashion",
    items: [
      { name: "Tops", hint: "Daily style", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85", search: "Tops" },
      { name: "Dresses", hint: "Event looks", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85", search: "Dress" },
      { name: "Sportswear", hint: "Active fit", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85", search: "Sportswear" },
      { name: "Pants", hint: "Smart comfort", image: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=900&q=85", search: "Pants" },
      { name: "Sandals", hint: "Easy step", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=85", search: "Sandals" },
      { name: "Footwear", hint: "Street wear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", search: "Shoes" },
      { name: "Handbags", hint: "Carry luxe", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85", search: "Handbag" },
      { name: "Jewelry", hint: "Shine more", image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85", search: "Jewelry" },
    ],
  },
  {
    title: "Men's Fashion",
    items: [
      { name: "T-Shirts", hint: "Daily wear", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", search: "T-Shirt" },
      { name: "Pants", hint: "Clean fit", image: "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=85", search: "Pants" },
      { name: "Luggage", hint: "Travel ready", image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&q=85", search: "Luggage" },
      { name: "Sportswear", hint: "Move easy", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85", search: "Sportswear" },
      { name: "Footwear", hint: "Street shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", search: "Footwear" },
      { name: "Accessories", hint: "Style extras", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=85", search: "Accessories" },
      { name: "Formal Wear", hint: "Sharp looks", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=900&q=85", search: "Formal" },
    ],
  },
  {
    title: "Beauty",
    items: [
      { name: "Makeup", hint: "Glow up", image: "https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=900&q=85", search: "Makeup" },
      { name: "Skincare", hint: "Clear skin", image: "https://images.unsplash.com/photo-1556228578-dd6f54fcf57d?auto=format&fit=crop&w=900&q=85", search: "Skincare" },
      { name: "Hair Tools", hint: "Style tools", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85", search: "Hair tools" },
      { name: "Hair Care", hint: "Healthy hair", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85", search: "Hair care" },
      { name: "Men Care", hint: "Fresh routine", image: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=900&q=85", search: "Men care" },
      { name: "Fragrance", hint: "Signature scent", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85", search: "Perfume" },
    ],
  },
  {
    title: "Home & Kitchen",
    items: [
      { name: "Cookware", hint: "Chef picks", image: "https://images.unsplash.com/photo-1584990347449-a5d8f7092f5d?auto=format&fit=crop&w=900&q=85", search: "Cookware" },
      { name: "Storage", hint: "Keep tidy", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85", search: "Storage" },
      { name: "Dinnerware", hint: "Table set", image: "https://images.unsplash.com/photo-1574180045827-681f8a1a9622?auto=format&fit=crop&w=900&q=85", search: "Dinnerware" },
      { name: "Bedding", hint: "Sleep well", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85", search: "Bedding" },
      { name: "Lighting", hint: "Bright rooms", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=85", search: "Lighting" },
      { name: "Tools", hint: "Fix better", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=85", search: "Tools" },
      { name: "Furniture", hint: "Room setup", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85", search: "Furniture" },
    ],
  },
  {
    title: "Home Appliances",
    items: [
      { name: "Air Conditioners", hint: "Cool home", image: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=900&q=85", search: "Air conditioner" },
      { name: "Air Fryers", hint: "Quick meals", image: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=900&q=85", search: "Air fryer" },
      { name: "Refrigerators", hint: "Fresh food", image: "https://images.unsplash.com/photo-1571172964276-91c1f6f5140d?auto=format&fit=crop&w=900&q=85", search: "Refrigerator" },
      { name: "Vacuum Cleaners", hint: "Clean faster", image: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=900&q=85", search: "Vacuum" },
      { name: "Coffee Makers", hint: "Brew easy", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85", search: "Coffee maker" },
      { name: "Washing Machines", hint: "Laundry day", image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=85", search: "Washing machine" },
      { name: "TVs", hint: "Screen time", image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=85", search: "TV" },
    ],
  },
  {
    title: "Electronics",
    items: [
      { name: "TV", hint: "Bigger screens", image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=85", search: "TV" },
      { name: "Gaming Consoles", hint: "Play more", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=85", search: "Gaming console" },
      { name: "Camera", hint: "Capture life", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85", search: "Camera" },
      { name: "Tablet", hint: "Touch power", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85", search: "Tablet" },
      { name: "Laptop", hint: "Work smart", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85", search: "Laptop" },
      { name: "Games", hint: "Fun library", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=85", search: "Games" },
      { name: "Phones", hint: "Smart picks", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85", search: "Phone" },
      { name: "Headphones", hint: "Pure sound", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85", search: "Headphones" },
      { name: "Smart Watches", hint: "Track time", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=85", search: "Smart watch" },
    ],
  },
  {
    title: "Mobiles & Accessories",
    items: [
      { name: "Mobiles", hint: "New phones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85", search: "Mobile" },
      { name: "Headphones", hint: "Daily sound", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85", search: "Headphones" },
      { name: "Wearables", hint: "Smart gear", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=85", search: "Wearables" },
      { name: "Accessories", hint: "Phone extras", image: "https://images.unsplash.com/photo-1585338447937-7082f8fc763d?auto=format&fit=crop&w=900&q=85", search: "Accessories" },
      { name: "Power Banks", hint: "Stay charged", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=85", search: "Power bank" },
      { name: "Tablets", hint: "Portable screens", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85", search: "Tablet" },
      { name: "Chargers", hint: "Fast charge", image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=85", search: "Charger" },
    ],
  },
  {
    title: "Laptops & Accessories",
    items: [
      { name: "Laptops", hint: "Daily work", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85", search: "Laptop" },
      { name: "Monitors", hint: "Clear view", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=85", search: "Monitor" },
      { name: "Printers", hint: "Print fast", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=85", search: "Printer" },
      { name: "MacBooks", hint: "Apple power", image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=85", search: "MacBook" },
      { name: "Storage", hint: "Save more", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=85", search: "Storage" },
      { name: "Gaming Laptops", hint: "Play hard", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=85", search: "Gaming laptop" },
    ],
  },
  {
    title: "Kids Fashion",
    items: [
      { name: "Clothes", hint: "Daily kids", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85", search: "Kids clothes" },
      { name: "Shoes", hint: "Little steps", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=85", search: "Kids shoes" },
      { name: "Sportswear", hint: "Active wear", image: "https://images.unsplash.com/photo-1519238363720-e37f570d6d59?auto=format&fit=crop&w=900&q=85", search: "Kids sportswear" },
      { name: "Backpacks", hint: "School ready", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", search: "Backpack" },
      { name: "Baby Clothing", hint: "Soft fits", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=85", search: "Baby clothing" },
    ],
  },
  {
    title: "Health & Nutrition",
    items: [
      { name: "Health Monitors", hint: "Track health", image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=85", search: "Health monitor" },
      { name: "Vitamins", hint: "Daily boost", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=85", search: "Vitamins" },
      { name: "Massage", hint: "Relax more", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=85", search: "Massage" },
      { name: "Mobility Aids", hint: "Move better", image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=85", search: "Mobility aid" },
      { name: "Wellness", hint: "Healthy life", image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85", search: "Wellness" },
    ],
  },
  {
    title: "Grocery",
    items: [
      { name: "Beverages", hint: "Drink picks", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85", search: "Beverages" },
      { name: "Laundry", hint: "Clean home", image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=900&q=85", search: "Laundry" },
      { name: "Pet Supplies", hint: "Pet care", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=85", search: "Pet supplies" },
      { name: "Rice", hint: "Daily staple", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=85", search: "Rice" },
      { name: "Snacks", hint: "Quick bites", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=900&q=85", search: "Snacks" },
      { name: "Coffee", hint: "Morning brew", image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=85", search: "Coffee" },
      { name: "Food", hint: "Home needs", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85", search: "Food" },
    ],
  },
  {
    title: "Furniture",
    items: [
      { name: "Chairs", hint: "Sit easy", image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=85", search: "Chair" },
      { name: "Sofas", hint: "Room comfort", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85", search: "Sofa" },
      { name: "Beds", hint: "Sleep better", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85", search: "Bed" },
      { name: "Tables", hint: "Home setup", image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=900&q=85", search: "Table" },
      { name: "Outdoor Furniture", hint: "Outside style", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85", search: "Outdoor furniture" },
    ],
  },
  {
    title: "Fragrances",
    items: [
      { name: "Men", hint: "Bold scent", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85", search: "Men perfume" },
      { name: "Women", hint: "Soft scent", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85", search: "Women perfume" },
      { name: "Premium", hint: "Luxury picks", image: "https://images.unsplash.com/photo-1615634262417-4cd41bb0c0d8?auto=format&fit=crop&w=900&q=85", search: "Premium perfume" },
      { name: "Oud", hint: "Deep notes", image: "https://images.unsplash.com/photo-1619994403073-2cec6ae7ff3f?auto=format&fit=crop&w=900&q=85", search: "Oud" },
      { name: "Gift Sets", hint: "Perfect gift", image: "https://images.unsplash.com/photo-1615634897670-dff8469da8d8?auto=format&fit=crop&w=900&q=85", search: "Gift set" },
    ],
  },
  {
    title: "Baby",
    items: [
      { name: "Strollers", hint: "Baby trips", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=85", search: "Stroller" },
      { name: "Diapers", hint: "Daily care", image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=85", search: "Diaper" },
      { name: "Feeding", hint: "Meal time", image: "https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=900&q=85", search: "Baby feeding" },
      { name: "Nursery", hint: "Baby room", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=85", search: "Nursery" },
      { name: "Car Seats", hint: "Safe rides", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=85", search: "Car seat" },
      { name: "Toys", hint: "Little fun", image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=85", search: "Baby toys" },
    ],
  },
  {
    title: "Toys",
    items: [
      { name: "Building Toys", hint: "Create fun", image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=85", search: "Building toys" },
      { name: "Learning", hint: "Smart play", image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=85", search: "Learning toys" },
      { name: "Outdoor", hint: "Play outside", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=85", search: "Outdoor toys" },
      { name: "Board Games", hint: "Family fun", image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=900&q=85", search: "Board games" },
      { name: "Remote Control", hint: "Fast fun", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=85", search: "Remote control toys" },
    ],
  },
  {
    title: "Eyewear",
    items: [
      { name: "Sunglasses", hint: "Sunny looks", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85", search: "Sunglasses" },
      { name: "Frames", hint: "Daily wear", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=85", search: "Frames" },
      { name: "Contact Lenses", hint: "Clear vision", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=85", search: "Contact lenses" },
    ],
  },
  {
    title: "Sports & Outdoor",
    items: [
      { name: "Water Sports", hint: "Swim gear", image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=900&q=85", search: "Water sports" },
      { name: "Cycling", hint: "Ride more", image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=85", search: "Cycling" },
      { name: "Fitness", hint: "Train hard", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85", search: "Fitness" },
      { name: "Football", hint: "Game day", image: "https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=900&q=85", search: "Football" },
      { name: "Basketball", hint: "Court time", image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=900&q=85", search: "Basketball" },
      { name: "Camping", hint: "Outdoor trips", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85", search: "Camping" },
    ],
  },
  {
    title: "Automotive",
    items: [
      { name: "Accessories", hint: "Car extras", image: "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?auto=format&fit=crop&w=900&q=85", search: "Car accessories" },
      { name: "Parts", hint: "Fit better", image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=85", search: "Car parts" },
      { name: "Car Care", hint: "Clean shine", image: "https://images.unsplash.com/photo-1607861716497-e65ab29fc7ac?auto=format&fit=crop&w=900&q=85", search: "Car care" },
      { name: "Electronics", hint: "Drive smart", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85", search: "Car electronics" },
      { name: "Tools", hint: "Garage kit", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=85", search: "Automotive tools" },
      { name: "Batteries", hint: "Power drive", image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=85", search: "Car battery" },
    ],
  },
  {
    title: "Stationery",
    items: [
      { name: "Calculators", hint: "Office math", image: "https://images.unsplash.com/photo-1564149504298-00d67567104b?auto=format&fit=crop&w=900&q=85", search: "Calculator" },
      { name: "Writing Supplies", hint: "Write more", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85", search: "Pens" },
      { name: "Notebooks", hint: "Daily notes", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=85", search: "Notebook" },
      { name: "Desk Accessories", hint: "Tidy desk", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85", search: "Desk accessories" },
      { name: "School Supplies", hint: "Study ready", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85", search: "School supplies" },
    ],
  },
];

export const popularSearches = [
  "iPhone",
  "Samsung Galaxy",
  "MacBook",
  "Gaming Laptop",
  "Perfume",
  "Fashion",
  "Furniture",
  "Car Accessories",
  "Cars",
  "Bicycles",
  "Ships",
  "Airplanes",
  "Helicopters",
] as const;

export const infoItems = [
  {
    title: "Global Shopping With SMAJ Store",
    body: "Discover products and brands worldwide through one SMAJ PI HUB account, with categories tailored for everyday needs.",
  },
  {
    title: "Discover products and brands worldwide",
    body: "Browse real listings from verified SMAJ sellers across electronics, fashion, grocery, home, vehicles, and more.",
  },
  {
    title: "Simple Shopping Powered By Pi",
    body: "Checkout, Pi payment approval, payment confirmation, order tracking, and seller updates happen inside SMAJ PI HUB.",
  },
] as const;

export const footerColumns = [
  { title: "SMAJ Store", links: ["Electronics", "Mobiles", "Laptops", "Gaming", "Accessories"] },
  { title: "Fashion", links: ["Men's Fashion", "Women's Fashion", "Kids Fashion", "Watches", "Footwear"] },
  { title: "Home & Lifestyle", links: ["Home & Kitchen", "Furniture", "Appliances", "Beauty", "Sports"] },
  { title: "Vehicles", links: ["Cars", "Motorcycles", "Bicycles", "Buses", "Ships & Boats", "Airplanes", "Helicopters"] },
  { title: "SMAJ Ecosystem", links: ["SMAJ Store", "SMAJ Food", "SMAJ Jobs", "SMAJ Health", "SMAJ Education", "SMAJ Transport", "SMAJ Housing", "SMAJ Stream", "SMAJ Sports"] },
  { title: "Sell With SMAJ", links: ["Seller Center", "Become Seller", "Business Account", "Verification"] },
  { title: "Support", links: ["Help Center", "Contact", "Privacy", "Terms"] },
] as const;
