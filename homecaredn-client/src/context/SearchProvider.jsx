import { useState, useCallback, useMemo } from 'react';
import { searchService } from '../services/searchService';
import SearchContext from './SearchContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';
import { aiChatService } from '../services/aiChatService';

export const SearchProvider = ({ children }) => {
  const [search, setSearch] = useState([]);
  const [totalSearch, setTotalSearch] = useState(0);
  const [loading, setLoading] = useState(false);

  // ==================== HELPER: Get History ====================
  const getHistoryList = useCallback(async (userId, type) => {
    try {
      if (userId) {
        // Logged in - Get from DB
        const params = {
          FilterID: userId,
          PageNumber: 1,
          PageSize: 5,
          SearchType: type,
        };
        const res = await searchService.getAll(params);
        const items = (res.items || []).slice(0, 5);
        return items.map((item) => ({
          searchTerm: item.searchTerm || item.name || item.nameEN || item || '',
          source: 'db',
        }));
      } else {
        // Not logged in - Get from localStorage
        const guestHistory = JSON.parse(
          localStorage.getItem(`guest_history_${type}`) || '[]'
        ).slice(0, 5);
        return guestHistory.map((term) => ({
          searchTerm: term,
          source: 'localStorage',
        }));
      }
    } catch {
      return [];
    }
  }, []);

  // ==================== HELPER: Get AI Suggestions ====================
  // Calls /aiChat/suggest endpoint - returns keywords ONLY
  const getAiSuggestions = useCallback(
    async (userId, history, type, language) => {
      try {
        const historyTerms = history.map((h) => h.searchTerm);
        const dto = {
          UserID: userId || null,
          History: historyTerms,
          SearchType: type,
          Language: language,
        };

        // Call /aiChat/suggest - returns ["keyword1", "keyword2", ...]
        let keywords = await aiChatService.suggest(dto);

        if (!Array.isArray(keywords)) {
          return [];
        }

        // Convert keywords to objects for consistency
        const normalized = keywords.map((x) => {
          if (typeof x === 'string') {
            return {
              name: x,
              nameEN: x,
              imageUrls: [],
              source: 'ai',
            };
          }
          return { ...x, source: 'ai' };
        });

        // Remove duplicates
        const seen = new Set();
        const unique = [];
        for (const item of normalized) {
          const name = item.name || item.nameEN;
          if (!seen.has(name)) {
            seen.add(name);
            unique.push(item);
          }
        }

        return unique.slice(0, 5); // Return max 5
      } catch {
        return [];
      }
    },
    []
  );

  // ==================== FETCH ====================
  const executeFetch = useCallback(
    async ({
      PageNumber = 1,
      PageSize = 10,
      FilterID,
      FinalSearch,
      SearchType,
    } = {}) => {
      try {
        const data = await searchService.getAll({
          PageNumber,
          PageSize,
          FilterID,
          FinalSearch,
          SearchType,
        });

        const items = (data.items || []).map((item) => {
          return item.searchTerm || item.name || item.nameEN || item || '';
        });

        setSearch(items);
        setTotalSearch(data.totalCount || 0);
        return items;
      } catch (err) {
        toast.error(handleApiError(err));
        setSearch([]);
        setTotalSearch(0);
        return [];
      }
    },
    []
  );

  const fetchSearchHistory = useCallback(
    async (params = {}) => {
      return await withMinLoading(() => executeFetch(params), setLoading);
    },
    [executeFetch]
  );

  // ================= SEARCH MATERIAL =================
  const fetchSearchMaterial = useCallback(async (params = {}) => {
    try {
      const res = await searchService.searchMaterial(params);
      return res.items || [];
    } catch (err) {
      toast.error(handleApiError(err));
      return [];
    }
  }, []);

  // ================= SEARCH SERVICE (Repair/Construction) =================
  const fetchSearchService = useCallback(async (params = {}) => {
    try {
      const res = await searchService.searchService(params);
      return res.items || [];
    } catch (err) {
      toast.error(handleApiError(err));
      return [];
    }
  }, []);

  // ==================== Get Combined Suggestions ====================
  // Returns history + AI keywords (NOT products/services)
  const getCombinedSuggestions = useCallback(
    async (userId, type, language) => {
      try {
        // Get history
        const history = await getHistoryList(userId, type);

        // Get AI keywords
        const aiSuggestions = await getAiSuggestions(
          userId,
          history,
          type,
          language
        );

        return {
          history: history.length > 0 ? history : [],
          aiSuggestions: aiSuggestions, // Always has AI or empty
          combined: [...history, ...aiSuggestions],
        };
      } catch {
        return {
          history: [],
          aiSuggestions: [],
          combined: [],
        };
      }
    },
    [getHistoryList, getAiSuggestions]
  );

  // ==================== Save Search Term ====================
  const saveSearchTerm = useCallback(async (userId, searchTerm, type) => {
    try {
      if (!searchTerm.trim()) return;

      if (userId) {
        // Logged in - Save to DB
        await searchService.saveSearch({
          SearchTerm: searchTerm,
          SearchType: type,
        });
      } else {
        // Not logged in - Save to localStorage
        const key = `guest_history_${type}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');

        const updated = [
          searchTerm,
          ...existing.filter((x) => x !== searchTerm),
        ].slice(0, 10);

        localStorage.setItem(key, JSON.stringify(updated));
      }
    } catch {
      //
    }
  }, []);

  // ==================== CONTEXT VALUE ====================
  const contextValue = useMemo(
    () => ({
      search,
      totalSearch,
      loading,
      fetchSearchHistory,
      fetchSearchMaterial,
      fetchSearchService,
      getCombinedSuggestions,
      saveSearchTerm,
    }),
    [
      search,
      totalSearch,
      loading,
      fetchSearchHistory,
      fetchSearchMaterial,
      fetchSearchService,
      getCombinedSuggestions,
      saveSearchTerm,
    ]
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

SearchProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
