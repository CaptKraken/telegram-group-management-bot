import {
  createFolder,
  findAllFolders,
  renameFolder,
  sendDisappearingMessage,
} from "../services";
import { Context } from "telegraf";
import { Update } from "typegram";
import { cancelKey, COMMANDS, errorHandler } from "../utils";
import { RenameFolderDTO } from "services/broadcast";

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

export const renameFolderCommand = async (ctx: Context<Update>) => {
  try {
    // @ts-ignore
    const message: string = ctx.message.text;
    const parts = message
      .replace(`/${COMMANDS.renameFolder}`, "")
      .trim()
      .split("-")
      .map((part) => part.trim());

    const payload: RenameFolderDTO = {
      folder_name: "",
      new_name: "",
    };

    parts.forEach((part) => {
      if (part.startsWith("o")) {
        payload.folder_name = part.replace("o", "").trim();
      }
      if (part.startsWith("n")) {
        payload.new_name = part.replace("n", "").trim();
      }
    });

    const isOldNameValid =
      payload.folder_name && payload.folder_name.length > 0;
    const isNewNameValid =
      payload.folder_name && payload.folder_name.length > 0;

    if (!isOldNameValid || !isNewNameValid) {
      throw new Error(
        `Old name or new name wasn't given.\ni.e. /renameFolder -o old name -n new name`
      );
    }

    await renameFolder(payload);
    await sendDisappearingMessage(
      ctx,
      `[Success]: Folder "${payload.folder_name}" has been succesfully renamed to "${payload.new_name}".`
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
        inline_keyboard: allKeys,
      },
    });
  } catch (error) {
    errorHandler(ctx, error);
  }
};
