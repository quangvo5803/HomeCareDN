import { useEffect, useState } from 'react';
import api from '../api';

const CACHE_KEY = 'enumData';
const CACHE_TIME = 7 * 24 * 60 * 60 * 1000; // 7 ngày (ms)

export function useEnums() {
  const [enums, setEnums] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const cached = localStorage.getItem(CACHE_KEY);

      if (cached) {
        const parsed = JSON.parse(cached);
        const isExpired = Date.now() - parsed.timestamp > CACHE_TIME;

        if (!isExpired) {
          setEnums(parsed.data);
          return;
        }
      }

      try {
        const res = await api.get('/Enums/all');

        const data = res.data;
        setEnums(data);

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } catch (error) {
        console.error('Failed to fetch enums:', error);
      }
    };

    loadData();
  }, []);

  return enums;
}
