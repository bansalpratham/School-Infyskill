module.exports = (data) => {
  const { currentPassword, newPassword } = data;

  if (!currentPassword || !newPassword) {
    throw new Error("Both passwords required");
  }

  return { currentPassword, newPassword };
};