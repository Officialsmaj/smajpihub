const fs = require("fs");
const filepath = "C:\\Users\\Tine\\Desktop\\smajpihub\\frontend\\src\\pages\\private\\DashboardPage.tsx";
let content = fs.readFileSync(filepath, "utf8");

// Update TrendingMobileContent call
content = content.replace(
  "<TrendingMobileContent products={products} productsLoading={productsLoading} productsError={productsError} sellers={sellers} recentItems={recentItems} recommendedServices={recommendedServices} streamRows={streamRows} streamLoading={streamLoading} sportsCatalog={sportsCatalog} sportsLoading={sportsLoading} />",
  "<TrendingMobileContent products={products} productsLoading={productsLoading} productsError={productsError} streamRows={streamRows} streamLoading={streamLoading} sportsCatalog={sportsCatalog} sportsLoading={sportsLoading} />"
);

// Update LifestyleMobileContent call
content = content.replace(
  "<LifestyleMobileContent products={products} productsLoading={productsLoading} productsError={productsError} sellers={sellers} recentItems={recentItems} recommendedServices={recommendedServices} streamRows={streamRows} streamLoading={streamLoading} sportsCatalog={sportsCatalog} sportsLoading={sportsLoading} />",
  "<LifestyleMobileContent sellers={sellers} recentItems={recentItems} />"
);

// Update CategoriesMobileContent call
content = content.replace(
  "<CategoriesMobileContent products={products} productsLoading={productsLoading} productsError={productsError} sellers={sellers} recentItems={recentItems} recommendedServices={recommendedServices} streamRows={streamRows} streamLoading={streamLoading} sportsCatalog={sportsCatalog} sportsLoading={sportsLoading} />",
  "<CategoriesMobileContent />"
);

fs.writeFileSync(filepath, content, "utf8");
console.log("SUCCESS");
