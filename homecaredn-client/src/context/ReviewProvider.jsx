import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import { reviewService } from '../services/reviewService';
import { withMinLoading } from '../utils/withMinLoading';
import ReviewContext from './ReviewContext';

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(false);

  const executeFetch = useCallback(
    async ({
      PageNumber = 1,
      PageSize = 10,
      SortBy,
      FilterID,
      Rating,
    } = {}) => {
      try {
        const data = await reviewService.getAll({
          PageNumber,
          PageSize,
          SortBy,
          FilterID,
          Rating,
        });

        const items = data.items || [];
        setReviews(items);
        setTotalReviews(data.totalCount || 0);
        return items;
      } catch (err) {
        toast.error(handleApiError(err));
        setReviews([]);
        setTotalReviews(0);
        return [];
      }
    },
    []
  );

  const fetchReviews = useCallback(
    async (params = {}) => {
      return await withMinLoading(() => executeFetch(params), setLoading);
    },
    [executeFetch]
  );

  const contextValue = useMemo(
    () => ({
      reviews,
      totalReviews,
      loading,
      fetchReviews,
    }),
    [reviews, totalReviews, loading, fetchReviews]
  );

  return (
    <ReviewContext.Provider value={contextValue}>
      {children}
    </ReviewContext.Provider>
  );
};

ReviewProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
