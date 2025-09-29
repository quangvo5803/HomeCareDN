import { useContext } from 'react';
import AddressContext from '../context/AddressContext';

export const useAddress = () => useContext(AddressContext);
