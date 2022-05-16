import {
  setupWeight,
  SetupWeightDTO,
  sendDisappearingMessage,
  restartCronJobs,
} from "../services";
import { Context } from "telegraf";
import { Update } from "typegram";
import { decodeSetupWeightPayload, errorHandler } from "../utils";

export const setupWeightCommand = async (ctx: Context<Update>) => {
  try {
    const chat = await ctx.getChat();
    // @ts-ignore
    const groupName = chat.title;
    const groupId = chat.id;
    // @ts-ignore
    const message = ctx.message?.text.replace("/setupWeight ", "").trim();

    const senderId = Number(ctx.message?.from.id);
    const isAllowed = senderId === 762081278 || senderId === 79111226;

    if (!isAllowed) return;

    const payload: SetupWeightDTO = {
      group_id: groupId,
      group_name: groupName,
      ...decodeSetupWeightPayload(message),
    };

    await setupWeight(payload);
    sendDisappearingMessage(ctx, `[SUCCESS] - setup successful.`);
    await restartCronJobs();
  } catch (err) {
    errorHandler(ctx, err);
  }
};
