import {
  createFolder,
  findAllFolders,
  sendDisappearingMessage,
} from "../services";
import { Context } from "telegraf";
import { Update } from "typegram";
import { cancelKey, COMMANDS, errorHandler } from "../utils";

export const createFolderCommand = async (ctx: Context<Update>) => {
  try {
    //@ts-ignore
    const message = ctx.message.text;
    const folderName = message.replace(`/${COMMANDS.createFolder}`, "").trim();
    await createFolder(folderName);
    await sendDisappearingMessage(
      ctx,
      `[Success]: Folder "${folderName}" created.`
    );
  } catch (error) {
    errorHandler(ctx, error);
  }
};

export const deleteFolderCommand = async (ctx: Context<Update>) => {
  try {
    const folders = await findAllFolders();
    if (folders.length < 1) {
      await ctx.reply("[Info]: No folder found.");
      return;
    }

    type Keyboard = {
      callback_data: string;
      text: string;
    };

    const allKeys: any[] = [];
    let tempKeys: Keyboard[] = [];
    folders.forEach(({ folder_name }, i) => {
      tempKeys.push({
        text: folder_name,
        callback_data: `${COMMANDS.deleteFolderAction} ${folder_name}`,
      });
      if (tempKeys.length === 2 || folders.length - 1 === i) {
        allKeys.push(tempKeys);
        tempKeys = [];
      }
    });
    if (allKeys.length > 0) {
      allKeys.push(cancelKey);
    }
    await ctx.reply(`Choose folder to delete:`, {
      reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: allKeys,
      },
    });
  } catch (error) {
    errorHandler(ctx, error);
  }
};
