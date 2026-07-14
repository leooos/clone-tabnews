import database from "infra/database";
import password from "models/password";
import { ValidationError, NotFoundError } from "infra/errors";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT 
          1
        ;`,
      values: [username],
    });
    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "The username provided is not found.",
        action: "Use a different username.",
      });
    }

    return results.rows[0];
  }
}

async function create(userInputValues) {
  await _validateUniqueEmail(userInputValues.email);
  await _validateUniqueUsername(userInputValues.username);
  await _hashPassword(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

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

async function update(username, userInputValues) {
  const userFound = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await _validateUniqueUsername(userInputValues.username);
  }
  if ("email" in userInputValues) {
    await _validateUniqueEmail(userInputValues.email);
  }
  if ("password" in userInputValues) {
    await _hashPassword(userInputValues);
  }

  let userWithUpdates = { ...userFound, ...userInputValues };
  const updatedUser = await runUpdateQuery(userWithUpdates);
  return updatedUser;

  async function runUpdateQuery(userWithUpdates) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          username = $1,
          email = $2,
          password = $3,
          "updatedAt" = timezone('utc', now())
        WHERE
          id = $4
        RETURNING
          *
        ;`,
      values: [
        userWithUpdates.username,
        userWithUpdates.email,
        userWithUpdates.password,
        userWithUpdates.id,
      ],
    });
    return results.rows[0];
  }
}

async function _validateUniqueUsername(username) {
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

async function _validateUniqueEmail(email) {
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

async function _hashPassword(userInputValues) {
  const hash = await password.hash(userInputValues.password);
  userInputValues.password = hash;
}

const user = {
  findOneByUsername,
  create,
  update,
};

export default user;
