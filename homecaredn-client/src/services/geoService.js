import axios from 'axios';

const BASE_URL = 'https://provinces.open-api.vn/api/';

export const geoService = {
  getProvinces: (depth = 1) => axios.get(`${BASE_URL}?depth=${depth}`),
  getDistrictsByProvince: (provinceCode, depth = 2) =>
    axios.get(`${BASE_URL}p/${provinceCode}?depth=${depth}`),
  getWardsByDistrict: (districtCode, depth = 2) =>
    axios.get(`${BASE_URL}d/${districtCode}?depth=${depth}`),
};
