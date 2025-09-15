import api from '../api';

export const geoService = {
  getProvinces: (depth = 1) => api.get(`/Geo/provinces?depth=${depth}`),
  getDistrictsByProvince: (provinceCode) =>
    api.get(`/Geo/districts?provinceCode=${provinceCode}`),
  getWardsByDistrict: (districtCode) =>
    api.get(`/Geo/wards?districtCode=${districtCode}`),
};