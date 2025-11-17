import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/api/Search/search-service.factory';
import {
  GlobalSearchResponse,
  SearchResult,
} from '@/api/Search/search-service.interface';

interface UseGlobalSearchOptions {
  debounceMs?: number;
  enabled?: boolean;
}

export function useGlobalSearch(
  searchTerm: string,
  options: UseGlobalSearchOptions = {},
) {
  const { debounceMs = 300, enabled = true } = options;
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Debounce the search term
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm, debounceMs]);

  // Fetch search results
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['global-search', debouncedSearch],
    queryFn: async (): Promise<GlobalSearchResponse> => {
      if (!debouncedSearch || debouncedSearch.trim().length === 0) {
        return {
          doctors: {
            data: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
          patients: {
            data: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      const result = await searchService.searchAll(debouncedSearch, 1, 10);
      console.log('Global search result:', { search: debouncedSearch, result });
      return result;
    },
    enabled: enabled && debouncedSearch.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });

  // Combine doctors and patients results, maintaining order by relevance
  const combinedResults: SearchResult[] = [
    ...(data?.doctors?.data || []),
    ...(data?.patients?.data || []),
  ];

  const handleClearSearch = useCallback(() => {
    setDebouncedSearch('');
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  return {
    results: combinedResults,
    doctors: data?.doctors?.data || [],
    patients: data?.patients?.data || [],
    isLoading,
    isFetching,
    error,
    isEmpty: searchTerm.trim().length === 0,
    hasDoctors: (data?.doctors?.data?.length || 0) > 0,
    hasPatients: (data?.patients?.data?.length || 0) > 0,
    doctorsTotal: data?.doctors?.total || 0,
    patientsTotal: data?.patients?.total || 0,
    onClearSearch: handleClearSearch,
  };
}
