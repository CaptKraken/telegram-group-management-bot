import { Context } from "telegraf";
import { Message, Update } from "typegram";
import { errorHandler, getDayCountAndScheduleExpression } from "../utils/index";
import { COMMANDS } from "../utils/constants";
import {
  createGroup,
  isAdmin,
  removeAdmin,
  sendDisappearingMessage,
  setAdmin,
  setDayCount,
  setSchedule,
} from "../services/index";
import { restartCronJobs } from "../services/cron-jobs";
export const setGroupCommand = async (ctx: Context<Update>) => {
  try {
    const messageType = ctx.message?.chat.type;
    const isGroup = messageType === "group";
    if (!isGroup) {
      ctx.reply("setGroup command can only be use in groups.");
      return;
    }
    const groupId = ctx.message?.chat.id;
    // @ts-ignore
    const cleanedMessage = `${ctx.message?.text}`
      .replace(`/${COMMANDS.setGroup} `, "")
      .trim();
    const { dayCount, schedule } =
      getDayCountAndScheduleExpression(cleanedMessage);

    const createGroupPayload = {
      groupId: Number(ctx.chat?.id),
      adminId: Number(ctx.from?.id),
      dayCount,
      schedule,
    };

    await createGroup(createGroupPayload);
    await sendDisappearingMessage(
      ctx,
      `[BOT]: This group has been set up successfully.`
    );
  } catch (e) {
    errorHandler(ctx, e);
  }
};

const adminGuard = (ctx: Context<Update>) => {
  const groupId = Number(ctx.chat?.id);
  const senderId = Number(ctx.from?.id);
  const isSenderAdmin = isAdmin(groupId, senderId);

  if (!isSenderAdmin) {
    throw new Error(`Command is only available to admins.`);
  }
};

export const setCountCommand = async (ctx: Context<Update>) => {
  try {
    adminGuard(ctx);
    const count = Number(
      // @ts-ignore
      `${ctx.message?.text}`.replace(`/${COMMANDS.setCount} `, "").trim()
    );
    const isCountInvalid = isNaN(count);
    if (isCountInvalid) {
      throw new Error("Count is Invalid.");
    }
    const groupId = Number(ctx.chat?.id);
    console.log(count);

    await setDayCount(groupId, count);
    await sendDisappearingMessage(ctx, `[BOT]: Day count set to ${count}.`);
  } catch (e) {
    errorHandler(ctx, e);
  }
};

export const setAdminCommand = async (ctx: Context<Update>) => {
  try {
    adminGuard(ctx);
    // @ts-ignore
    const toBeAdminId = ctx.message?.reply_to_message?.from?.id;
    const chatId = Number(`${ctx.chat?.id}`);

    if (!toBeAdminId) return;

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
    adminGuard(ctx);
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

export const setScheduleCommand = async (ctx: Context<Update>) => {
  try {
    adminGuard(ctx);
    const chatId = Number(ctx.chat?.id);
    // @ts-ignore
    const cronExpression = ctx.message?.text.replace(
      `/${COMMANDS.setSchedule} `,
      ""
    );
    await setSchedule(chatId, cronExpression);
    await sendDisappearingMessage(
      ctx,
      `[BOT]: Schedule set to ${cronExpression}.`
    );
    await restartCronJobs();
  } catch (e) {
    errorHandler(ctx, e);
  }
};

//   } catch (e) {
//     errorHandler(ctx, e);
//   }
// };
