import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";
import axios from "axios";
import dotenv from "dotenv";
import { cancelKey, COMMANDS, errorHandler, setupWeightRegex } from "./utils";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import {
  addAdminAnnounceCommand,
  addGroupAnnounceCommand,
  createFolderCommand,
  deleteFolderCommand,
  emitAnnounceCommand,
  removeAdminAnnounceCommand,
  removeAdminCommand,
  removeGroupAnnounceCommand,
  removeWeightCommand,
  renameFolderCommand,
  setAdminCommand,
  setCountCommand,
  setGroupCommand,
  setScheduleCommand,
  setupWeightCommand,
} from "./commands";
import { initCronJobs, sendDisappearingMessage } from "./services";
import {
  cancelAnnounceAction,
  deleteFolderAction,
  removeAdminAnnounceAction,
  removeGroupAnnounceAction,
} from "./actions";
import {
  addGroupBroadcast,
  createFolder,
  deleteFolder,
  findAllFolders,
  renameFolder,
  RenameFolderDTO,
} from "./services/broadcast";
import { ObjectId } from "mongodb";
import { isGroup } from "utils/guards";
dotenv.config();

const { BOT_TOKEN, SERVER_URL } = process.env;

const bot: Telegraf<Context<Update>> = new Telegraf(BOT_TOKEN as string);
const expressApp = express();
expressApp.use(bodyParser.json());
export const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const URI = `/webhook/${BOT_TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on("sticker", (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));

// Count
bot.command(COMMANDS.setGroup, setGroupCommand);
bot.command(COMMANDS.setCount, setCountCommand);
bot.command(COMMANDS.setAdmin, setAdminCommand);
bot.command(COMMANDS.removeAdmin, removeAdminCommand);
bot.command(COMMANDS.setSchedule, setScheduleCommand);

// Weight
bot.hears(setupWeightRegex, setupWeightCommand);
bot.command(COMMANDS.removeWeight, removeWeightCommand);

// Broadcast
bot.command(COMMANDS.createFolder, createFolderCommand);
bot.command(COMMANDS.renameFolder, renameFolderCommand);
bot.command(COMMANDS.deleteFolder, deleteFolderCommand);
bot.action(/\bdelete-folder-action\b/g, deleteFolderAction);
bot.command(COMMANDS.addGroupBroadcast, async (ctx) => {
  try {
    const folders = await findAllFolders();
    if (folders.length < 1) {
      await ctx.reply("[Info]: No folders found.");
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
        callback_data: `${COMMANDS.addGroupBroadcastAction} ${folder_name}`,
      });
      if (tempKeys.length === 2 || folders.length - 1 === i) {
        allKeys.push(tempKeys);
        tempKeys = [];
      }
    });
    if (allKeys.length > 0) {
      allKeys.push(cancelKey);
    }
    await ctx.reply(`Add group to:`, {
      reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: true,
        inline_keyboard: allKeys,
      },
    });
  } catch (error) {
    errorHandler(ctx, error);
  }
});
bot.action(/\badd-group-broadcast-action\b/g, async (ctx) => {
  try {
    ctx.answerCbQuery();
    ctx.deleteMessage();

    if (!isGroup(ctx)) {
      throw new Error(`Only available for group.`);
    }

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
});

// Announce
bot.command(COMMANDS.emit, emitAnnounceCommand);
bot.command(COMMANDS.addAdminAnnounce, addAdminAnnounceCommand);
bot.command(COMMANDS.removeAdminAnnounce, removeAdminAnnounceCommand);
bot.action(/\bremove-admin-action\b -?[1-9]{0,}/g, removeAdminAnnounceAction);
bot.command(COMMANDS.addGroupAnnounce, addGroupAnnounceCommand);
bot.command(COMMANDS.removeGroupAnnounce, removeGroupAnnounceCommand);
bot.action(/\bremove-group-action\b -?[1-9]{0,}/g, removeGroupAnnounceAction);
bot.action(/\bcancel\b/g, cancelAnnounceAction);

//#region STARTING THE SERVER
setInterval(() => {
  try {
    axios.get(`${process.env.SERVER_URL}`);
  } catch (e) {
    // ts-ignore
    console.log("[INTERVAL ERROR]:", `Error fetching the thing.`);
  }
}, 600000); // every 10 minutes

bot.telegram.setWebhook(`${SERVER_URL}/bot${BOT_TOKEN}`);
expressApp.use(bot.webhookCallback(`/bot${BOT_TOKEN}`));

expressApp.get("/", (req: Request, res: Response) => {
  res.json({ alive: true });
});

expressApp.listen(process.env.PORT || 3000, async () => {
  console.log(`[INFO]: App running on port ${process.env.PORT}`);
  console.log(`************* INIT BOT *************`);
  await initCronJobs();
  console.log(`************ INIT  DONE ************`);
});

//#endregion
