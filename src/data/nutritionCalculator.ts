/**
 * NutriTrack Verified Nutritional Database & Calculation Engine
 * 
 * Provides verified USDA-standard nutritional values per 100 grams
 * and strictly calculates portion calories and macros using:
 * Estimated Nutritional Value = (Nutritional Value per 100g * Estimated Food Weight) / 100
 */

export interface FoodNutrientDensity {
  name: string;
  keywords: string[];
  category: 'Proteins' | 'Grains' | 'Vegetables' | 'Fruits' | 'Dairy' | 'Snacks' | 'Prepared' | 'Beverages';
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
}

export const VERIFIED_FOOD_DATABASE: FoodNutrientDensity[] = [
  // Grains & Carbs
  {
    name: 'Cooked white rice',
    keywords: ['white rice', 'cooked rice', 'jasmine rice', 'basmati rice', 'steamed rice', 'plain rice', 'rice'],
    category: 'Grains',
    caloriesPer100g: 130,
    proteinPer100g: 2.7,
    carbsPer100g: 28.2,
    fatPer100g: 0.3,
    fiberPer100g: 0.4,
  },
  {
    name: 'Cooked brown rice',
    keywords: ['brown rice', 'whole grain rice'],
    category: 'Grains',
    caloriesPer100g: 123,
    proteinPer100g: 2.7,
    carbsPer100g: 25.6,
    fatPer100g: 1.0,
    fiberPer100g: 1.6,
  },
  {
    name: 'Egg fried rice',
    keywords: ['fried rice', 'egg fried rice', 'vegetable fried rice'],
    category: 'Prepared',
    caloriesPer100g: 168,
    proteinPer100g: 4.5,
    carbsPer100g: 24.0,
    fatPer100g: 6.0,
    fiberPer100g: 1.2,
  },
  {
    name: 'Chicken biryani',
    keywords: ['biryani', 'chicken biryani', 'murgh biryani', 'rice with chicken'],
    category: 'Prepared',
    caloriesPer100g: 185,
    proteinPer100g: 9.5,
    carbsPer100g: 22.0,
    fatPer100g: 6.5,
    fiberPer100g: 1.5,
  },
  {
    name: 'Mutton / Lamb biryani',
    keywords: ['mutton biryani', 'lamb biryani', 'beef biryani'],
    category: 'Prepared',
    caloriesPer100g: 215,
    proteinPer100g: 10.5,
    carbsPer100g: 21.0,
    fatPer100g: 9.8,
    fiberPer100g: 1.4,
  },
  {
    name: 'Cooked pasta',
    keywords: ['pasta', 'penne', 'spaghetti', 'macaroni', 'noodles', 'cooked pasta'],
    category: 'Grains',
    caloriesPer100g: 131,
    proteinPer100g: 5.0,
    carbsPer100g: 25.0,
    fatPer100g: 1.1,
    fiberPer100g: 1.8,
  },
  {
    name: 'Cooked quinoa',
    keywords: ['quinoa', 'cooked quinoa'],
    category: 'Grains',
    caloriesPer100g: 120,
    proteinPer100g: 4.4,
    carbsPer100g: 21.3,
    fatPer100g: 1.9,
    fiberPer100g: 2.8,
  },
  {
    name: 'Cooked rolled oats / Oatmeal',
    keywords: ['oatmeal', 'porridge', 'oats', 'cooked oats'],
    category: 'Grains',
    caloriesPer100g: 71,
    proteinPer100g: 2.5,
    carbsPer100g: 12.0,
    fatPer100g: 1.5,
    fiberPer100g: 1.7,
  },
  {
    name: 'White bread',
    keywords: ['white bread', 'bread slice', 'toast', 'toasted bread', 'sliced bread'],
    category: 'Grains',
    caloriesPer100g: 265,
    proteinPer100g: 9.0,
    carbsPer100g: 49.0,
    fatPer100g: 3.2,
    fiberPer100g: 2.7,
  },
  {
    name: 'Whole wheat bread',
    keywords: ['whole wheat bread', 'brown bread', 'multigrain bread', 'whole wheat'],
    category: 'Grains',
    caloriesPer100g: 247,
    proteinPer100g: 13.0,
    carbsPer100g: 41.0,
    fatPer100g: 3.4,
    fiberPer100g: 7.0,
  },
  {
    name: 'Naan / Flatbread / Roti',
    keywords: ['naan', 'roti', 'chapati', 'flatbread', 'pita'],
    category: 'Grains',
    caloriesPer100g: 280,
    proteinPer100g: 9.0,
    carbsPer100g: 52.0,
    fatPer100g: 4.5,
    fiberPer100g: 3.0,
  },

  // Proteins
  {
    name: 'Grilled chicken breast',
    keywords: ['grilled chicken', 'chicken breast', 'roast chicken breast', 'lean chicken', 'chicken fillet'],
    category: 'Proteins',
    caloriesPer100g: 165,
    proteinPer100g: 31.0,
    carbsPer100g: 0.0,
    fatPer100g: 3.6,
    fiberPer100g: 0.0,
  },
  {
    name: 'Chicken thigh (cooked)',
    keywords: ['chicken thigh', 'chicken leg', 'chicken drumstick', 'dark meat chicken'],
    category: 'Proteins',
    caloriesPer100g: 209,
    proteinPer100g: 24.0,
    carbsPer100g: 0.0,
    fatPer100g: 12.0,
    fiberPer100g: 0.0,
  },
  {
    name: 'Fried chicken',
    keywords: ['fried chicken', 'crispy chicken', 'chicken tenders', 'chicken nuggets'],
    category: 'Proteins',
    caloriesPer100g: 260,
    proteinPer100g: 20.0,
    carbsPer100g: 9.0,
    fatPer100g: 16.0,
    fiberPer100g: 0.5,
  },
  {
    name: 'Cooked chicken (generic)',
    keywords: ['chicken', 'cooked chicken', 'shredded chicken'],
    category: 'Proteins',
    caloriesPer100g: 190,
    proteinPer100g: 27.0,
    carbsPer100g: 0.0,
    fatPer100g: 8.0,
    fiberPer100g: 0.0,
  },
  {
    name: 'Boiled egg',
    keywords: ['boiled egg', 'hard boiled egg', 'soft boiled egg', 'egg'],
    category: 'Proteins',
    caloriesPer100g: 155,
    proteinPer100g: 12.6,
    carbsPer100g: 1.1,
    fatPer100g: 10.6,
    fiberPer100g: 0.0,
  },
  {
    name: 'Fried egg',
    keywords: ['fried egg', 'sunny side up', 'fried eggs', 'fried egg with oil'],
    category: 'Proteins',
    caloriesPer100g: 196,
    proteinPer100g: 13.6,
    carbsPer100g: 0.8,
    fatPer100g: 15.0,
    fiberPer100g: 0.0,
  },
  {
    name: 'Scrambled eggs / Omelet',
    keywords: ['scrambled eggs', 'scrambled egg', 'omelet', 'omelette'],
    category: 'Proteins',
    caloriesPer100g: 150,
    proteinPer100g: 10.5,
    carbsPer100g: 1.5,
    fatPer100g: 11.2,
    fiberPer100g: 0.0,
  },
  {
    name: 'Cooked salmon',
    keywords: ['salmon', 'grilled salmon', 'baked salmon', 'atlantic salmon'],
    category: 'Proteins',
    caloriesPer100g: 206,
    proteinPer100g: 22.1,
    carbsPer100g: 0.0,
    fatPer100g: 12.3,
    fiberPer100g: 0.0,
  },
  {
    name: 'Canned tuna in water',
    keywords: ['tuna', 'canned tuna', 'tuna fish'],
    category: 'Proteins',
    caloriesPer100g: 116,
    proteinPer100g: 25.5,
    carbsPer100g: 0.0,
    fatPer100g: 0.8,
    fiberPer100g: 0.0,
  },
  {
    name: 'Cooked beef steak / Lean beef',
    keywords: ['beef', 'steak', 'beef steak', 'grilled steak', 'beef patty', 'ground beef'],
    category: 'Proteins',
    caloriesPer100g: 250,
    proteinPer100g: 26.0,
    carbsPer100g: 0.0,
    fatPer100g: 16.0,
    fiberPer100g: 0.0,
  },
  {
    name: 'Firm tofu (cooked)',
    keywords: ['tofu', 'firm tofu', 'fried tofu', 'soy'],
    category: 'Proteins',
    caloriesPer100g: 83,
    proteinPer100g: 10.0,
    carbsPer100g: 1.9,
    fatPer100g: 5.3,
    fiberPer100g: 0.9,
  },
  {
    name: 'Cooked brown lentils / Dal',
    keywords: ['lentils', 'dal', 'boiled lentils', 'daal', 'lentil soup'],
    category: 'Proteins',
    caloriesPer100g: 116,
    proteinPer100g: 9.0,
    carbsPer100g: 20.1,
    fatPer100g: 0.4,
    fiberPer100g: 7.9,
  },
  {
    name: 'Cooked chickpeas',
    keywords: ['chickpeas', 'garbanzo', 'chana', 'roasted chickpeas'],
    category: 'Proteins',
    caloriesPer100g: 164,
    proteinPer100g: 8.9,
    carbsPer100g: 27.4,
    fatPer100g: 2.6,
    fiberPer100g: 7.6,
  },

  // Prepared Meals & Fast Food
  {
    name: 'Cheeseburger / Burger',
    keywords: ['burger', 'cheeseburger', 'hamburger', 'beef burger'],
    category: 'Prepared',
    caloriesPer100g: 275,
    proteinPer100g: 14.5,
    carbsPer100g: 26.0,
    fatPer100g: 12.8,
    fiberPer100g: 1.5,
  },
  {
    name: 'French fries',
    keywords: ['french fries', 'fries', 'fried potatoes', 'potato fries'],
    category: 'Snacks',
    caloriesPer100g: 312,
    proteinPer100g: 3.4,
    carbsPer100g: 41.5,
    fatPer100g: 15.0,
    fiberPer100g: 3.8,
  },
  {
    name: 'Baked potato wedges',
    keywords: ['potato wedges', 'baked fries', 'roasted potatoes'],
    category: 'Snacks',
    caloriesPer100g: 140,
    proteinPer100g: 2.5,
    carbsPer100g: 25.0,
    fatPer100g: 3.5,
    fiberPer100g: 2.5,
  },
  {
    name: 'Cheese pizza slice',
    keywords: ['pizza', 'cheese pizza', 'pepperoni pizza', 'pizza slice'],
    category: 'Prepared',
    caloriesPer100g: 266,
    proteinPer100g: 11.0,
    carbsPer100g: 33.0,
    fatPer100g: 10.0,
    fiberPer100g: 2.3,
  },
  {
    name: 'Chicken wrap / Burrito',
    keywords: ['wrap', 'chicken wrap', 'burrito', 'shawarma'],
    category: 'Prepared',
    caloriesPer100g: 195,
    proteinPer100g: 12.0,
    carbsPer100g: 22.0,
    fatPer100g: 7.0,
    fiberPer100g: 2.5,
  },

  // Salads & Vegetables
  {
    name: 'Mixed vegetable salad',
    keywords: ['mixed salad', 'vegetable salad', 'garden salad', 'fresh salad', 'salad'],
    category: 'Vegetables',
    caloriesPer100g: 25,
    proteinPer100g: 1.3,
    carbsPer100g: 4.5,
    fatPer100g: 0.3,
    fiberPer100g: 1.8,
  },
  {
    name: 'Leafy green salad (spinach/lettuce)',
    keywords: ['leafy greens', 'lettuce', 'spinach', 'baby greens', 'arugula', 'kale'],
    category: 'Vegetables',
    caloriesPer100g: 18,
    proteinPer100g: 1.5,
    carbsPer100g: 3.0,
    fatPer100g: 0.2,
    fiberPer100g: 1.6,
  },
  {
    name: 'Cucumber & tomato salad',
    keywords: ['cucumber tomato', 'cucumber', 'tomatoes', 'cherry tomatoes'],
    category: 'Vegetables',
    caloriesPer100g: 20,
    proteinPer100g: 0.9,
    carbsPer100g: 4.0,
    fatPer100g: 0.2,
    fiberPer100g: 1.2,
  },
  {
    name: 'Steamed broccoli',
    keywords: ['broccoli', 'steamed broccoli', 'cooked broccoli'],
    category: 'Vegetables',
    caloriesPer100g: 35,
    proteinPer100g: 2.4,
    carbsPer100g: 7.2,
    fatPer100g: 0.4,
    fiberPer100g: 2.6,
  },
  {
    name: 'Baked sweet potato',
    keywords: ['sweet potato', 'baked sweet potato', 'roasted sweet potato'],
    category: 'Vegetables',
    caloriesPer100g: 90,
    proteinPer100g: 2.0,
    carbsPer100g: 20.7,
    fatPer100g: 0.1,
    fiberPer100g: 3.3,
  },
  {
    name: 'Boiled / Mashed potato',
    keywords: ['mashed potato', 'boiled potato', 'potato', 'potatoes'],
    category: 'Vegetables',
    caloriesPer100g: 87,
    proteinPer100g: 1.9,
    carbsPer100g: 20.0,
    fatPer100g: 0.1,
    fiberPer100g: 1.8,
  },
  {
    name: 'Avocado (fresh sliced)',
    keywords: ['avocado', 'hass avocado', 'guacamole'],
    category: 'Fruits',
    caloriesPer100g: 160,
    proteinPer100g: 2.0,
    carbsPer100g: 8.5,
    fatPer100g: 14.7,
    fiberPer100g: 6.7,
  },
  {
    name: 'Fresh banana',
    keywords: ['banana', 'sliced banana'],
    category: 'Fruits',
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 22.8,
    fatPer100g: 0.3,
    fiberPer100g: 2.6,
  },
  {
    name: 'Fresh apple',
    keywords: ['apple', 'apple slices'],
    category: 'Fruits',
    caloriesPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 13.8,
    fatPer100g: 0.2,
    fiberPer100g: 2.4,
  },

  // Condiments, Sauces & Oils
  {
    name: 'Salad dressing (vinaigrette/oil-based)',
    keywords: ['dressing', 'vinaigrette', 'italian dressing', 'salad dressing'],
    category: 'Prepared',
    caloriesPer100g: 450,
    proteinPer100g: 0.2,
    carbsPer100g: 6.0,
    fatPer100g: 48.0,
    fiberPer100g: 0.0,
  },
  {
    name: 'Mayonnaise',
    keywords: ['mayo', 'mayonnaise'],
    category: 'Snacks',
    caloriesPer100g: 680,
    proteinPer100g: 1.0,
    carbsPer100g: 0.6,
    fatPer100g: 75.0,
    fiberPer100g: 0.0,
  },
  {
    name: 'Olive oil / Cooking oil',
    keywords: ['olive oil', 'cooking oil', 'vegetable oil', 'oil'],
    category: 'Prepared',
    caloriesPer100g: 884,
    proteinPer100g: 0.0,
    carbsPer100g: 0.0,
    fatPer100g: 100.0,
    fiberPer100g: 0.0,
  },
  {
    name: 'Hummus',
    keywords: ['hummus', 'chickpea hummus'],
    category: 'Snacks',
    caloriesPer100g: 166,
    proteinPer100g: 7.9,
    carbsPer100g: 14.3,
    fatPer100g: 9.6,
    fiberPer100g: 6.0,
  },
  {
    name: 'Feta / Cheddar cheese',
    keywords: ['cheese', 'feta', 'cheddar', 'parmesan', 'mozzarella'],
    category: 'Dairy',
    caloriesPer100g: 350,
    proteinPer100g: 21.0,
    carbsPer100g: 2.0,
    fatPer100g: 29.0,
    fiberPer100g: 0.0,
  },
];

