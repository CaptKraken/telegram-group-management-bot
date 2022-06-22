import express, { Request, Response } from "express";
import { MongoServerError } from "mongodb";
import { CustomError } from "../utils";
import { addManyQuotes, fetchAllQuotes, removeQuote } from "../services";
import { isAdmin } from "./current-current-middleware";

export const quoteRouter = express.Router();

quoteRouter.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const quotes = await fetchAllQuotes();
    return res.send({
      data: {
        quotes: quotes ?? [],
      },
    });
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
});

quoteRouter.post("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const { quotes }: { quotes: { text: string; author?: string }[] } =
      req.body;
    await addManyQuotes(quotes);
    return res.status(201).send();
  } catch (error) {
    if (error instanceof MongoServerError) {
      const { code, keyValue } = error;
      return res.status(409).send({
        error: {
          code,
          message:
            code === 11000
              ? `Duplicate quote: '${keyValue?.text}'`
              : error.message,
        },
      });
    }
    return res.status(409).send();
  }
});

quoteRouter.delete("/", isAdmin, async (req: Request, res: Response) => {
  const { text }: { text: string } = req.body;

  if (!text) {
    throw new CustomError("text not found in request body.");
  }

  try {
    await removeQuote(text);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).send({
        error: {
          code: error.statusCode,
          message: error.getErrorMessage(),
        },
      });
    }

    return res.status(409).send();
  }
});
