# Dashboard Tabs Redesign Plan - Mobile/Tablet Only

## Services Available (14 total)

| Service | Slug | Category |
|---------|------|----------|
| SMAJ Store | store | Shopping |
| SMAJ Stream | stream | Entertainment |
| SMAJ Sports | sports | Entertainment |
| SMAJ Food | food | Food & Dining |
| SMAJ Jobs | jobs | Work |
| SMAJ Education | education | Learning |
| SMAJ Health | health | Health |
| SMAJ Transport | transport | Transport |
| SMAJ Agro | agro | Agriculture |
| SMAJ Energy | energy | Utilities |
| SMAJ Charity | charity | Community |
| SMAJ Housing | housing | Property |
| SMAJ Events | events | Entertainment |
| SMAJ Swap | swap | Crypto/Finance |
| SMAJ Token | token | Crypto/Rewards |

## Scope
- **DO NOT change the "For you" tab** — keep it exactly as-is.
- Only redesign **Trending**, **Lifestyle**, and **Categories** tabs.
- **Mobile/tablet only** — do NOT change desktop layout (`DesktopFeedHome` remains untouched).

## Current Problem

All 3 non-"for-you" tabs (Trending, Lifestyle, Categories) currently show the **exact same content** on mobile — just a single `ServiceList` with different service arrays. The sections above the tab conditional (ContinueSection, RecentlyAddedSection, FeaturedSellersSection, etc.) render identically on every tab, making the tabs feel pointless.

## Why This Happens

1. **Shared sections are outside the tab conditional** — They render regardless of which tab is active.
2. **"For you" is overloaded** — It shows the full dashboard, while other tabs get almost nothing.
3. **No tab-specific identity** — "Trending", "Lifestyle", and "Categories" don't have their own dedicated content blocks; they just get one small `ServiceList`.

## "For you" Tab — KEEP AS-IS
No changes to the "For you" tab. It should remain:
- Continue where you left off
- Recommended for you
- Suggested services
- Discover what's new
- Watch anytime (streams)
- Live sports
- Events
- Live Activity
- Trust indicators

## Proposed Redesign for Remaining 3 Tabs (MOBILE ONLY)

### Tab 2: Trending
**Concept:** "What's hot right now" — dynamic, time-sensitive, high-engagement content

**Content (replace current single ServiceList on mobile):**
1. **Trending services grid** — Services with live, dynamic content:
   - Store (deals, new products)
   - Stream (trending movies/series)
   - Sports (live matches, scores)
   - Events (happening now, this weekend)
   - Food (popular restaurants, offers)
   - Jobs (new postings)

2. **Popular searches chips** — Quick links to what people are searching for

3. **Trending stream rows** — "Trending now", "Popular series", "New releases" from stream catalog

4. **Live sports scores/matches** — If sports data available

5. **Recently added products** — Newest marketplace listings (high engagement = trending)

6. **Top events** — Events happening now with "Live now", "Starts today" badges

**Visual style:** Red/orange accent color, urgency indicators, "Live" and "Hot" badges

---

### Tab 3: Lifestyle
**Concept:** "Your daily life" — personal, recurring, everyday needs

**Content (replace current single ServiceList on mobile):**
1. **Lifestyle services grid** — Services for daily life:
   - Food (eat, delivery)
   - Health (doctors, pharmacy)
   - Transport (ride, move)
   - Education (learn, skills)
   - Housing (rent, buy)
   - Charity (give, help)
   - Events (tickets, fun)
   - Agro (farm, trade)

2. **Continue with lifestyle** — Filtered recent items related to lifestyle services

3. **Featured lifestyle providers/sellers** — Trusted sellers in lifestyle categories

4. **Health & education spotlight** — Highlighted doctors, courses, training

5. **Local deals** — Food offers, transport deals, education discounts

**Visual style:** Green/teal accent color, calm and practical feel

---

### Tab 4: Categories
**Concept:** "Browse everything" — organized, comprehensive, discoverable

