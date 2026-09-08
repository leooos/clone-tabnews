import { UnauthorizedError, NotFoundError } from "infra/errors";
import user from "models/user.js";
import password from "models/password.js";

async function getAuthenticatedUser(inputEmail, userInputPassword) {
  try {
    const storedUser = await findUserByEmail(inputEmail);
    await validatePassword(userInputPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Invalid email or password.",
        action: "Check your credentials and try again.",
      });
    }
    throw error;
  }

  async function findUserByEmail(inputEmail) {
    let stored;
    try {
      stored = await user.findOneByEmail(inputEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Invalid email or password.",
          action: "Check your credentials and try again.",
        });
      }
      throw error;
    }
    return stored;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const isPasswordValid = await password.compare(
      providedPassword,
      storedPassword,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError({
        message: "Invalid email or password.",
        action: "Check your credentials and try again.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
