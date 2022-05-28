import { addQuote, removeQuote, sendDisappearingMessage } from "../services";
import { Context } from "telegraf";
import { Update } from "typegram";
import { COMMANDS, errorHandler } from "../utils";

export const addQuoteCommand = async (ctx: Context<Update>) => {
  try {
    // @ts-ignore
    const message: string | undefined = ctx.message.text
      .replace(`/${COMMANDS.addQuote}`, "")
      .trim();
    if (!message) return;
    const parts = message.split("-").map((part) => part.trim());
    const quote = parts[0];
    const author = parts[1];
    await addQuote(quote, author);
    await sendDisappearingMessage(
      ctx,
      `[Success]: '${quote}' -${author ?? "unknown"} added.`
    );
  } catch (error) {
    errorHandler(ctx, error);
  }
};

export const removeQuoteCommand = async (ctx: Context<Update>) => {
  try {
    //@ts-ignore
    const message: string | undefined = ctx.message.text
      ?.replace(`/${COMMANDS.removeQuote}`, "")
      ?.trim();
    if (!message) return;
    await removeQuote(message);
    await sendDisappearingMessage(ctx, `[Success]: Quote removed.`);
  } catch (error) {
    errorHandler(ctx, error);
  }
};
