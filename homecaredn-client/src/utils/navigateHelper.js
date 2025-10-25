let navigateFn = null;

export const setNavigate = (navigate) => {
  navigateFn = navigate;
};

export const navigateTo = (path) => {
  if (navigateFn) navigateFn(path);
};
