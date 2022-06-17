import express, { Request, Response } from "express";
import { dbClient, findAllAdmins, isSenderAdmin } from "../services";
import { isAdmin } from "./current-current-middleware";

export const adminRouter = express.Router();

adminRouter.get("/", isAdmin, async (req: Request, res: Response) => {
  const user_id = req.body.user_id;
  if (!user_id) {
    res
      .json({
        error: {
          code: 401,
          message: "Unauthorized",
        },
      })
      .status(401);
  }
  await dbClient.connect();
  const isAdmin = await isSenderAdmin(user_id);
  const adminList = isAdmin && (await findAllAdmins());
  await dbClient.close();
  res.send({ data: isAdmin ? adminList : null });
});

adminRouter.get("/check", async (req: Request, res: Response) => {
  const user_id = req.body.user_id;

  await dbClient.connect();
  const isAdmin = await isSenderAdmin(user_id);
  await dbClient.close();
  if (isAdmin) {
    res.cookie("telegram-management-user-id", user_id);
    res.status(200).send();
  } else {
    res.status(401).send();
  }
});
