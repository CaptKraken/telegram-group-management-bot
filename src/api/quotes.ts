import express, { Request, Response } from "express";
import { addManyQuotes, fetchAllQuotes, removeQuote } from "../services";
import { isAdmin } from "./current-current-middleware";

export const quoteRouter = express.Router();

quoteRouter.get("/", isAdmin, async (req: Request, res: Response) => {
  const quotes = await fetchAllQuotes();
  res.json({
    data: quotes,
  });
});

quoteRouter.post("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const { quotes }: { quotes: { text: string; author?: string }[] } =
      req.body;
    await addManyQuotes(quotes);
    res.status(201).send();
  } catch (error) {
    // if (error instanceof MongoServerError) {
    //   const { code, keyValue } = error;
    //   res.status(409).send({
    //     error: {
    //       code,
    //       message:
    //         code === 11000
    //           ? `Duplicate quote: '${keyValue?.text}'`
    //           : error.message,
    //     },
    //   });
    // }
    res.status(409).send();
  }
});

quoteRouter.delete("/", isAdmin, async (req: Request, res: Response) => {
  const { text }: { text: string } = req.body;

  if (!text) {
    res
      .json({
        error: {
          code: 400,
          message: "Quote not found",
        },
      })
      .status(400);
    return;
  }

  try {
    await removeQuote(text);
    res.status(200).send();
  } catch (error) {
    res.status(409).send();
  }
});
