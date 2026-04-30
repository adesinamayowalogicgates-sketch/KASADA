import { Product } from "../types";

const recommendationsCache = new Map<string, Product[]>();

export async function getCompleteTheLook(currentProduct: Product, allProducts: Product[]): Promise<Product[]> {
  if (recommendationsCache.has(currentProduct.id)) {
    return recommendationsCache.get(currentProduct.id)!;
  }

  try {
    const response = await fetch("/api/ai/complete-the-look", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: currentProduct.id }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recommendations from server");
    }

    const { recommendedIds } = await response.json();
    const recs = allProducts.filter(p => recommendedIds.includes(p.id));
    
    // Save to cache
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
