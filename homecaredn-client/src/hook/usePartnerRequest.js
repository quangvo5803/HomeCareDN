import { useContext } from 'react';
import PartnerRequestContext from '../context/PartnerRequestContext';
export const usePartnerRequest = () => useContext(PartnerRequestContext);
