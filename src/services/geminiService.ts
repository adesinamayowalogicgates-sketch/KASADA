import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const recommendationsCache = new Map<string, Product[]>();

export async function getCompleteTheLook(currentProduct: Product, allProducts: Product[]): Promise<Product[]> {
  if (recommendationsCache.has(currentProduct.id)) {
    return recommendationsCache.get(currentProduct.id)!;
  }

  try {
    const otherProducts = allProducts.filter(p => p.id !== currentProduct.id);
    
    const prompt = `
      You are a high-end interior designer for KASADA, a luxury Nigerian furniture brand.
      A customer is currently viewing the following product:
      Name: ${currentProduct.name}
      Category: ${currentProduct.category}
      Material: ${currentProduct.material}
      Style: ${currentProduct.style}
      Description: ${currentProduct.description}

      Based on this product, select exactly 3 complementary products from the list below that would "Complete the Look" for a cohesive room design.
      Consider style, material compatibility, and functional pairing (e.g., if it's a bed, suggest a nightstand or dresser).

      Available Products:
      ${otherProducts.map(p => `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Style: ${p.style}`).join('\n')}

      Return only the IDs of the 3 selected products in a JSON array.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const recommendedIds: string[] = JSON.parse(response.text || "[]");
    const recs = otherProducts.filter(p => recommendedIds.includes(p.id));
    recommendationsCache.set(currentProduct.id, recs);
    return recs;
  } catch (error) {
    console.error("Error getting AI recommendations:", error);
    // Fallback to simple category matching if AI fails
    const fallback = allProducts
      .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
      .slice(0, 3);
    return fallback;
  }
}
