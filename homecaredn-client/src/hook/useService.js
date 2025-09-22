import { useContext } from 'react';
import ServiceContext from '../context/ServiceContext';
export const useService = () => useContext(ServiceContext);
