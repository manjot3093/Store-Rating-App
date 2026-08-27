export const validateName = (name) => {
  if (!name || name.trim().length < 20) return 'Name must be at least 20 characters';
  if (name.trim().length > 60) return 'Name must not exceed 60 characters';
  return '';
};

export const validateAddress = (address) => {
  if (!address || !address.trim()) return 'Address is required';
  if (address.length > 400) return 'Address must not exceed 400 characters';
  return '';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !re.test(email)) return 'Enter a valid email address';
  return '';
};

export const validatePassword = (password) => {
  if (!password || password.length < 8 || password.length > 16) {
    return 'Password must be 8–16 characters';
  }
  if (!/[A-Z]/.test(password)) return 'Password needs at least one uppercase letter';
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\;'~`]/.test(password)) {
    return 'Password needs at least one special character';
  }
  return '';
};

export const extractApiError = (err) => {
  const data = err?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (data.errors?.length) return data.errors.map((e) => e.message).join(' · ');
  return data.message || 'Something went wrong. Please try again.';
};
