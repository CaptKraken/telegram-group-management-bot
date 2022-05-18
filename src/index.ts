import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";
import axios from "axios";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { cancelKey, COMMANDS, setupWeightRegex } from "./utils";

import { findAllFolders, findOneFolder, initCronJobs } from "./services";
import {
  addGroupBroadcastCommand,
  createFolderCommand,
  deleteFolderCommand,
  removeAdminCommand,
  removeGroupBroadcastCommand,
  removeWeightCommand,
  renameFolderCommand,
  setAdminCommand,
  setCountCommand,
  setGroupCommand,
  setScheduleCommand,
  setupWeightCommand,
} from "./commands";
import {
  addGroupBroadcastAction,
  cancelAction,
  deleteFolderAction,
  goBackBroadcastAction,
  removeGroupBroadcastAction,
  showRemoveGroupBroadcastAction,
} from "./actions";

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
bot.command(COMMANDS.addGroupBroadcast, addGroupBroadcastCommand);
bot.action(/\badd-group-broadcast-action\b/g, addGroupBroadcastAction);
bot.command(COMMANDS.removeGroupBroadcast, removeGroupBroadcastCommand);
bot.action(
  /\bshow-remove-group-broadcast-action\b/g,
  showRemoveGroupBroadcastAction
);
bot.action(/\bremove-group-broadcast-action\b/g, removeGroupBroadcastAction);
bot.action(/\bgo-back-broadcast-action\b/g, goBackBroadcastAction);
bot.action(/\bcancel\b/g, cancelAction);

bot.command(COMMANDS.emit, async (ctx) => {
  const message = ctx.message.text
    .replace(`/${COMMANDS.emit} `, "")
    .replace(`/${COMMANDS.emit}\n`, "")
    .trim();

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
  folders.forEach(({ folder_name, groups }, i) => {
    if (groups.length < 1) {
      tempKeys.push({
        text: `${folder_name} (${groups.length})`,
        callback_data: `${COMMANDS.emit} -f${folder_name} -m${message}`,
      });
    }
    if (tempKeys.length === 2 || folders.length - 1 === i) {
      allKeys.push(tempKeys);
      tempKeys = [];
    }
  });
  if (allKeys.length > 0) {
    allKeys.push(cancelKey);
  }
  await ctx.reply(`Select folder:\n(Folders with 0 group are hidden)`, {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      inline_keyboard: allKeys,
    },
  });
});
bot.action(/\bemit\b/g, async (ctx) => {
  ctx.answerCbQuery();
  ctx.deleteMessage();

  // @ts-ignore
  const callbackData = ctx.callbackQuery.data;
  if (!callbackData) return;

  const parts = callbackData
    .replace(COMMANDS.emit, "")
    .split(" -")
    .map((part) => part);

  let folderName, message;

  parts.forEach((part) => {
    if (part.startsWith("f")) {
      folderName = part.slice(1);
    }
    if (part.startsWith("g")) {
      message = part.slice(1);
    }
  });

  if (!folderName || !message) {
    throw new Error("Error decoding data.");
  }

  const folder = await findOneFolder({ folder_name: folderName });

  if (!folder) {
    throw new Error("Folder not found.");
  }
  if (!folder.groups || folder.groups.length < 1) {
    throw new Error("Folder has 0 group.");
  }
});

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
