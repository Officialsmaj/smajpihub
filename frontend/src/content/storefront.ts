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

export type StoreSection = {
  title: string;
  subtitle?: string;
  category?: string;
  search?: string;
  products?: string[];
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
  { name: "Grocery", hint: "Food Staples", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85", search: "Grocery" },
  { name: "Electronics", hint: "Tech Picks", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85" },
  { name: "Mobiles", hint: "Smart Phones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85", search: "Phone" },
  { name: "Laptops & Desktops", hint: "Work Setup", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85", search: "Laptop" },
  { name: "Beauty", hint: "Glow Care", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85" },
  { name: "Gift Cards", hint: "Digital Value", image: "https://images.unsplash.com/photo-1607082350920-5f8d8d3e9b8a?auto=format&fit=crop&w=900&q=85", search: "Gift" },
  { name: "Women's Fashion", hint: "Style Edit", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85", search: "Dress" },
  { name: "Men's Fashion", hint: "Daily Wear", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85", search: "Men" },
  { name: "Home Appliances", hint: "Smart Living", image: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=900&q=85", search: "Appliance" },
  { name: "Health", hint: "Wellness", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=85" },
  { name: "Vehicles", hint: "Move Better", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85", search: "Vehicle" },
  { name: "Wearables", hint: "Smart Gear", image: "https://images.unsplash.com/photo-1579586337278-3f436f25d4d2?auto=format&fit=crop&w=900&q=85", search: "Watch" },
  { name: "Bags", hint: "Travel Ready", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85", search: "Bag" },
  { name: "Handbags", hint: "Luxury Carry", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85", search: "Handbag" },
  { name: "Televisions", hint: "Bigger Screens", image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=85", search: "TV" },
  { name: "Footwear", hint: "Every Step", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", search: "Shoes" },
  { name: "Camera", hint: "Capture Life", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85" },
  { name: "Gaming", hint: "Play More", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=85", search: "Gaming" },
  { name: "Men Care", hint: "Fresh Routine", image: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=900&q=85", search: "Men Care" },
  { name: "Personal Care", hint: "Daily Care", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85" },
  { name: "Makeup", hint: "Color Edit", image: "https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=900&q=85" },
  { name: "Watches", hint: "Time Style", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85" },
  { name: "Eyewear", hint: "Clear Vision", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85" },
  { name: "Sports & Fitness", hint: "Train Better", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85", search: "Sports" },
  { name: "Fragrances", hint: "Signature Scent", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85", search: "Perfume" },
  { name: "Baby", hint: "Tiny Essentials", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=85" },
  { name: "Toys & Games", hint: "Playtime", image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=85", search: "Toys" },
  { name: "Stationery", hint: "Work Tools", image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=85" },
  { name: "Furniture", hint: "Room Upgrade", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85" },
  { name: "Digital Cards", hint: "Instant Access", image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=85", search: "Digital" },
  { name: "Kitchen & Dining", hint: "Chef Setup", image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85", search: "Kitchen" },
  { name: "Large Appliances", hint: "Home Power", image: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=900&q=85", search: "Appliance" },
  { name: "Home Improvement", hint: "Fix Better", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=85", search: "Tools" },
  { name: "Mobile Accessories", hint: "Charge Up", image: "https://images.unsplash.com/photo-1585338447937-7082f8fc763d?auto=format&fit=crop&w=900&q=85", search: "Accessories" },
  { name: "Computer Accessories", hint: "Desk Gear", image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=900&q=85", search: "Computer" },
  { name: "Headphones", hint: "Pure Sound", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85" },
  { name: "Hair Care", hint: "Healthy Hair", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85", search: "Hair" },
  { name: "Home Decor", hint: "Design Touch", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=85", search: "Decor" },
  { name: "Kids Fashion", hint: "Little Looks", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85", search: "Kids" },
  { name: "Pet Store", hint: "Pet Care", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=85", search: "Pet" },
  { name: "Automotive", hint: "Road Ready", image: "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?auto=format&fit=crop&w=900&q=85", search: "Car" },
  { name: "Books", hint: "Read More", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85", search: "Book" },
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
  { title: "More Reasons To Shop", products: ["Deals", "Arrivals", "Rated", "Verified"] },
  { title: "Mega Deals", category: "Electronics" },
  { title: "In Focus", category: "Beauty" },
  { title: "Save up to 50% with Pi on Mobiles", category: "Phones", search: "Phone" },
  { title: "Maximize Your Savings", category: "Home" },
  { title: "Bestsellers For You", search: "Top" },
  { title: "Hot Pi Deals", search: "Deals" },
  { title: "Lowest Prices On Top Brands", category: "Computers" },
  { title: "Seasonal Picks", category: "Fashion" },
  { title: "Cooling Deals With Pi", search: "Appliance" },
  { title: "Fragrance Deals With Pi", search: "Perfume" },
  { title: "Vehicle Deals", category: "Vehicles", search: "Vehicle" },
  { title: "Bestsellers In Fashion", category: "Fashion" },
  { title: "Top Deals In Home", category: "Home" },
  { title: "Top Bulk Deals In Grocery", search: "Food" },
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
