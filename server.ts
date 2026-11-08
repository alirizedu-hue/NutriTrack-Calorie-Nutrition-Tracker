import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { calculateFoodNutrition } from './src/data/nutritionCalculator.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Increase payload limit to support high-resolution meal camera captures
app.use(express.json({ limit: '40mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Food Scanner endpoint using Gemini Vision + Verified Nutrition Database Grounding
app.post('/api/scan-meal', async (req, res) => {
  try {
    const { mimeType = 'image/jpeg', userHint } = req.body;
    const imageBase64 = req.body.imageBase64 || req.body.image;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Missing imageBase64 data.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets.',
      });
    }

    // Accurately detect MIME type from data URL if provided
    let detectedMime = mimeType || 'image/jpeg';
    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
    if (mimeMatch) {
      detectedMime = mimeMatch[1];
    }

    // Clean base64 string
    const cleanBase64 = imageBase64
      .replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '')
      .replace(/\s/g, '');

    if (!cleanBase64 || cleanBase64.length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image data received.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `
You are an expert clinical nutrition scientist, food recognition computer vision specialist, and portion estimation analyst for NutriTrack.

Examine this actual food photograph thoroughly and methodically:

1. FIRST: Check if the photograph contains visible food or beverages.
   - If the image does NOT contain food (e.g., a person, an object, a blank screen) or is too blurry/unfocused to identify any food, set "isFood" to false and explain clearly in "clarificationMessage".
   - If food is present, set "isFood" to true.

2. FOOD ITEM RECOGNITION (Multi-item separation):
   - Identify every distinct food item and component visible on the plate, bowl, or tray separately.
   - Separate distinct foods on the same plate (e.g. if a plate contains rice, grilled chicken, and salad, break them down as separate items: "Cooked rice", "Grilled chicken breast", "Mixed vegetable salad", plus any visible dressing, sauce, butter, or gravy).
   - Distinguish between visually similar foods using contextual culinary visual evidence (e.g., white rice vs fried rice vs biryani; grilled chicken breast vs fried chicken; french fries vs roasted potato wedges; boiled egg vs fried egg vs omelet; beef patty vs burger with bun).
   - Do NOT guess or hallucinate hidden ingredients that have no visual evidence. Only identify visible items, visible garnishes, and apparent cooking methods (e.g. fried with oil, grilled, steamed, boiled, raw).
   - Express confidence level for each item: "high", "medium", or "low". If an item is partially obscured or visually ambiguous (e.g. unsure if sauce is mayo or ranch, or meat type), assign "medium" or "low" confidence and explain briefly in "confidenceReason".

3. PORTION SIZE ESTIMATION (in grams):
   - Estimate the realistic physical serving weight in grams ("estimated_weight_grams") for EACH identified food item separately.
   - Base portion estimates on visual cues: the relative surface area of the plate (standard dinner plate is ~25-28 cm diameter), depth of the bowl, thickness of food pieces, scoop sizes, and visible food boundaries.
   - For example:
     * A standard mound of cooked rice is typically 120g - 200g (average 150g).
     * A cooked chicken breast fillet is typically 120g - 180g (average 150g).
     * A side of mixed green salad is typically 40g - 80g (average 60g).
     * A regular serving of french fries is typically 100g - 150g (average 120g).
     * A single large egg is ~50g (two eggs = ~100g).
     * A standard burger with bun and patty is ~180g - 250g.
     * A portion of chicken biryani on a plate is typically 250g - 350g.
     * Dressings / sauces in a ramekin or drizzled: 15g - 30g (1-2 tablespoons).
   - Do NOT assign arbitrary, identical numbers to different foods.

4. NUTRITIONAL DENSITY PER 100 GRAMS:
   - For each identified food item, provide standard USDA reference nutritional density PER 100 GRAMS:
     * "calories_per_100g"
     * "protein_per_100g"
     * "carbs_per_100g"
     * "fat_per_100g"
     * "fiber_per_100g"
   - Account for cooking method (e.g., deep-fried items have higher fat_per_100g than steamed or boiled items).

5. OVERALL SUMMARY:
   - Provide a clear, culinary "mealOverview" title (e.g. "Chicken Biryani with Raita", "Cheeseburger with French Fries", "Grilled Chicken Breast with Steamed Rice and Garden Salad").
   - Suggest the most appropriate meal category ("breakfast", "lunch", "dinner", or "snacks")${userHint ? ` with user note: "${userHint}"` : ''}.
   - Provide a brief 1-2 sentence supportive, balanced nutrition commentary.

Return the result strictly conforming to the requested JSON schema.
`.trim();

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-3.8-flash'];
    let lastError: any = null;
    let responseText: string | null = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[AI Food Scanner] Analyzing meal with model: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              inlineData: {
                mimeType: detectedMime,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isFood: {
                  type: Type.BOOLEAN,
                  description: 'True if food/beverage is clearly visible, false if not food or too ambiguous.',
                },
                clarificationMessage: {
                  type: Type.STRING,
                  description: 'Explanation if the photo is not food, unclear, or too blurry.',
                },
                mealOverview: {
                  type: Type.STRING,
                  description: 'Concise descriptive title of the plate or meal.',
                },
                suggestedMealType: {
                  type: Type.STRING,
                  description: 'Suggested category: "breakfast", "lunch", "dinner", or "snacks".',
                },
                confidenceLevel: {
                  type: Type.STRING,
                  description: 'Overall visual confidence: "high", "medium", or "low".',
                },
                nutritionalNotes: {
                  type: Type.STRING,
                  description: 'Supportive balanced nutrition commentary.',
                },
                detectedFoods: {
                  type: Type.ARRAY,
                  description: 'List of individual food components identified.',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: {
                        type: Type.STRING,
                        description: 'Specific food item name with cooking method (e.g. "Cooked white rice", "Grilled chicken breast", "French fries", "Mixed vegetable salad").',
                      },
                      estimated_weight_grams: {
                        type: Type.NUMBER,
                        description: 'Estimated portion weight in grams.',
                      },
                      confidence: {
                        type: Type.STRING,
                        description: '"high", "medium", or "low".',
                      },
                      confidenceReason: {
                        type: Type.STRING,
                        description: 'Short reason for confidence score (e.g. "Clear visual boundary and texture" or "Partially obscured by sauce").',
                      },
                      calories_per_100g: {
                        type: Type.NUMBER,
                        description: 'Reference calories per 100g for this prepared food.',
                      },
                      protein_per_100g: {
                        type: Type.NUMBER,
                        description: 'Reference protein in grams per 100g.',
                      },
                      carbs_per_100g: {
                        type: Type.NUMBER,
                        description: 'Reference carbohydrates in grams per 100g.',
                      },
                      fat_per_100g: {
                        type: Type.NUMBER,
                        description: 'Reference fat in grams per 100g.',
                      },
                      fiber_per_100g: {
                        type: Type.NUMBER,
                        description: 'Reference fiber in grams per 100g.',
                      },
                    },
                    required: [
                      'name',
                      'estimated_weight_grams',
                      'confidence',
                      'calories_per_100g',
                      'protein_per_100g',
                      'carbs_per_100g',
                      'fat_per_100g',
                      'fiber_per_100g',
                    ],
                  },
                },
              },
              required: ['isFood', 'mealOverview', 'suggestedMealType', 'detectedFoods'],
            },
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`[AI Food Scanner] Model ${model} returned error:`, err?.message || err);
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    if (!responseText) {
      throw lastError || new Error('All vision models failed to analyze the image.');
    }

    const rawParsed = JSON.parse(responseText);

    // If image is not food, return clean response immediately
    if (!rawParsed.isFood) {
      return res.json({
        success: true,
        data: {
          isFood: false,
          clarificationMessage:
            rawParsed.clarificationMessage ||
            'We could not detect clear food items in this photograph. Please point your camera directly at your plate with good lighting and retake.',
          mealOverview: 'Unrecognized Subject',
          suggestedMealType: 'lunch',
          confidenceLevel: 'low',
          foods: [],
          items: [],
          total_calories: 0,
          total_protein: 0,
          total_carbohydrates: 0,
          total_fat: 0,
          total_fiber: 0,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          totalFiber: 0,
        },
      });
    }

    // GROUNDING & CALCULATION ENGINE
    // For each food item identified by the vision model:
    // 1. Match against verified USDA food database
    // 2. Compute exact formula: (Nutritional Value per 100g * Estimated Food Weight) / 100
    // 3. Ensure mathematical sum consistency
    interface ProcessedFoodItem {
      name: string;
      category: string;
      estimated_weight_grams: number;
      calories: number;
      protein: number;
      carbohydrates: number;
      fat: number;
      fiber: number;
      confidence: 'high' | 'medium' | 'low';
      confidenceReason?: string;
      groundedInDb: boolean;
      per100g?: any;
    }

    const detectedRaw = Array.isArray(rawParsed.detectedFoods) ? rawParsed.detectedFoods : [];

    const structuredFoods: ProcessedFoodItem[] = detectedRaw.map((rawItem: any): ProcessedFoodItem => {
      const weight = Math.max(5, Math.round(Number(rawItem.estimated_weight_grams) || 100));

      const calculated = calculateFoodNutrition(rawItem.name, weight, {
        caloriesPer100g: rawItem.calories_per_100g,
        proteinPer100g: rawItem.protein_per_100g,
        carbsPer100g: rawItem.carbs_per_100g,
        fatPer100g: rawItem.fat_per_100g,
        fiberPer100g: rawItem.fiber_per_100g,
      });

      const conf = (rawItem.confidence === 'high' || rawItem.confidence === 'low') ? rawItem.confidence : 'medium';

      return {
        name: rawItem.name || calculated.displayName,
        category: calculated.category,
        estimated_weight_grams: weight,
        calories: calculated.calories,
        protein: calculated.protein,
        carbohydrates: calculated.carbohydrates,
        fat: calculated.fat,
        fiber: calculated.fiber,
        confidence: conf as 'high' | 'medium' | 'low',
        confidenceReason: rawItem.confidenceReason,
        groundedInDb: calculated.groundedInDb,
        per100g: calculated.per100g,
      };
    });

    // Calculate exact totals as the sum of all individual items
    const total_calories = structuredFoods.reduce((sum: number, f: ProcessedFoodItem) => sum + f.calories, 0);
    const total_protein = Math.round(structuredFoods.reduce((sum: number, f: ProcessedFoodItem) => sum + f.protein, 0) * 10) / 10;
    const total_carbohydrates = Math.round(structuredFoods.reduce((sum: number, f: ProcessedFoodItem) => sum + f.carbohydrates, 0) * 10) / 10;
    const total_fat = Math.round(structuredFoods.reduce((sum: number, f: ProcessedFoodItem) => sum + f.fat, 0) * 10) / 10;
    const total_fiber = Math.round(structuredFoods.reduce((sum: number, f: ProcessedFoodItem) => sum + f.fiber, 0) * 10) / 10;

    // Backwards-compatible mapped items for UI components
    const mappedItems = structuredFoods.map((f: ProcessedFoodItem, idx: number) => ({
      id: `scan-item-${Date.now()}-${idx}`,
      name: f.name,
      category: f.category,
      servingSize: f.estimated_weight_grams,
      servingUnit: 'g',
      estimated_weight_grams: f.estimated_weight_grams,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbohydrates,
      carbohydrates: f.carbohydrates,
      fat: f.fat,
      fiber: f.fiber,
      confidence: f.confidence,
      groundedInDb: f.groundedInDb,
    }));

    // Construct final validated response adhering strictly to Requirement 6 format
    const validatedResponse = {
      // 1. Exact structured format specified in Requirement 6:
      foods: structuredFoods.map((f: ProcessedFoodItem) => ({
        name: f.name,
        estimated_weight_grams: f.estimated_weight_grams,
        calories: f.calories,
        protein: f.protein,
        carbohydrates: f.carbohydrates,
        fat: f.fat,
        fiber: f.fiber,
        confidence: f.confidence,
      })),
      total_calories,
      total_protein,
      total_carbohydrates,
      total_fat,
      total_fiber,

      // 2. Rich metadata & backwards-compatibility for existing UI
      isFood: true,
      mealOverview: rawParsed.mealOverview || 'Recognized Meal Plate',
      suggestedMealType: rawParsed.suggestedMealType || 'lunch',
      confidenceLevel: rawParsed.confidenceLevel || 'high',
      nutritionalNotes: rawParsed.nutritionalNotes || 'Nutrient estimates calculated using verified USDA reference per 100g and estimated weights.',
      items: mappedItems,
      totalCalories: total_calories,
      totalProtein: total_protein,
      totalCarbs: total_carbohydrates,
      totalFat: total_fat,
      totalFiber: total_fiber,
    };

    return res.json({
      success: true,
      data: validatedResponse,
    });
  } catch (error: any) {
    console.error('Error during AI meal scan:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to analyze meal photograph. Please try again.',
    });
  }
});

