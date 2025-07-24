import { Parcel, BusinessRating, BusinessRatingResponse } from '../types/zoning';
import { generateAIResponse } from './azure-openai';
import { globalCacheManager } from './cache-manager';

export async function generateBusinessRatings(parcels: Parcel[]): Promise<BusinessRatingResponse> {
  if (parcels.length === 0) {
    throw new Error('No parcels provided for rating');
  }  // Check if we have cached ratings for all parcels
  const parcelIds = parcels.map(p => p.id);
  
  const cachedRatings = globalCacheManager.getBusinessRatings(parcelIds);
  if (cachedRatings) {
    console.log('🎯 Using cached business ratings for parcels:', parcelIds);
    return cachedRatings;
  }

  console.log('🔍 Generating new business ratings for parcels:', parcelIds);

  const parcelDescriptions = parcels.map((parcel, index) => {
    return `Parcel ${index + 1}:
- ID: ${parcel.id}
- Address: ${parcel.address}
- Zone: ${parcel.zoneId}
- Zone Type: ${parcel.attributes.ZONE_TYPE || 'Unknown'}
- Zone Name: ${parcel.attributes.ZONE_NAME || 'N/A'}
- Description: ${parcel.attributes.DESCRIPTION || 'No description'}`;
  }).join('\n\n');

  const prompt = `You are a business location analyst for Butuan City, Philippines. Analyze and rank these ${parcels.length} parcels for business potential.

PARCELS TO ANALYZE:
${parcelDescriptions}

INSTRUCTIONS:
1. Rate each parcel from 0-100% based on business viability
2. Rank them from best (1) to worst (${parcels.length})
3. Consider factors like:
   - Foot traffic and accessibility
   - Demographics (students, families, workers)
   - Competition levels
   - Infrastructure quality
   - Zone type advantages

4. Provide specific Filipino context (jeepney routes, schools like Caraga State University, malls, etc.)

RESPOND WITH THIS EXACT JSON FORMAT:
{
  "ratings": [
    {
      "parcelId": "actual_parcel_id",
      "rating": 85,
      "explanation": "Brief explanation why this location is good/bad for business",
      "factors": {
        "accessibility": 80,
        "footTraffic": 90,
        "demographics": 85,
        "competition": 70,
        "infrastructure": 88
      },
      "rank": 1
    }
  ],
  "summary": "Overall comparison summary",
  "methodology": "Brief explanation of analysis approach"
}

IMPORTANT: 
- Use actual parcel IDs from the input
- Keep explanations under 100 words
- Make ratings realistic and varied
- Consider Butuan City specific factors`;

  try {
    const response = await generateAIResponse(prompt);
    
    // Parse the AI response
    let aiData;
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      aiData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return fallback ratings
      return generateFallbackRatings(parcels);
    }    // Validate and ensure all parcels are included
    const ratings: BusinessRating[] = parcels.map((parcel, index) => {
      const aiRating = aiData.ratings?.find((r: any) => r.parcelId === parcel.id);
      
      if (aiRating) {
        return {
          parcelId: parcel.id,
          address: parcel.address, // Include the address
          rating: Math.max(0, Math.min(100, aiRating.rating || 50)),
          explanation: aiRating.explanation || 'No detailed analysis available.',
          factors: {
            accessibility: Math.max(0, Math.min(100, aiRating.factors?.accessibility || 50)),
            footTraffic: Math.max(0, Math.min(100, aiRating.factors?.footTraffic || 50)),
            demographics: Math.max(0, Math.min(100, aiRating.factors?.demographics || 50)),
            competition: Math.max(0, Math.min(100, aiRating.factors?.competition || 50)),
            infrastructure: Math.max(0, Math.min(100, aiRating.factors?.infrastructure || 50)),
          },
          rank: aiRating.rank || (index + 1)
        };
      } else {
        // Fallback for missing parcel
        return {
          parcelId: parcel.id,
          address: parcel.address, // Include the address
          rating: Math.floor(Math.random() * 40) + 40, // 40-80%
          explanation: 'This location has mixed business potential based on zone type and accessibility.',
          factors: {
            accessibility: 60,
            footTraffic: 55,
            demographics: 65,
            competition: 50,
            infrastructure: 60,
          },
          rank: index + 1
        };
      }
    });    // Sort by rating (highest first) and update ranks
    ratings.sort((a, b) => b.rating - a.rating);
    ratings.forEach((rating, index) => {
      rating.rank = index + 1;
    });

    const businessResponse: BusinessRatingResponse = {
      ratings,
      summary: aiData.summary || `Analyzed ${parcels.length} parcels for business potential in Butuan City.`,
      methodology: aiData.methodology || 'Analysis based on zone type, accessibility, demographics, and local market factors.'
    };    // Cache the successful result
    globalCacheManager.setBusinessRatings(parcelIds, businessResponse);

    return businessResponse;

  } catch (error) {
    console.error('Error generating business ratings:', error);
    return generateFallbackRatings(parcels);
  }
}

