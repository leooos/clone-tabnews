import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const { username } = request.query;
  const userData = await user.findOneByUsername(username);

  return response.status(200).json(userData);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const uerData = request.body;

  const updatedUserData = await user.update(username, uerData);

  return response.status(200).json(updatedUserData);
}