// AI Nutrition Assistant endpoint grounded in real user meal records & nutrition profile
app.post('/api/nutrition-assistant', async (req, res) => {
  try {
    const { messages = [], userContext = {} } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing messages array in request body.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const userProfile = userContext.userProfile || {};
    const todaySummary = userContext.todaySummary || {};
    const todayMeals = Array.isArray(userContext.todayMeals) ? userContext.todayMeals : [];
    const weeklySummary = userContext.weeklySummary || {};

    const systemPrompt = `
You are the NutriTrack 2.0 AI Nutrition Assistant—an empathetic, highly skilled clinical nutrition expert and culinary advisor.

YOUR MISSION:
Help the user make informed, practical dietary decisions by grounding every recommendation directly in their actual food logs, macro targets, and personal dietary preferences.

LIVE USER PROFILE & TARGETS:
- Name: ${userProfile.name || 'User'}
- Dietary Preference: ${userProfile.dietaryPreference || 'Balanced'}
- Dietary Restrictions / Allergies: ${Array.isArray(userProfile.dietaryRestrictions) && userProfile.dietaryRestrictions.length > 0 ? userProfile.dietaryRestrictions.join(', ') : 'None specified'}
- Preferred Meals: ${Array.isArray(userProfile.preferredMeals) ? userProfile.preferredMeals.join(', ') : 'breakfast, lunch, dinner, snacks'}
- Daily Calorie Target: ${userProfile.dailyCalorieTarget || 2100} kcal
- Daily Protein Target: ${userProfile.dailyProteinTarget || 120} g
- Daily Carbohydrates Target: ${userProfile.dailyCarbsTarget || 220} g
- Daily Fat Target: ${userProfile.dailyFatTarget || 65} g
- Daily Fiber Target: ${userProfile.dailyFiberTarget || 30} g
- Water Target: ${userProfile.dailyWaterTargetGlasses || 8} glasses (2000 ml)

TODAY'S RECORDED INTAKE (${todaySummary.date || 'Today'}):
- Calories Consumed: ${todaySummary.calories || 0} kcal (Remaining: ${Math.max(0, (userProfile.dailyCalorieTarget || 2100) - (todaySummary.calories || 0))} kcal)
- Protein Consumed: ${todaySummary.protein || 0} g (Remaining: ${Math.max(0, (userProfile.dailyProteinTarget || 120) - (todaySummary.protein || 0))} g)
- Carbohydrates Consumed: ${todaySummary.carbs || 0} g
- Fat Consumed: ${todaySummary.fat || 0} g
- Fiber Consumed: ${todaySummary.fiber || 0} g
- Water Drunk: ${todaySummary.waterGlasses || 0} glasses

TODAY'S LOGGED FOOD ITEMS:
${todayMeals.length > 0
  ? todayMeals.map((m: any) => `- [${m.mealType?.toUpperCase() || 'MEAL'}] ${m.foodName} (${m.calories} kcal, ${m.protein}g P, ${m.carbs}g C, ${m.fat}g F, ${m.fiber}g fiber)`).join('\n')
  : 'No foods recorded yet today.'}

RECENT WEEKLY TRENDS:
- 7-Day Average Daily Calories: ${weeklySummary.avgCalories || todaySummary.calories || 'N/A'} kcal
- 7-Day Average Daily Protein: ${weeklySummary.avgProtein || todaySummary.protein || 'N/A'} g
- Total Logged Days: ${weeklySummary.loggedDaysCount || 7}

RESPONSE GUIDELINES:
1. Always ground your answers in the user's exact recorded foods, remaining calorie/macro budget, and stated restrictions. Never invent phantom meal records.
2. If the user asks what they should eat for their next meal or dinner, calculate their remaining macro/calorie budget and suggest 2-3 specific, delicious meal ideas that fit within their numbers while strictly respecting their dietary restrictions (e.g., if gluten-free or vegetarian, ensure suggestions follow that).
3. If the user asks about today's progress or balance, give an objective, encouraging assessment highlighting positive choices (e.g. good fiber or lean protein) and actionable advice for evening meals.
4. Keep answers concise, clear, and well-structured using markdown (bolding, bullet points, headers).
5. Always provide 2-3 short, highly relevant follow-up questions in "suggestedFollowUps" that the user might want to ask next.

Return the response in JSON matching the schema.
`.trim();

    // Format conversation history for Gemini
    const lastUserMessage = messages[messages.length - 1]?.content || 'Hello!';
    const conversationContext = messages
      .slice(0, -1)
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const combinedPrompt = conversationContext
      ? `Previous conversation context:\n${conversationContext}\n\nCurrent user question:\n${lastUserMessage}`
      : lastUserMessage;

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-3.8-flash'];
    let lastError: any = null;
    let assistantReply: string | null = null;
    let suggestedFollowUps: string[] = [];

    for (const model of modelsToTry) {
      try {
        console.log(`[AI Assistant] Generating response with model: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents: combinedPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description: 'The comprehensive, supportive, data-grounded nutritional advice formatted with clean markdown.',
                },
                suggestedFollowUps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                  description: '2 to 3 concise, highly relevant follow-up questions the user can tap next.',
                },
              },
              required: ['reply', 'suggestedFollowUps'],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          assistantReply = parsed.reply;
          suggestedFollowUps = Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : [];
          break;
        }
      } catch (err: any) {
        console.warn(`[AI Assistant] Model ${model} returned error:`, err?.message || err);
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    if (!assistantReply) {
      throw lastError || new Error('Failed to generate assistant reply with available models.');
    }

    return res.json({
      success: true,
      data: {
        reply: assistantReply,
        suggestedFollowUps: suggestedFollowUps.slice(0, 3),
      },
    });
  } catch (error: any) {
    console.error('Error during AI Nutrition Assistant query:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'The AI Nutrition Assistant is temporarily unavailable. Please try again.',
    });
  }
});


// Setup Vite middleware in dev or static files in production
async function startServer() {
  const httpServer = http.createServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`NutriTrack server running on port ${PORT} (production: ${isProduction})`);
  });
}

startServer();
