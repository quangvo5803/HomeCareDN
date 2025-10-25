import { adminService } from './adminService';
import { distributorService } from './distributorService';
import { contractorService } from './contractorService';
import { customerService } from './customerService';
import { publicService } from './publicService';

const getServiceByRole = (role) => {
  switch (role) {
    case 'Admin':
      return adminService;
    case 'Distributor':
      return distributorService;
    case 'Contractor':
      return contractorService;
    case 'Customer':
      return customerService;
    default:
      return publicService;
  }
};
export default getServiceByRole;
