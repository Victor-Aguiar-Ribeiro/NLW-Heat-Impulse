import { Router } from "express";
import { AuthenticateUserController } from "./controllers/AuthenticateUserController";
import { ensureAuthenticated } from "./middleware/ensureAuthenticated";

const router = Router();

router.post('/authenticate' , new AuthenticateUserController().handle);
router.post('/messages' , ensureAuthenticated , new AuthenticateUserController().handle);

export { router };