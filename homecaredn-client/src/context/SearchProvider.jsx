import { useState, useCallback, useMemo } from 'react';
import { searchService } from '../services/searchService';
import SearchContext from './SearchContext';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';

export const SearchProvider = ({ children }) => {
    const [search, setSearch] = useState([]);
    const [totalSearch, setTotalSearch] = useState(0);
    const [loading, setLoading] = useState(false);

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
                    SearchType
                });
                const itemsWithType = (data.items || []).map((s) => ({
                    ...s,
                }));
                setSearch(itemsWithType);
                setTotalSearch(data.totalCount || 0);
                return itemsWithType;
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
    const fetchSearchMaterial = useCallback(
        async (params = {}) => {
            try {
                const res = await searchService.searchMaterial(params);
                return res.items || [];
            } catch (err) {
                toast.error(handleApiError(err));
                return [];
            }
        },
    );

    // ================= SEARCH SERVICE (Repair/Construction) =================
    const fetchSearchService = useCallback(
        async (params = {}) => {
            try {
                const res = await searchService.searchService(params);
                return res.items || [];
            } catch (err) {
                toast.error(handleApiError(err));
                return [];
            }
        },
    );

    // ==================== CONTEXT VALUE ====================
    const contextValue = useMemo(
        () => ({
            search,
            totalSearch,
            loading,
            fetchSearchHistory,
            fetchSearchMaterial,
            fetchSearchService,
        }),
        [
            search,
            totalSearch,
            loading,
            fetchSearchHistory,
            fetchSearchMaterial,
            fetchSearchService,
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