/**
 * Match a recognized food name against the verified USDA database.
 */
export function matchVerifiedFood(rawName: string): FoodNutrientDensity | null {
  if (!rawName) return null;
  const normalized = rawName.toLowerCase().trim();

  // 1. Exact match on keywords
  for (const item of VERIFIED_FOOD_DATABASE) {
    for (const kw of item.keywords) {
      if (normalized === kw) {
        return item;
      }
    }
  }

  // 2. Keyword substring matching (longest keyword first)
  let bestMatch: { item: FoodNutrientDensity; score: number } | null = null;
  for (const item of VERIFIED_FOOD_DATABASE) {
    for (const kw of item.keywords) {
      if (normalized.includes(kw)) {
        const score = kw.length;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { item, score };
        }
      }
    }
  }

  return bestMatch ? bestMatch.item : null;
}

/**
 * Calculate nutrients using the exact required formula:
 * Estimated Value = (Nutritional Value per 100g * Estimated Food Weight) / 100
 */
export function calculateFoodNutrition(
  foodName: string,
  estimatedWeightGrams: number,
  aiPer100gFallback?: {
    caloriesPer100g?: number;
    proteinPer100g?: number;
    carbsPer100g?: number;
    fatPer100g?: number;
    fiberPer100g?: number;
  }
) {
  const weight = Math.max(1, Number(estimatedWeightGrams) || 100);
  const matched = matchVerifiedFood(foodName);

  const cal100 = matched ? matched.caloriesPer100g : (Number(aiPer100gFallback?.caloriesPer100g) || 150);
  const prot100 = matched ? matched.proteinPer100g : (Number(aiPer100gFallback?.proteinPer100g) || 8);
  const carbs100 = matched ? matched.carbsPer100g : (Number(aiPer100gFallback?.carbsPer100g) || 18);
  const fat100 = matched ? matched.fatPer100g : (Number(aiPer100gFallback?.fatPer100g) || 5);
  const fiber100 = matched ? matched.fiberPer100g : (Number(aiPer100gFallback?.fiberPer100g) || 2);

  // Exact formula requested: (Nutrient per 100g * Weight) / 100
  const calories = Math.round((cal100 * weight) / 100);
  const protein = Math.round(((prot100 * weight) / 100) * 10) / 10;
  const carbohydrates = Math.round(((carbs100 * weight) / 100) * 10) / 10;
  const fat = Math.round(((fat100 * weight) / 100) * 10) / 10;
  const fiber = Math.round(((fiber100 * weight) / 100) * 10) / 10;

  return {
    displayName: matched ? matched.name : foodName,
    category: matched ? matched.category : 'Prepared',
    estimated_weight_grams: weight,
    calories,
    protein,
    carbohydrates,
    fat,
    fiber,
    groundedInDb: Boolean(matched),
    per100g: {
      calories: cal100,
      protein: prot100,
      carbohydrates: carbs100,
      fat: fat100,
      fiber: fiber100,
    },
  };
}
