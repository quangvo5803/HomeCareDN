import { useContext } from 'react';
import ReviewContext from '../context/ReviewContext';
export const useReview = () => useContext(ReviewContext);
