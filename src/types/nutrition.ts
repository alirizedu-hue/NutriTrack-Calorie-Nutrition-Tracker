export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export type FoodCategory =
  | 'Fruits'
  | 'Vegetables'
  | 'Proteins'
  | 'Dairy'
  | 'Grains'
  | 'Snacks'
  | 'Beverages'
  | 'Prepared';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  fiber: number;   // in grams
  isCustom?: boolean;
  brand?: string;
}

export interface FoodLogEntry {
  id: string;
  foodId: string;
  foodName: string;
  category: FoodCategory;
  mealType: MealCategory;
  servings: number;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  loggedAt: string; // e.g. "08:30 AM"
  date: string;     // YYYY-MM-DD
  imageUrl?: string;
  scannedMealId?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  entries: FoodLogEntry[];
  waterGlasses: number; // 1 glass = 250ml
  notes?: string;
}

export type DietaryPreference =
  | 'Balanced'
  | 'High Protein'
  | 'Mediterranean'
  | 'Vegetarian'
  | 'Plant-Based'
  | 'Low Carb'
  | 'Keto'
  | 'Vegan';

export interface UserProfile {
  name: string;
  title: string;
  email: string;
  avatarUrl: string;
  dailyCalorieTarget: number;
  dailyWaterTargetGlasses: number; // e.g. 8 glasses = 2000 ml
  dailyProteinTarget: number;      // grams
  dailyCarbsTarget: number;        // grams
  dailyFatTarget: number;          // grams
  dailyFiberTarget: number;        // grams
  dietaryPreference: DietaryPreference;
  dietaryRestrictions: string[];  // e.g. ['Gluten-Free', 'Nut-Free']
  preferredMeals: MealCategory[];  // e.g. ['breakfast', 'lunch', 'dinner', 'snacks']
  measurementSystem: 'metric' | 'imperial';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
}

export interface AIScanItem {
  id: string;
  name: string;
  category: FoodCategory;
  servingSize: number;
  servingUnit: string;
  estimated_weight_grams?: number;
  calories: number;
  protein: number;
  carbs: number;
  carbohydrates?: number;
  fat: number;
  fiber: number;
  confidence?: 'high' | 'medium' | 'low' | number | string;
  confidenceReason?: string;
  groundedInDb?: boolean;
}

export interface StructuredFoodResponse {
  name: string;
  estimated_weight_grams: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface AIScanResult {
  isFood: boolean;
  clarificationMessage?: string;
  mealOverview: string;
  suggestedMealType: MealCategory;
  confidenceLevel?: string;
  nutritionalNotes?: string;
  foods: StructuredFoodResponse[];
  total_calories: number;
  total_protein: number;
  total_carbohydrates: number;
  total_fat: number;
  total_fiber: number;
  items: AIScanItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  imagePreviewUrl?: string;
}

export interface ScannedMeal {
  id: string;
  name: string;
  timestamp: string;      // e.g. "12:45 PM"
  date: string;           // YYYY-MM-DD
  imageUrl: string;
  mealType: MealCategory;
  items: AIScanItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  confidenceLevel?: string;
  nutritionalNotes?: string;
  addedToDiary?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedFollowUps?: string[];
}

export type ActiveTab =
  | 'dashboard'
  | 'scanner'
  | 'assistant'
  | 'meal-history'
  | 'diary'
  | 'nutrition'
  | 'history'
  | 'database'
  | 'profile'
  | 'showcase';

