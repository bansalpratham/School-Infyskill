module.exports = (data) => {
  const { firstName, lastName, phone } = data;

  if (!firstName || !lastName) {
    throw new Error("First and Last name are required");
  }

  return { firstName, lastName, phone };
};