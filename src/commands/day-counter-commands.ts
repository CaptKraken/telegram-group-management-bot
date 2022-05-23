import { Context } from "telegraf";
import { Message, Update } from "typegram";
import { errorHandler, getDayCountAndScheduleExpression } from "../utils/index";
import { COMMANDS } from "../utils/constants";
import {
  createGroup,
  deleteGroup,
  isAdmin,
  isSenderAdmin,
  removeAdmin,
  sendDisappearingMessage,
  setAdmin,
} from "../services";
import { restartCronJobs } from "../services/cron-jobs";
import { adminGuardCache, isGroup } from "../utils/guards";
export const setGroupCommand = async (ctx: Context<Update>) => {
  try {
    if (!isGroup(ctx)) {
      ctx.reply("setGroup command can only be use in groups.");
      return;
    }
    const chatId = Number(ctx.chat?.id);
    const senderId = Number(ctx.from?.id);

    const isAdmin = await isSenderAdmin(senderId);
    if (!isAdmin) return;

    // @ts-ignore
    const cleanedMessage = `${ctx.message?.text}`
      .replace(`/${COMMANDS.setGroup} `, "")
      .trim();

    const { dayCount, schedule } =
      getDayCountAndScheduleExpression(cleanedMessage);

    const createGroupPayload = {
      groupId: chatId,
      adminId: senderId,
      dayCount,
      schedule,
    };

    await createGroup(createGroupPayload);
    restartCronJobs();
    sendDisappearingMessage(
      ctx,
      `[BOT]: This group has been set up successfully.`
    );
  } catch (e) {
    errorHandler(ctx, e);
  }
};

export const removeGroupCommand = async (ctx: Context<Update>) => {
  try {
    if (!isGroup(ctx)) return;
    await deleteGroup(Number(ctx.chat?.id));
    restartCronJobs();
    sendDisappearingMessage(ctx, `[Success]: Group removed.`);
  } catch (error) {
    errorHandler(ctx, error);
  }
};

export const setAdminCommand = async (ctx: Context<Update>) => {
  try {
    // @ts-ignore
    const toBeAdminId = ctx.message?.reply_to_message?.from?.id;
    if (!toBeAdminId) return;

    const chatId = Number(ctx.chat?.id);
    const senderId = Number(ctx.from?.id);
    const isGlobalAdmin = await isSenderAdmin(senderId);
    const isGroupAdmin = isAdmin(chatId, senderId);
    if (!isGlobalAdmin && !isGroupAdmin) return;

    const isIdInvalid = isNaN(toBeAdminId);
    if (isIdInvalid) {
      throw new Error(`I couldn't get the user id.`);
    }
    await setAdmin(chatId, toBeAdminId);
    await sendDisappearingMessage(
      ctx,
      `[BOT]: ID ${toBeAdminId} added to the admin list.`
    );
  } catch (e) {
    errorHandler(ctx, e);
  }
};

export const removeAdminCommand = async (ctx: Context<Update>) => {
  try {
    adminGuardCache(ctx);
    // @ts-ignore
    const toBeRemovedId = Number(ctx.message.reply_to_message?.from?.id);
    const chatId = Number(ctx.chat?.id);
    const isIdInvalid = isNaN(toBeRemovedId);

    if (isIdInvalid) {
      throw new Error(`I couldn't get the user id.`);
    }
    await removeAdmin(chatId, toBeRemovedId);
    await sendDisappearingMessage(
      ctx,
      `[BOT]: ID ${toBeRemovedId} removed from the admin list.`
    );
  } catch (e) {
    errorHandler(ctx, e);
  }
};
