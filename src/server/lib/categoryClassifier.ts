/**
 * Category Classifier
 * 
 * Automatically classifies expenses based on description keywords
 * using Splitwise's standard category IDs.
 */

// Splitwise standard categories with their IDs
// These IDs are consistent across Splitwise API
const SPLITWISE_CATEGORIES = {
  // Main categories
  GENERAL: 18,
  ENTERTAINMENT: 2,
  FOOD_AND_DRINK: 1,
  HOME: 3,
  LIFE: 4,
  TRANSPORTATION: 5,
  UTILITIES: 6,
  
  // Entertainment subcategories
  GAMES: 7,
  MOVIES: 8,
  MUSIC: 9,
  SPORTS: 10,
  
  // Food and drink subcategories
  DINING_OUT: 11,
  GROCERIES: 12,
  LIQUOR: 13,
  
  // Home subcategories
  ELECTRONICS: 14,
  FURNITURE: 15,
  HOUSEHOLD_SUPPLIES: 16,
  MAINTENANCE: 17,
  MORTGAGE: 19,
  PETS: 20,
  RENT: 21,
  SERVICES: 22,
  
  // Life subcategories
  CHILDCARE: 23,
  CLOTHING: 24,
  EDUCATION: 25,
  GIFTS: 26,
  INSURANCE: 27,
  MEDICAL_EXPENSES: 28,
  TAXES: 29,
  
  // Transportation subcategories
  BICYCLE: 30,
  BUS_TRAIN: 31,
  CAR: 32,
  GAS_FUEL: 33,
  HOTEL: 34,
  PARKING: 35,
  PLANE: 36,
  TAXI: 37,
  
  // Utilities subcategories
  CLEANING: 38,
  ELECTRICITY: 39,
  HEAT_GAS: 40,
  TRASH: 41,
  TV_PHONE_INTERNET: 42,
  WATER: 43,
};

// Keyword mappings for classification
const KEYWORD_MAP: Record<number, string[]> = {
  // Transportation
  [SPLITWISE_CATEGORIES.TAXI]: ['taxi', 'uber', 'lyft', 'cab', 'ride'],
  [SPLITWISE_CATEGORIES.BUS_TRAIN]: ['bus', 'train', 'metro', 'subway', 'rail', 'transit'],
  [SPLITWISE_CATEGORIES.GAS_FUEL]: ['gas', 'fuel', 'petrol', 'gasoline'],
  [SPLITWISE_CATEGORIES.PARKING]: ['parking', 'park'],
  [SPLITWISE_CATEGORIES.PLANE]: ['flight', 'plane', 'airline', 'airport'],
  [SPLITWISE_CATEGORIES.CAR]: ['car rental', 'rent car', 'vehicle'],
  [SPLITWISE_CATEGORIES.BICYCLE]: ['bike', 'bicycle', 'cycling'],
  
  // Food and drink
  [SPLITWISE_CATEGORIES.GROCERIES]: ['grocery', 'groceries', 'supermarket', 'food shopping', 'market'],
  [SPLITWISE_CATEGORIES.DINING_OUT]: ['restaurant', 'dinner', 'lunch', 'breakfast', 'cafe', 'coffee', 'meal', 'eating out'],
  [SPLITWISE_CATEGORIES.LIQUOR]: ['alcohol', 'beer', 'wine', 'liquor', 'bar', 'drinks', 'cocktail'],
  
  // Entertainment
  [SPLITWISE_CATEGORIES.MOVIES]: ['movie', 'cinema', 'film', 'theater'],
  [SPLITWISE_CATEGORIES.MUSIC]: ['concert', 'music', 'show', 'festival'],
  [SPLITWISE_CATEGORIES.GAMES]: ['game', 'gaming', 'video game'],
  [SPLITWISE_CATEGORIES.SPORTS]: ['sport', 'gym', 'fitness', 'workout'],
  
  // Home
  [SPLITWISE_CATEGORIES.RENT]: ['rent'],
  [SPLITWISE_CATEGORIES.MORTGAGE]: ['mortgage'],
  [SPLITWISE_CATEGORIES.FURNITURE]: ['furniture', 'couch', 'table', 'chair', 'desk'],
  [SPLITWISE_CATEGORIES.ELECTRONICS]: ['electronics', 'tv', 'computer', 'phone', 'tablet'],
  [SPLITWISE_CATEGORIES.HOUSEHOLD_SUPPLIES]: ['supplies', 'cleaning supplies', 'household'],
  [SPLITWISE_CATEGORIES.MAINTENANCE]: ['repair', 'fix', 'maintenance'],
  [SPLITWISE_CATEGORIES.PETS]: ['pet', 'dog', 'cat', 'vet'],
  
  // Utilities
  [SPLITWISE_CATEGORIES.ELECTRICITY]: ['electricity', 'electric', 'power'],
  [SPLITWISE_CATEGORIES.WATER]: ['water'],
  [SPLITWISE_CATEGORIES.HEAT_GAS]: ['heating', 'gas bill'],
  [SPLITWISE_CATEGORIES.TV_PHONE_INTERNET]: ['internet', 'wifi', 'phone bill', 'mobile', 'cable'],
  [SPLITWISE_CATEGORIES.TRASH]: ['trash', 'garbage', 'waste'],
  [SPLITWISE_CATEGORIES.CLEANING]: ['cleaning', 'maid', 'housekeeping'],
  
  // Life
  [SPLITWISE_CATEGORIES.MEDICAL_EXPENSES]: ['doctor', 'medical', 'hospital', 'medicine', 'pharmacy', 'health'],
  [SPLITWISE_CATEGORIES.GIFTS]: ['gift', 'present', 'birthday'],
  [SPLITWISE_CATEGORIES.CLOTHING]: ['clothes', 'clothing', 'shoes', 'shirt', 'pants'],
  [SPLITWISE_CATEGORIES.INSURANCE]: ['insurance'],
  [SPLITWISE_CATEGORIES.EDUCATION]: ['school', 'education', 'course', 'tuition', 'books'],
  [SPLITWISE_CATEGORIES.CHILDCARE]: ['childcare', 'daycare', 'babysitter'],
  [SPLITWISE_CATEGORIES.TAXES]: ['tax', 'taxes'],
  
  // Hotel
  [SPLITWISE_CATEGORIES.HOTEL]: ['hotel', 'accommodation', 'lodging', 'airbnb'],
};

/**
 * Classify an expense description into a Splitwise category
 */
export function classifyExpense(description: string): number {
  const lowerDesc = description.toLowerCase();
  
  console.log(`[Category Classifier] Input: "${description}" -> lowercase: "${lowerDesc}"`);
  
  // Check each category's keywords
  for (const [categoryId, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) {
        console.log(`[Category Classifier] MATCH: keyword "${keyword}" found -> category ${categoryId}`);
        return parseInt(categoryId);
      }
    }
  }
  
  // Default to General if no match
  console.log(`[Category Classifier] NO MATCH: defaulting to GENERAL (${SPLITWISE_CATEGORIES.GENERAL})`);
  return SPLITWISE_CATEGORIES.GENERAL;
}

/**
 * Get category name for logging/debugging
 */
export function getCategoryName(categoryId: number): string {
  const entry = Object.entries(SPLITWISE_CATEGORIES).find(([_, id]) => id === categoryId);
  return entry ? entry[0].replace(/_/g, ' ').toLowerCase() : 'general';
}
