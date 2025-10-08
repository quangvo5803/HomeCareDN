export const withMinLoading = async (asyncFunc, setLoading, minTime = 500) => {
  const startTime = Date.now();
  setLoading(true);
  try {
    return await asyncFunc();
  } finally {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(minTime - elapsed, 0);
    setTimeout(() => setLoading(false), remaining);
  }
};
