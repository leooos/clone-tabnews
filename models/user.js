import database from "infra/database";
import { ValidationError } from "infra/errors";

async function create(userInputValues) {
  await validareUniqueEmail(userInputValues.email);
  await validareUniqueUsername(userInputValues.username);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validareUniqueEmail(email) {
    const results = await database.query({
      text: `
        SELECT
          email
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        ;`,
      values: [email],
    });
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "The email address provided is already in use.",
        action: "Use a new email address.",
      });
    }
  }

  async function validareUniqueUsername(username) {
    const results = await database.query({
      text: `
        SELECT
          username
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        ;`,
      values: [username],
    });
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "The username provided is already in use.",
        action: "Use a new username.",
      });
    }
  }

  async function runInsertQuery(userInputValues) {
    const results = await database.query({
      text: `
        INSERT INTO
          users (username, email, password)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return results.rows[0];
  }
}

const user = {
  create,
};

export default user;
