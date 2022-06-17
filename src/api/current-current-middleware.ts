import { NextFunction, Request, Response } from "express";
import { dbClient, isSenderAdmin } from "../services";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookies = req.cookies;
  const user_id = cookies["telegram-management-user-id"];

  if (!user_id) {
    res
      .json({
        error: {
          code: 401,
          message: "Unauthorized",
        },
      })
      .status(401);
    return;
  }
  await dbClient.connect();
  const isAdmin = await isSenderAdmin(Number(user_id));
  await dbClient.close();

  if (!isAdmin) {
    res
      .json({
        error: {
          code: 401,
          message: "Unauthorized",
        },
      })
      .status(401);
    return;
  }

  next();
};
