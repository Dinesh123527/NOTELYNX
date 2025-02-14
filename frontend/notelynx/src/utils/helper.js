export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateName = (name) => {
  const regex = /^[a-zA-Z.\s]+$/;
  return regex.test(name);
}

export const validateUserName = (userName) => {
  const regex = /^[a-zA-Z0-9_]+$/;
  return regex.test(userName);
};
export const getInitials = (name) => {
  if (!name) return "";

  const words = name.trim().split(" ");
  let initials = words[0][0];

  if (words.length > 1) {
    initials += words[1][0];
  }

  return initials.toUpperCase();
};

