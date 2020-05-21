export const isEmail = value =>
value.length < 255
  && value.length > 5
  && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
