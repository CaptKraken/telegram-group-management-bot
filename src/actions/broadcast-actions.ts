import { removeGroupBroadcastCommand } from "../commands";
import { Context } from "telegraf";
import { Update } from "typegram";
import {
  deleteFolder,
  sendDisappearingMessage,
  BroadcastGroup,
  findOneFolder,
  addGroupBroadcast,
} from "../services";
import {
  cancelKey,
  COMMANDS,
  errorHandler,
  goBackBroadcastKey,
} from "../utils";

export const addGroupBroadcastAction = async (ctx: Context<Update>) => {
  try {
    ctx.answerCbQuery();
    ctx.deleteMessage();

    // @ts-ignore
    const callbackData = ctx.callbackQuery.data;
    if (!callbackData) return;

    const folderName = callbackData
      .replaceAll(`${COMMANDS.addGroupBroadcastAction}`, "")
      .trim();

    if (!folderName) {
      throw new Error(`Folder not found.`);
    }
    const chat = await ctx.getChat();
    // @ts-ignore
    await addGroupBroadcast({ folder_name: folderName }, chat.id, chat.title);

    await sendDisappearingMessage(
      ctx,
      // @ts-ignore
      `[SUCCESS]: Group "${chat.title}" was successfully added to "${folderName}"`
    );
  } catch (err) {
    errorHandler(ctx, err);
  }
};

export const deleteFolderAction = async (ctx: Context<Update>) => {
  try {
    ctx.answerCbQuery();
    ctx.deleteMessage();
    // @ts-ignore
    const callbackData = ctx.callbackQuery.data;
    if (!callbackData) return;

    const folderName = callbackData
      .replaceAll(`${COMMANDS.deleteFolderAction}`, "")
      .trim();
    await deleteFolder(folderName);
    await sendDisappearingMessage(
      ctx,
      `[SUCCESS]: Folder "${folderName}" was deleted successfully.`
    );
  } catch (err) {
    errorHandler(ctx, err);
  }
};

export const showRemoveGroupBroadcastAction = async (ctx: Context<Update>) => {
  try {
    ctx.answerCbQuery();
    ctx.deleteMessage();

    // @ts-ignore
    const callbackData = ctx.callbackQuery.data;
    if (!callbackData) return;

    const folderName = callbackData
      .replaceAll(`${COMMANDS.removeGroupBroadcastAction}`, "")
      .trim();

    const folderData = await findOneFolder({ folder_name: `${folderName}` });

    if (!folderName || !folderData) {
      throw new Error(`Folder not found.`);
    }

    const groups: BroadcastGroup[] = folderData.groups;

    type Keyboard = {
      callback_data: string;
      text: string;
    };

    const allKeys: any[] = [];
    let tempKeys: Keyboard[] = [];
    groups.forEach(({ group_id, group_name }, i) => {
      tempKeys.push({
        text: group_name,
        callback_data: `${COMMANDS.removeGroupBroadcastAction} -f${folderName} -g${group_id}`,
      });
      if (tempKeys.length === 2 || groups.length - 1 === i) {
        allKeys.push(tempKeys);
        tempKeys = [];
      }
    });
    if (allKeys.length > 0) {
      allKeys.push(goBackBroadcastKey);
      allKeys.push(cancelKey);
    }
    await ctx.reply(`Select group:`, {
      reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: true,
        inline_keyboard: allKeys,
      },
    });
  } catch (err) {
    errorHandler(ctx, err);
  }
};

export const goBackBroadcastAction = async (ctx: Context<Update>) => {
  await ctx.answerCbQuery();
  await ctx.deleteMessage();
  await removeGroupBroadcastCommand(ctx);
};
