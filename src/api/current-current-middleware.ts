import { NextFunction, Request, Response } from "express";
import { dbClient, isSenderAdmin } from "../services";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookies = req.cookies;
  const user_id = cookies["telegram-management-user-id"];

  const responseUnauthorized = (message: string) => {
    return res.status(401).send({
      error: {
        code: 401,
        message,
      },
    });
  };

  if (!user_id) {
    return responseUnauthorized("unauthenticated");
  }
  await dbClient.connect();
  const isAdmin = await isSenderAdmin(Number(user_id));
  await dbClient.close();

  if (!isAdmin) {
    return responseUnauthorized("unauthorized");
  }

  next();
};
