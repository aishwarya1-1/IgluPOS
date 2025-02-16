export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") {
    return false; // Assume it's not a mobile device on the server
  }

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};
