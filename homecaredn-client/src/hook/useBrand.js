import { useContext } from 'react';
import BrandContext from '../context/BrandContext';

export const useBrand = () => useContext(BrandContext);
