import {
  setupWeight,
  SetupWeightDTO,
  sendDisappearingMessage,
  restartCronJobs,
} from "../services";
import { Context } from "telegraf";
import { Update } from "typegram";
import { decodeSetupWeightPayload } from "../utils";

export const setupWeightCommand = async (ctx: Context<Update>) => {
  // @ts-ignore
  const message = ctx.message?.text.replace("/setupWeight ", "").trim();

  const payload = decodeSetupWeightPayload(message);

  const finalPayload: SetupWeightDTO = {
    // @ts-ignore
    group_id: ctx.chat.id,
    // @ts-ignore
    admin_id: ctx.from.id,
    ...payload,
  };

  await setupWeight(finalPayload);
  sendDisappearingMessage(ctx, `[SUCCESS] - setup successful.`);
  await restartCronJobs();
};
