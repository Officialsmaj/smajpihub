const fs = require("fs");
const filepath = "C:\\Users\\Tine\\Desktop\\smajpihub\\frontend\\src\\pages\\private\\DashboardPage.tsx";
let content = fs.readFileSync(filepath, "utf8");

// Fix TrendingMobileContent - remove unused props
content = content.replace(
  "const TrendingMobileContent = ({ products, productsLoading, productsError, sellers, recentItems, recommendedServices, streamRows, streamLoading, sportsCatalog, sportsLoading }: { products: Product[]; productsLoading: boolean; productsError: string; sellers: SellerCard[]; recentItems: RecentItem[]; recommendedServices: ServiceDefinition[]; streamRows: DashboardStreamRow[]; streamLoading: boolean; sportsCatalog: SportsCatalog; sportsLoading: boolean }) => (",
  "const TrendingMobileContent = ({ products, productsLoading, productsError, streamRows, streamLoading, sportsCatalog, sportsLoading }: { products: Product[]; productsLoading: boolean; productsError: string; streamRows: DashboardStreamRow[]; streamLoading: boolean; sportsCatalog: SportsCatalog; sportsLoading: boolean }) => ("
);

// Fix LifestyleMobileContent - remove unused props
content = content.replace(
  "const LifestyleMobileContent = ({ products, productsLoading, productsError, sellers, recentItems, recommendedServices, streamRows, streamLoading, sportsCatalog, sportsLoading }: { products: Product[]; productsLoading: boolean; productsError: string; sellers: SellerCard[]; recentItems: RecentItem[]; recommendedServices: ServiceDefinition[]; streamRows: DashboardStreamRow[]; streamLoading: boolean; sportsCatalog: SportsCatalog; sportsLoading: boolean }) => (",
  "const LifestyleMobileContent = ({ sellers, recentItems }: { sellers: SellerCard[]; recentItems: RecentItem[] }) => ("
);

// Fix CategoriesMobileContent - remove all unused props
content = content.replace(
  "const CategoriesMobileContent = ({ products, productsLoading, productsError, sellers, recentItems, recommendedServices, streamRows, streamLoading, sportsCatalog, sportsLoading }: { products: Product[]; productsLoading: boolean; productsError: string; sellers: SellerCard[]; recentItems: RecentItem[]; recommendedServices: ServiceDefinition[]; streamRows: DashboardStreamRow[]; streamLoading: boolean; sportsCatalog: SportsCatalog; sportsLoading: boolean }) => (",
  "const CategoriesMobileContent = () => ("
);

fs.writeFileSync(filepath, content, "utf8");
console.log("SUCCESS");
