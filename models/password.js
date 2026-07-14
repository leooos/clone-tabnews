import bcrypt from "bcryptjs";

async function hash(plainTextPassword) {
  const saltRounds = getNumberOfSaltRounds();
  const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
  return hashedPassword;
}

async function compare(providedPassword, hashedPassword) {
  const isMatch = await bcrypt.compare(providedPassword, hashedPassword);
  return isMatch;
}

function getNumberOfSaltRounds() {
  console.log("NODE_ENV", process.env.NODE_ENV);
  return process.env.NODE_ENV === "production" ? 14 : 4;
}

const password = {
  hash,
  compare,
};

export default password;
