import express, { Request, Response } from "express";
import { findReaders, removeReader, sendReport } from "../services";
import { isAdmin } from "./current-current-middleware";
export const readCounterRouter = express.Router();

readCounterRouter.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const collection = await findReaders();
    return res.send({
      data: {
        readers: collection ?? [],
      },
    });
  } catch (error) {
    return res.status(409).send();
  }
});
readCounterRouter.get(
  "/report",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      await sendReport();
      return res.send();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(409).send({
          error: {
            code: 409,
            name: error.name,
            message: error.message,
          },
        });
      }
      return res.status(409).send();
    }
  }
);
readCounterRouter.delete(
  "/remove/:readerName",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const { readerName } = req.params;
      await removeReader(readerName);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(409).send({
          error: {
            code: 409,
            name: error.name,
            message: error.message,
          },
        });
      }
      return res.status(409).send();
    }
  }
);
