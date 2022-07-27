import * as bcryptjs from 'bcryptjs';

export const comparePasswords = async (userPassword, currentPassword) => {
  return await bcryptjs.compare(currentPassword, userPassword);
};
