import { useContext } from 'react';
import MaterialRequestContext from '../context/MaterialRequestContext';

export const useMaterialRequest = () => useContext(MaterialRequestContext);