function generateFallbackRatings(parcels: Parcel[]): BusinessRatingResponse {
  const ratings: BusinessRating[] = parcels.map((parcel, index) => {
    // Simple rating based on zone type
    let baseRating = 50;
    const zoneType = parcel.zoneId?.toLowerCase() || '';
    
    if (zoneType.includes('commercial')) baseRating = 80;
    else if (zoneType.includes('mixed')) baseRating = 75;
    else if (zoneType.includes('residential')) baseRating = 60;
    else if (zoneType.includes('industrial')) baseRating = 45;

    // Add some randomness
    const rating = Math.max(30, Math.min(95, baseRating + Math.floor(Math.random() * 20) - 10));    return {
      parcelId: parcel.id,
      address: parcel.address, // Include the address
      rating,
      explanation: `This ${zoneType} zone offers ${rating >= 70 ? 'good' : rating >= 50 ? 'moderate' : 'limited'} business opportunities based on zoning regulations and location factors.`,
      factors: {
        accessibility: rating - 5,
        footTraffic: rating,
        demographics: rating + 5,
        competition: Math.max(30, rating - 10),
        infrastructure: rating - 2,
      },
      rank: index + 1
    };
  });

  // Sort by rating and update ranks
  ratings.sort((a, b) => b.rating - a.rating);
  ratings.forEach((rating, index) => {
    rating.rank = index + 1;
  });

  return {
    ratings,
    summary: `Basic analysis of ${parcels.length} parcels based on zoning types and general location factors.`,
    methodology: 'Fallback analysis using zone classification and basic business factors.'
  };
}

/**
 * Get business rating for a single parcel
 */
export async function getIndividualBusinessRating(parcel: Parcel): Promise<BusinessRating> {
  // First, check if this parcel exists in any comparison cache
  const existingComparison = globalCacheManager.findParcelInComparisons(parcel.id);
  if (existingComparison) {
    console.log('🎯 Using comparison cache rating for parcel:', parcel.id, 'from comparison of', existingComparison.parcelIds.length, 'parcels');
    const rating = existingComparison.ratings.find(r => r.parcelId === parcel.id);
    if (rating) {
      // Cache as individual rating for faster access next time
      globalCacheManager.setIndividualRating(parcel.id, rating);
      return rating;
    }
  }

  // Check individual cache
  const cachedRating = globalCacheManager.getIndividualRating(parcel.id);
  if (cachedRating) {
    console.log('🎯 Using cached individual rating for parcel:', parcel.id);
    return cachedRating;
  }

  console.log('🔍 Generating new individual rating for parcel:', parcel.id);

  // Generate rating for single parcel using the main function
  const response = await generateBusinessRatings([parcel]);
  const rating = response.ratings[0];

  // Cache the individual rating
  globalCacheManager.setIndividualRating(parcel.id, rating);

  return rating;
}