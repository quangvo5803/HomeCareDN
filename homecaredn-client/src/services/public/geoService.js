import provincesData from '../../data/provinces.json';

export const geoService = {
  getProvinces: () => {
    return Promise.resolve({ data: provincesData });
  },

  // Lấy districts theo provinceCode
  getDistrictsByProvince: (provinceCode) => {
    const province = provincesData.find((p) => p.code === Number(provinceCode));
    const districts = province?.districts || [];
    return Promise.resolve({ data: { ...province, districts } });
  },

  // Lấy wards theo districtCode
  getWardsByDistrict: (districtCode) => {
    let districtFound = null;
    for (const province of provincesData) {
      const district = province.districts?.find(
        (d) => d.code === Number(districtCode)
      );
      if (district) {
        districtFound = district;
        break;
      }
    }
    const wards = districtFound?.wards || [];
    return Promise.resolve({ data: { ...districtFound, wards } });
  },
};
