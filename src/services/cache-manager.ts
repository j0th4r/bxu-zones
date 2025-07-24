import { SearchResult, SuppliersResponse, BusinessRatingResponse, BusinessRating } from '../types/zoning';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

export interface ParcelCache {
  searchResults: Record<string, CacheEntry<SearchResult>>;
  suppliers: Record<string, CacheEntry<SuppliersResponse>>;
  businessRatings: Record<string, CacheEntry<BusinessRatingResponse>>;
  individualRatings: Record<string, CacheEntry<BusinessRating>>;
}

class CacheManager {
  private readonly CACHE_DURATION = {
    SEARCH_RESULTS: 30 * 60 * 1000, // 30 minutes
    SUPPLIERS: 60 * 60 * 1000, // 1 hour
    BUSINESS_RATINGS: 2 * 60 * 60 * 1000, // 2 hours
    INDIVIDUAL_RATINGS: 2 * 60 * 60 * 1000, // 2 hours
  };

  private cache: ParcelCache = {
    searchResults: {},
    suppliers: {},
    businessRatings: {},
    individualRatings: {}
  };

  private readonly STORAGE_KEY = 'bxu-zones-cache';
  private readonly MAX_CACHE_SIZE = 100; // Maximum entries per category

  constructor() {
    this.loadFromStorage();
    this.startCleanupInterval();
  }

  /**
   * Generate cache key for search results
   */
  private generateSearchKey(query: string): string {
    return `search_${query.toLowerCase().trim().replace(/\s+/g, '_')}`;
  }

  /**
   * Generate cache key for suppliers
   */
  private generateSupplierKey(location: string, context?: string): string {
    const contextPart = context ? `_${context.toLowerCase().replace(/\s+/g, '_')}` : '';
    return `supplier_${location.toLowerCase().replace(/\s+/g, '_')}${contextPart}`;
  }

  /**
   * Generate cache key for business ratings
   */
  private generateBusinessRatingKey(parcelIds: string[]): string {
    const sortedIds = parcelIds.sort().join(',');
    return `rating_${sortedIds}`;
  }

  /**
   * Generate cache key for individual parcel rating
   */
  private generateIndividualRatingKey(parcelId: string): string {
    return `individual_${parcelId}`;
  }

  /**
   * Check if cache entry is valid (not expired)
   */
  private isValidEntry<T>(entry: CacheEntry<T>): boolean {
    return Date.now() < entry.expiresAt;
  }

  /**
   * Create a new cache entry
   */
  private createEntry<T>(data: T, duration: number, key: string): CacheEntry<T> {
    const now = Date.now();
    return {
      data,
      timestamp: now,
      expiresAt: now + duration,
      key
    };
  }

  /**
   * Clean expired entries from a cache category
   */
  private cleanExpiredEntries<T>(cache: Record<string, CacheEntry<T>>): void {
    const now = Date.now();
    Object.keys(cache).forEach(key => {
      if (cache[key].expiresAt < now) {
        delete cache[key];
      }
    });
  }

  /**
   * Limit cache size by removing oldest entries
   */
  private limitCacheSize<T>(cache: Record<string, CacheEntry<T>>): void {
    const entries = Object.entries(cache);
    if (entries.length > this.MAX_CACHE_SIZE) {
      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest entries
      const toRemove = entries.length - this.MAX_CACHE_SIZE;
      for (let i = 0; i < toRemove; i++) {
        delete cache[entries[i][0]];
      }
    }
  }

