/**
 * Custom hook for fetching and managing dropdown options.
 * 
 * Provides a reusable way to fetch dropdown options with caching and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import config from '@/lib/config';

interface DropdownOption {
  id: string;
  name: string;
  display_name: string;
  icon?: string;
  is_other?: boolean;
  is_active?: boolean;
  order?: number;
  description?: string;
}

export interface AllDropdownOptions {
  subjects: DropdownOption[];
  order_types: DropdownOption[];
  academic_levels: DropdownOption[];
  citation_styles: DropdownOption[];
  languages: DropdownOption[];
  order_statuses: DropdownOption[];
  urgency_levels: DropdownOption[];
}

interface UseDropdownOptionsResult {
  options: DropdownOption[];
  allOptions: AllDropdownOptions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Cache for storing fetched options to avoid repeated API calls
const optionsCache = new Map<string, DropdownOption[]>();
const allOptionsCache = new Map<string, AllDropdownOptions>();

/**
 * Hook for fetching specific dropdown options
 */
export const useDropdownOptions = (
  fieldType?: 'subjects' | 'order-types' | 'academic-levels' | 'citation-styles' | 
           'languages' | 'order-statuses' | 'urgency-levels'
): UseDropdownOptionsResult => {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [allOptions, setAllOptions] = useState<AllDropdownOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (fieldType) {
        // Fetch specific field type
        const cacheKey = fieldType;
        
        // Check cache first
        if (optionsCache.has(cacheKey)) {
          setOptions(optionsCache.get(cacheKey) || []);
          setLoading(false);
          return;
        }

        // Absolute, via config — the API lives on a different origin in every
        // environment. A relative path resolves against the Next server, which
        // has no such route, so this silently 404'd and every consumer fell
        // through to its static fallback.
        const response = await fetch(config.getApiUrl(`dropdown-options/${fieldType}/`));
        if (!response.ok) {
          throw new Error(`Failed to fetch ${fieldType}: ${response.statusText}`);
        }

        const data = await response.json();
        setOptions(data);
        
        // Cache the result
        optionsCache.set(cacheKey, data);
      } else {
        // Fetch all options
        const cacheKey = 'all';
        
        // Check cache first
        if (allOptionsCache.has(cacheKey)) {
          setAllOptions(allOptionsCache.get(cacheKey) || null);
          setLoading(false);
          return;
        }

        const response = await fetch(config.getApiUrl('dropdown-options/'));
        if (!response.ok) {
          throw new Error(`Failed to fetch dropdown options: ${response.statusText}`);
        }

        const data = await response.json();
        setAllOptions(data);
        
        // Cache the result
        allOptionsCache.set(cacheKey, data);
      }
    } catch (err) {
      console.error('Error fetching dropdown options:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch options');
    } finally {
      setLoading(false);
    }
  }, [fieldType]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const refetch = useCallback(async () => {
    // Clear cache for this specific request
    if (fieldType) {
      optionsCache.delete(fieldType);
    } else {
      allOptionsCache.delete('all');
    }
    await fetchOptions();
  }, [fetchOptions, fieldType]);

  return {
    options,
    allOptions,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching all dropdown options at once
 */
export const useAllDropdownOptions = () => {
  return useDropdownOptions();
};

/**
 * Hook for fetching specific dropdown options
 */
export const useSpecificDropdownOptions = (
  fieldType: 'subjects' | 'order-types' | 'academic-levels' | 'citation-styles' | 
           'languages' | 'order-statuses' | 'urgency-levels'
) => {
  return useDropdownOptions(fieldType);
};

/**
 * Utility function to clear all cached options (useful after admin changes)
 */
export const clearDropdownOptionsCache = () => {
  optionsCache.clear();
  allOptionsCache.clear();
};

/**
 * Utility function to get display name for an option
 */
export const getOptionDisplayName = (
  options: DropdownOption[],
  optionId: string,
  customValue?: string
): string => {
  const option = options.find(opt => opt.id === optionId);
  if (!option) return '';
  
  if (option.is_other && customValue) {
    return customValue;
  }
  
  return option.display_name;
};

/**
 * Utility function to find option by name (backward compatibility)
 */
export const findOptionByName = (
  options: DropdownOption[],
  name: string
): DropdownOption | undefined => {
  return options.find(opt => opt.name === name);
};

/**
 * Utility function to find "Other" option in a list
 */
export const findOtherOption = (
  options: DropdownOption[]
): DropdownOption | undefined => {
  return options.find(opt => opt.is_other);
};