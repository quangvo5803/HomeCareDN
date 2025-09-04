import { useContext } from 'react';
import CategoryContext from '../context/CategoryContext';

export const useCategory = () => useContext(CategoryContext);