  /**
   * Save cache to localStorage and create JSON log files
   */
  private saveToStorage(): void {
    try {
      const serializedCache = JSON.stringify(this.cache);
      localStorage.setItem(this.STORAGE_KEY, serializedCache);
      
      // Create downloadable logs for debugging
      this.createLogFiles();
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }
  /**
   * Create JSON log files for debugging and analysis
   */
  private createLogFiles(): void {
    try {
      // Create comprehensive log data
      const logData = {
        timestamp: new Date().toISOString(),
        cacheStats: this.getCacheStats(),
        searchResults: Object.values(this.cache.searchResults).map(entry => ({
          key: entry.key,
          query: entry.data.query,
          parcelCount: entry.data.results.parcels.length,
          timestamp: new Date(entry.timestamp).toISOString(),
          expiresAt: new Date(entry.expiresAt).toISOString()
        })),
        businessRatings: Object.values(this.cache.businessRatings).map(entry => ({
          key: entry.key,
          ratingsCount: entry.data.ratings.length,
          averageRating: entry.data.ratings.reduce((sum, r) => sum + r.rating, 0) / entry.data.ratings.length,
          timestamp: new Date(entry.timestamp).toISOString(),
          expiresAt: new Date(entry.expiresAt).toISOString()
        })),
        suppliers: Object.values(this.cache.suppliers).map(entry => ({
          key: entry.key,
          location: entry.data.searchLocation,
          supplierCount: entry.data.suppliers.length,
          timestamp: new Date(entry.timestamp).toISOString(),
          expiresAt: new Date(entry.expiresAt).toISOString()
        }))
      };

      // Store in a global variable for console access
      (window as any).BXU_CACHE_LOG = logData;
      
      console.log('📊 Cache Log Updated:', logData);
      console.log('💾 Access full cache data with: window.BXU_CACHE_LOG');
      console.log('📁 Download cache: cacheManager.downloadCacheLog()');
    } catch (error) {
      console.warn('Failed to create log files:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedCache = JSON.parse(stored);
        this.cache = parsedCache;
        
        // Clean expired entries on load
        this.cleanExpiredEntries(this.cache.searchResults);
        this.cleanExpiredEntries(this.cache.suppliers);
        this.cleanExpiredEntries(this.cache.businessRatings);
        this.cleanExpiredEntries(this.cache.individualRatings);
        
        console.log('🔄 Cache loaded from localStorage');
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      this.cache = {
        searchResults: {},
        suppliers: {},
        businessRatings: {},
        individualRatings: {}
      };
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanExpiredEntries(this.cache.searchResults);
      this.cleanExpiredEntries(this.cache.suppliers);
      this.cleanExpiredEntries(this.cache.businessRatings);
      this.cleanExpiredEntries(this.cache.individualRatings);
      this.saveToStorage();
    }, 5 * 60 * 1000); // Clean every 5 minutes
  }

  // Search Results Cache Methods
  getSearchResults(query: string): SearchResult | null {
    const key = this.generateSearchKey(query);
    const entry = this.cache.searchResults[key];
    
    if (entry && this.isValidEntry(entry)) {
      console.log(`✅ Cache hit for search: "${query}"`);
      return entry.data;
    }
    
    console.log(`❌ Cache miss for search: "${query}"`);
    return null;
  }

  setSearchResults(query: string, data: SearchResult): void {
    const key = this.generateSearchKey(query);
    this.cache.searchResults[key] = this.createEntry(data, this.CACHE_DURATION.SEARCH_RESULTS, key);
    this.limitCacheSize(this.cache.searchResults);
    this.saveToStorage();
    console.log(`💾 Cached search results for: "${query}"`);
  }

  // Suppliers Cache Methods
  getSuppliers(location: string, context?: string): SuppliersResponse | null {
    const key = this.generateSupplierKey(location, context);
    const entry = this.cache.suppliers[key];
    
    if (entry && this.isValidEntry(entry)) {
      console.log(`✅ Cache hit for suppliers: "${location}"`);
      return entry.data;
    }
    
    console.log(`❌ Cache miss for suppliers: "${location}"`);
    return null;
  }

  setSuppliers(location: string, context: string | undefined, data: SuppliersResponse): void {
    const key = this.generateSupplierKey(location, context);
    this.cache.suppliers[key] = this.createEntry(data, this.CACHE_DURATION.SUPPLIERS, key);
    this.limitCacheSize(this.cache.suppliers);
    this.saveToStorage();
    console.log(`💾 Cached suppliers for: "${location}"`);
  }

  // Business Ratings Cache Methods
  getBusinessRatings(parcelIds: string[]): BusinessRatingResponse | null {
    const key = this.generateBusinessRatingKey(parcelIds);
    const entry = this.cache.businessRatings[key];
    
    if (entry && this.isValidEntry(entry)) {
      console.log(`✅ Cache hit for business ratings: ${parcelIds.join(', ')}`);
      return entry.data;
    }
    
    console.log(`❌ Cache miss for business ratings: ${parcelIds.join(', ')}`);
    return null;
  }

  setBusinessRatings(parcelIds: string[], data: BusinessRatingResponse): void {
    const key = this.generateBusinessRatingKey(parcelIds);
    this.cache.businessRatings[key] = this.createEntry(data, this.CACHE_DURATION.BUSINESS_RATINGS, key);
    this.limitCacheSize(this.cache.businessRatings);
    
    // Also cache individual ratings
    data.ratings.forEach(rating => {
      this.setIndividualRating(rating.parcelId, rating);
    });
    
    this.saveToStorage();
    console.log(`💾 Cached business ratings for: ${parcelIds.join(', ')}`);
  }

  // Individual Rating Cache Methods
  getIndividualRating(parcelId: string): BusinessRating | null {
    const key = this.generateIndividualRatingKey(parcelId);
    const entry = this.cache.individualRatings[key];
    
    if (entry && this.isValidEntry(entry)) {
      console.log(`✅ Cache hit for individual rating: ${parcelId}`);
      return entry.data;
    }
    
    return null;
  }

  setIndividualRating(parcelId: string, data: BusinessRating): void {
    const key = this.generateIndividualRatingKey(parcelId);
    this.cache.individualRatings[key] = this.createEntry(data, this.CACHE_DURATION.INDIVIDUAL_RATINGS, key);
    this.limitCacheSize(this.cache.individualRatings);
    this.saveToStorage();
  }
  /**
   * Check if parcel has cached rating (for auto-loading)
   */
  hasIndividualRating(parcelId: string): boolean {
    const key = this.generateIndividualRatingKey(parcelId);
    const entry = this.cache.individualRatings[key];
    return entry ? this.isValidEntry(entry) : false;
  }
  /**
   * Find a parcel in any existing comparison cache
   */
  findParcelInComparisons(parcelId: string): { ratings: BusinessRating[], parcelIds: string[] } | null {
    // Search through all cached business rating comparisons
    for (const entry of Object.values(this.cache.businessRatings)) {
      if (this.isValidEntry(entry)) {
        const rating = entry.data.ratings.find(r => r.parcelId === parcelId);
        if (rating) {
          // Extract parcel IDs from the cached data
          const parcelIds = entry.data.ratings.map(r => r.parcelId);
          return {
            ratings: entry.data.ratings,
            parcelIds
          };
        }
      }
    }
    return null;
  }

  // Utility Methods
  clearCache(): void {
    this.cache = {
      searchResults: {},
      suppliers: {},
      businessRatings: {},
      individualRatings: {}
    };
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Cache cleared');
  }

  getCacheStats(): {
    searchResults: number;
    suppliers: number;
    businessRatings: number;
    individualRatings: number;
    totalSize: number;
  } {
    return {
      searchResults: Object.keys(this.cache.searchResults).length,
      suppliers: Object.keys(this.cache.suppliers).length,
      businessRatings: Object.keys(this.cache.businessRatings).length,
      individualRatings: Object.keys(this.cache.individualRatings).length,
      totalSize: JSON.stringify(this.cache).length
    };
  }

  exportCache(): string {
    return JSON.stringify(this.cache, null, 2);
  }

  /**
   * Download cache log as JSON file
   */
  downloadCacheLog(): void {
    const logData = (window as any).BXU_CACHE_LOG || { error: 'No cache log available' };
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bxu-zones-cache-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('📁 Cache log downloaded');
  }

  /**
   * Download full cache data as JSON file
   */
  downloadFullCache(): void {
    const cacheData = {
      timestamp: new Date().toISOString(),
      cache: this.cache,
      stats: this.getCacheStats()
    };
    
    const blob = new Blob([JSON.stringify(cacheData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bxu-zones-full-cache-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('📁 Full cache downloaded');
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Global cache instance for debugging
export const globalCacheManager = new CacheManager();

// Make cache manager available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).cacheManager = globalCacheManager;
}