**Content (replace current single ServiceList on mobile):**
1. **All services organized grid** — All 14 services in categorized groups:

   **Group 1: Entertainment & Shopping**
   - Store (Shopping • Deals)
   - Stream (Watch • Videos)
   - Sports (Play • Scores)
   - Events (Tickets • Fun)

   **Group 2: Food & Daily Needs**
   - Food (Eat • Delivery)
   - Health (Care • Doctors)
   - Transport (Ride • Move)
   - Education (Learn • Skills)

   **Group 3: Home & Community**
   - Housing (Rent • Buy)
   - Agro (Farm • Trade)
   - Energy (Power • Bills)
   - Charity (Give • Help)

   **Group 4: Finance & Rewards**
   - Jobs (Work • Hire)
   - Swap (Trade • Exchange)
   - Token (Rewards • Utility)

2. **Service status badges** — LIVE, Coming Soon, IN PROGRESS for each service

3. **Service ratings** — Star ratings (already exist in serviceRatings object)

4. **Quick action links** — Direct links to popular services like Store, Stream, Sports

**Visual style:** Blue accent color, organized grid with category headers

---

## Implementation Approach (MOBILE ONLY)

### Mobile (`MobileHome` component)

Keep the existing conditional structure but expand the non-"for-you" branches:

```tsx
{activeTab === "for-you" ? (
  // KEEP EXACTLY AS-IS
  <>...existing for-you content...</>
) : activeTab === "trending" ? (
  <TrendingMobileContent />
) : activeTab === "lifestyle" ? (
  <LifestyleMobileContent />
) : (
  <CategoriesMobileContent />
)}
```

Each content component renders ONLY the sections relevant to that tab.

### Desktop (`DesktopFeedHome` component)
**NO CHANGES** — leave exactly as-is.

### Keep Shared Sections but Move Them

Sections that should appear on ALL tabs (like "Pick up where you left off"):
- Keep them ABOVE the tab conditional so they're always visible
- Or duplicate them in each tab's content block if they need tab-specific filtering

Sections that should be tab-specific:
- Move them INSIDE each tab's content block

### Tab-Specific Data Helpers

Add new helper functions in `DashboardPage.tsx`:

```tsx
// Already exist:
const trendingSlugs = ["store", "stream", "sports", "events", "food", "jobs", "education", "health", "housing", "transport"];
const lifestyleSlugs = ["food", "health", "housing", "transport", "education", "charity", "events", "agro"];

// New:
const categoryGroups = [
  { title: "Entertainment & Shopping", slugs: ["store", "stream", "sports", "events"] },
  { title: "Food & Daily Needs", slugs: ["food", "health", "transport", "education"] },
  { title: "Home & Community", slugs: ["housing", "agro", "energy", "charity"] },
  { title: "Finance & Rewards", slugs: ["jobs", "swap", "token"] },
];
```

## Visual Differentiation

Each tab gets a distinct accent color via CSS:
- **For you**: Purple (existing)
- **Trending**: Red/Orange (`#ef4444` or `#f97316`)
- **Lifestyle**: Green/Teal (`#10b981` or `#14b8a6`)
- **Categories**: Blue (`#3b82f6`)

This applies to:
- Tab button active state
- Section heading accent color
- Badge colors (LIVE badges)

## Expected Outcome (MOBILE ONLY)

After the redesign:
- Clicking **For you** → Shows personal dashboard with recommendations, recent activity, streams, sports (UNCHANGED)
- Clicking **Trending** → Shows what's popular: trending services, hot products, live sports, popular searches
- Clicking **Lifestyle** → Shows daily life services: food, health, transport, education with relevant content
- Clicking **Categories** → Shows all 14 services in organized grid layout for browsing

Each tab feels purposeful and distinct. Users understand WHY they would switch to each tab.

## Files to Modify
1. `frontend/src/pages/private/DashboardPage.tsx` — Restructure mobile rendering logic only (lines ~283-366, `MobileHome` component and `DashboardPage` return)
2. `frontend/src/pages/private/DashboardPage.tsx` — Add new helper functions for tab-specific content
3. `frontend/src/pages/private/DashboardPage.tsx` — New mobile-only content components: `TrendingMobileContent`, `LifestyleMobileContent`, `CategoriesMobileContent`

## Files NOT to Modify
- `frontend/src/pages/private/DashboardPage.tsx` `DesktopFeedHome` component — leave untouched
- Any desktop CSS — leave untouched
