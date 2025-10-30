import { useEffect, useState } from 'react';
import api from './../services/public/api';

const CACHE_KEY = 'enumData';

export function useEnums() {
  const [enums, setEnums] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      const today = new Date().toISOString().split('T')[0]; // yyyy-MM-dd

      if (cached) {
        const parsed = JSON.parse(cached);
        const isExpired = parsed.date !== today; // khác ngày thì coi như hết hạn

        if (!isExpired) {
          setEnums(parsed.data);
          return;
        }
      }

      try {
        const res = await api.get('/enums');
        const data = res.data;

        setEnums(data);

        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, date: today }));
      } catch (error) {
        console.error('Failed to fetch enums:', error);
      }
    };

    loadData();
  }, []);

  return enums;
}
