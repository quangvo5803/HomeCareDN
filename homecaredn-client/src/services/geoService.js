import api from '../api';

export const geoService = {
  getProvinces: (depth = 1) => api.get(`/Geo/provinces?depth=${depth}`),
  getDistrictsByProvince: (provinceCode) =>
    api.get(`/Geo/districts?provinceCode=${provinceCode}`), // trả object province có districts
  getWardsByDistrict: (districtCode) =>
    api.get(`/Geo/wards?districtCode=${districtCode}`), // trả object district có wards
};