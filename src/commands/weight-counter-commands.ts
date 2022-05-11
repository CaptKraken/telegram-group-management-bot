import {
  setupWeight,
  SetupWeightDTO,
  sendDisappearingMessage,
  restartCronJobs,
} from "../services";
import { Context } from "telegraf";
import { Update } from "typegram";
import { decodeSetupWeightPayload, errorHandler } from "../utils";
import { isGroup } from "../utils/guards";

export const setupWeightCommand = async (ctx: Context<Update>) => {
  try {
    // @ts-ignore
    const message = ctx.message?.text.replace("/setupWeight ", "").trim();

    const senderId = Number(ctx.message?.from.id);
    const isAllowed = senderId === 762081278 || senderId === 799230945;
    console.log(senderId);

    if (!isAllowed) return;

    const payload: SetupWeightDTO = decodeSetupWeightPayload(message);

    await setupWeight(payload);
    sendDisappearingMessage(ctx, `[SUCCESS] - setup successful.`);
    await restartCronJobs();
  } catch (err) {
    errorHandler(ctx, err);
  }
};
