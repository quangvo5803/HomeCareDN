import { useContext } from 'react';
import PartnerContext from '../context/PartnerContext';
export const usePartner = () => useContext(PartnerContext);
