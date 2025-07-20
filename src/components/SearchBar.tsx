import React, { useState } from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { SearchResult } from '../types/zoning';
import { ZoningAPI } from '../utils/api';

interface SearchBarProps {
  onSearchResults: (results: SearchResult) => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearchResults, className = '' }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const results = await ZoningAPI.searchWithAI(query);
      onSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`w-full max-w-2xl ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="bg-gray-800 rounded-lg shadow-lg flex items-center p-2 border border-gray-700 mt-[1rem]">
          <Search className="text-gray-400 mx-3" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for addresses or ask 'What can I build here?'"
            className="bg-transparent w-full focus:outline-none text-white placeholder-gray-400"
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md flex items-center transition-colors duration-200 ml-2"
          >
            {isSearching ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : (
              <Sparkles className="mr-2" size={16} />
            )}
            {isSearching ? 'Searching...' : 'AI Search'}
          </button>
        </div>
      </form>
    </div>
  );
};