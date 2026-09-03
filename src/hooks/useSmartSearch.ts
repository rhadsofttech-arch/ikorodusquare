import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  executeGlobalSearch,
  SearchResultsPayload,
} from '../services/searchService';

export function useSmartSearch() {
  const {
    searchQuery,
    setSearchQuery,
    selectedArea,
    vendors,
    products,
    isNearMeActive,
    userLocation,
    nearMeRadiusKm,
    setNearMeRadiusKm,
    requestNearMe,
    disableNearMe,
    locationStatus,
    locationError,
  } = useApp();

  const [results, setResults] = useState<SearchResultsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debounce & cancellation ref
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(
    async (queryText: string) => {
      // If no query and Near Me is off, reset results
      if (!queryText.trim() && !isNearMeActive) {
        setResults(null);
        setIsLoading(false);
        return;
      }

      // Abort any ongoing network request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);

      try {
        const payload = await executeGlobalSearch({
          query: queryText,
          selectedArea,
          isNearMeActive,
          userLocation,
          radiusKm: nearMeRadiusKm,
          cachedVendors: vendors,
          cachedProducts: products,
          signal: abortControllerRef.current.signal,
        });

        setResults(payload);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Smart search execution error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [selectedArea, isNearMeActive, userLocation, nearMeRadiusKm, vendors, products]
  );

  // Trigger search with 250ms debouncing on query change or instant on toggle
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim().length > 0 || isNearMeActive) {
      setIsLoading(true);
      debounceTimerRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 250);
    } else {
      setResults(null);
      setIsLoading(false);
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, performSearch, isNearMeActive]);

  const toggleNearMe = useCallback(async () => {
    if (isNearMeActive) {
      disableNearMe();
    } else {
      const granted = await requestNearMe();
      if (granted) {
        setIsDropdownOpen(true);
      }
    }
  }, [isNearMeActive, disableNearMe, requestNearMe]);

  return {
    searchQuery,
    setSearchQuery,
    selectedArea,
    results,
    isLoading,
    isDropdownOpen,
    setIsDropdownOpen,
    isNearMeActive,
    toggleNearMe,
    locationStatus,
    locationError,
    nearMeRadiusKm,
    setNearMeRadiusKm,
    refreshSearch: () => performSearch(searchQuery),
  };
}
