// Background script for Amazon Tariffs extension
// import { Redis } from "@upstash/redis";
import { ENV } from "./config";
import { OpenAI } from "openai";

// Type definitions
interface ProductInfo {
  title: string;
  price: number;
  countryOfOrigin: string | null;
}

interface TariffInfo {
  rate: number;
  category: string;
  isFallback: boolean;
}

// Initialize the OpenAI client for OpenRouter
const openai = new OpenAI({
  apiKey: ENV.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// // Initialize Redis client
// const redis = new Redis({
//   url: ENV.UPSTASH_REDIS_URL,
//   token: ENV.UPSTASH_REDIS_TOKEN,
// });

// Function to determine product category based on title
function determineCategory(title: string): string {
  title = title.toLowerCase();

  // Simple keyword matching for demo purposes
  if (
    title.match(
      /phone|laptop|computer|earbuds|headphones|tablet|camera|tv|monitor|keyboard|mouse|speaker|router|charger|cable|adapter/i
    )
  ) {
    return "Electronics";
  }

  if (
    title.match(
      /chair|sofa|table|desk|bed|mattress|couch|cabinet|dresser|bookshelf|drawer|nightstand/i
    )
  ) {
    return "Furniture";
  }

  if (
    title.match(
      /shirt|dress|pants|jeans|jacket|coat|sweater|sweatshirt|hoodie|socks|underwear|hat|gloves|scarf/i
    )
  ) {
    return "Apparel";
  }

  if (title.match(/shoes|boots|sneakers|sandals|slippers|loafers|heels/i)) {
    return "Footwear";
  }

  if (
    title.match(
      /toy|game|puzzle|doll|figure|lego|action figure|plush|stuffed|board game/i
    )
  ) {
    return "Toys";
  }

  return "Other";
}

// Function to get tariff percentage based on category
function getTariffRate(category: string): number {
  switch (category) {
    case "Electronics":
      return 20;
    case "Furniture":
      return 25;
    case "Apparel":
      return 30;
    case "Footwear":
      return 16;
    case "Toys":
      return 7.5;
    default:
      return 145; // Default high tariff for uncategorized items
  }
}

// Check redis cache for product tariff info
// async function getCachedTariffInfo(
//   productTitle: string
// ): Promise<TariffInfo | null> {
//   try {
//     // Create a cache key based on the product title
//     const cacheKey = `tariff:${productTitle
//       .trim()
//       .toLowerCase()
//       .replace(/\s+/g, "-")
//       .substring(0, 100)}`;
//     const cachedResult = (await redis.get(cacheKey)) as TariffInfo | null;
//     return cachedResult;
//   } catch (error) {
//     console.error("Redis cache error:", error);
//     return null;
//   }
// }

// Store tariff info in redis cache
// async function cacheTariffInfo(
//   productTitle: string,
//   tariffInfo: TariffInfo
// ): Promise<void> {
//   try {
//     // Create a cache key based on the product title
//     const cacheKey = `tariff:${productTitle
//       .trim()
//       .toLowerCase()
//       .replace(/\s+/g, "-")
//       .substring(0, 100)}`;
//     // Store with 7-day expiration
//     await redis.set(cacheKey, tariffInfo, { ex: 7 * 24 * 60 * 60 });
//   } catch (error) {
//     console.error("Redis cache error:", error);
//   }
// }

// Use AI to categorize products with OpenRouter and Gemini Flash
async function aiCategorizeProduct(title: string): Promise<string | null> {
  try {
    console.log("Categorizing product with AI:", title);

    const systemPrompt = `
      You are "TariffBot".
      Goal: determine the category for a product that would be subject to Trump tariffs if from China.
      Output a single category name from this exact list: "Electronics", "Furniture", "Apparel", "Footwear", "Toys", or "Other".
      Do not include any other text in your response, just the category name.

      REFERENCES:
      Categories and examples:
      • Electronics → phones, computers, earbuds, TVs
      • Furniture → chairs, tables, beds, sofas
      • Apparel → shirts, pants, jackets, hats
      • Footwear → shoes, boots, sandals
      • Toys → games, puzzles, dolls, action figures
      • Other → anything else
    `;

    const completion = await openai.chat.completions.create({
      model: ENV.AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Product: ${title}` },
      ],
      // @ts-expect-error: extra_headers is not in OpenAI types but supported by OpenRouter
      extra_headers: {
        "HTTP-Referer": "https://amazon-tariffs.local/",
        "X-Title": "Amazon Tariff Calculator",
      },
    });

    const category = completion.choices[0]?.message?.content?.trim() ?? null;
    console.log("AI categorized product as:", category);

    if (
      typeof category === "string" &&
      [
        "Electronics",
        "Furniture",
        "Apparel",
        "Footwear",
        "Toys",
        "Other",
      ].includes(category)
    ) {
      return category;
    }
    return null;
  } catch (error) {
    console.error("Error categorizing with AI:", error);
    return null;
  }
}

// Process tariff calculation with caching
async function processTariffCalculation(
  productInfo: ProductInfo
): Promise<TariffInfo> {
  try {
    // First, check the cache
    // const cachedInfo = await getCachedTariffInfo(productInfo.title);
    // if (cachedInfo) {
    //   console.log("Cache hit for:", productInfo.title);
    //   return cachedInfo;
    // }

    console.log("Cache miss for:", productInfo.title);

    // Use AI for categorization when available
    const aiCategory = await aiCategorizeProduct(productInfo.title);

    // Use AI category if available, otherwise fallback to keyword matching
    const category = aiCategory || determineCategory(productInfo.title);
    const rate = getTariffRate(category);

    const tariffInfo: TariffInfo = {
      rate,
      category,
      isFallback: rate === 145,
    };

    // Cache the result
    // await cacheTariffInfo(productInfo.title, tariffInfo);

    return tariffInfo;
  } catch (error) {
    console.error("Error processing tariff calculation:", error);

    // Fallback to simple category detection if anything fails
    const category = determineCategory(productInfo.title);
    const rate = getTariffRate(category);

    return {
      rate,
      category,
      isFallback: rate === 145,
    };
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "calculateTariff") {
    const { productInfo } = request;

    // Process the tariff calculation
    processTariffCalculation(productInfo).then((tariffInfo) => {
      sendResponse(tariffInfo);
    });

    return true; // Required for async sendResponse
  }
});

// Listen for installation or update
chrome.runtime.onInstalled.addListener(() => {
  // Load environment variables from .env.local if available
  console.log("Amazon Tariff Calculator installed and ready");
  console.log("AI Model:", ENV.AI_MODEL);
});
