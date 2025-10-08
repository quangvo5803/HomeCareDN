import { useContext } from 'react';
import ServiceRequestContext from '../context/ServiceRequestContext';
export const useServiceRequest = () => useContext(ServiceRequestContext);
