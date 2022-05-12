import {
  removeAdminAnnouncement,
  removeGroupAnnouncement,
  sendDisappearingMessage,
} from "../services";
import { Context } from "telegraf";
import { Update } from "typegram";
import { COMMANDS, errorHandler } from "../utils";

export const removeAdminAnnounceAction = async (ctx: Context<Update>) => {
  try {
    ctx.answerCbQuery();
    ctx.deleteMessage();
    // @ts-ignore
    const callbackData = ctx.callbackQuery.data;
    if (!callbackData) return;
    const id = callbackData
      .replaceAll(`${COMMANDS.removeAdminAction}`, "")
      .trim();
    await removeAdminAnnouncement(Number(id));
    sendDisappearingMessage(ctx, `[SUCCESS]: user removed from admin list.`);
  } catch (err) {
    errorHandler(ctx, err);
  }
};

export const removeGroupAnnounceAction = async (ctx: Context<Update>) => {
  try {
    ctx.answerCbQuery();
    ctx.deleteMessage();
    // @ts-ignore
    const callbackData = ctx.callbackQuery.data;
    if (!callbackData) return;
    const id = callbackData
      .replaceAll(`${COMMANDS.removeGroupAction}`, "")
      .trim();
    await removeGroupAnnouncement(Number(id));
    sendDisappearingMessage(
      ctx,
      `[SUCCESS]: group removed from the group list.`
    );
  } catch (err) {
    errorHandler(ctx, err);
  }
};

export const cancelAnnounceAction = async (ctx: Context<Update>) => {
  ctx.answerCbQuery();
  ctx.deleteMessage();
};
