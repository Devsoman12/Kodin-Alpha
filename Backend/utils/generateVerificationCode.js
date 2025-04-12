export const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit number between 1000 and 9999
}