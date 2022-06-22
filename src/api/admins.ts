import { CustomError } from "../utils";
import express, { Request, Response } from "express";
import { dbClient, findAllAdmins, isSenderAdmin } from "../services";
import { isAdmin } from "./current-current-middleware";

export const adminRouter = express.Router();

adminRouter.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    await dbClient.connect();
    const adminList = await findAllAdmins();
    await dbClient.close();
    return res.send({
      data: {
        admins: adminList ?? [],
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).send({
        error: {
          name: error.name,
          message: error.message,
        },
      });
    }
    return res.status(400).send();
  }
});

adminRouter.get("/check/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    await dbClient.connect();
    const isAdmin = await isSenderAdmin(Number(userId));
    await dbClient.close();
    if (!isAdmin) {
      throw new CustomError("Unauthorized", 401);
    }
    return res
      .status(204)
      .cookie("telegram-management-user-id", Number(userId))
      .send();
  } catch (error) {
    if (error instanceof CustomError) {
      const code = error.getErrorCode();
      const message = error.getErrorMessage();
      return res.status(code).send({
        error: {
          code,
          message,
        },
      });
    }
    return res.status(409).send();
  }
});
