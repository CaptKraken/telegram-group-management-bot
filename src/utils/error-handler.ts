import { sendDisappearingMessage } from "../services";
import { Context } from "telegraf";
import { Update } from "typegram";

export const errorHandler = (ctx: Context<Update>, e: unknown): void => {
  if (typeof e === "string") {
    sendDisappearingMessage(ctx, `[ERROR]: ${e}`);
    return;
  } else if (e instanceof Error) {
    const message = e.message;
    if (message.includes("E11000")) {
      sendDisappearingMessage(
        ctx,
        `[ERROR]: This group already exists in the database.`
      );
      return;
    }
    if (message.includes(`INVALID SCHEDULE`)) {
      sendDisappearingMessage(
        ctx,
        `[ERROR]: Invalid schedule expression received.`
      );
      return;
    }
    sendDisappearingMessage(ctx, `[Error]: ${message}`);
  }
};
