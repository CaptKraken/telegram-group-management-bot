import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";
import axios from "axios";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { COMMANDS, errorHandler, setupWeightRegex } from "./utils";

import { initCronJobs, isSenderAdmin } from "./services";
import {
  addGroupBroadcastCommand,
  createFolderCommand,
  deleteFolderCommand,
  emitBroadcastCommand,
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
  emitBroadcastAction,
  goBackBroadcastAction,
  removeGroupBroadcastAction,
  showRemoveGroupBroadcastAction,
} from "./actions";
import { removeReader, saveReadCount } from "./services/read-counter";
import {
  convertKhmerToArabicNumerals,
  isNumber,
} from "./utils/read-count-utils";
import { getAdminList } from "./services/admin";

dotenv.config();
const { BOT_TOKEN, SERVER_URL } = process.env;

const bot: Telegraf<Context<Update>> = new Telegraf(BOT_TOKEN as string);
const expressApp = express();
expressApp.use(bodyParser.json());
export const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on("sticker", (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));

// #region Count
bot.command(COMMANDS.setGroup, setGroupCommand);
bot.command(COMMANDS.setCount, setCountCommand);
bot.command(COMMANDS.setAdmin, setAdminCommand);
bot.command(COMMANDS.removeAdmin, removeAdminCommand);
bot.command(COMMANDS.setSchedule, setScheduleCommand);
// #endregion

// #region Weight
bot.hears(setupWeightRegex, setupWeightCommand);
bot.command(COMMANDS.removeWeight, removeWeightCommand);
// #endregion

// #region Broadcast
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

bot.command(COMMANDS.emit, emitBroadcastCommand);
bot.action(/\bemit\b/g, emitBroadcastAction);

// bot.on("forward_date", async (ctx) => {
//   console.log("FORWARD DATE");
//   console.log(ctx.message);
// });
// #endregion

// #region Read Count

// TODO: CHECK FOR GROUP ID
bot.hears(/\#\d{1,}/g, async (ctx) => {
  try {
    const message = ctx.message.text;

    const isAdmin = await isSenderAdmin(ctx.from.id);
    // const isReaderGroup = ctx.chat.id === -12321;
    const isStartsWithHashtag = message.startsWith("#");
    // const isValid = isAdmin || (isReaderGroup && isStartsWithHashtag);
    //
    if (!isStartsWithHashtag) return;

    const parts = message
      .replace("\n", " ")
      .split(" ")
      .filter((part) => part);

    const count = convertKhmerToArabicNumerals(parts[0].replace("#", ""));
    const user = parts[1];
    const messageId = ctx.message.message_id;
    const hasEnoughData = isNumber(count.toString()) && user && messageId;

    if (hasEnoughData) {
      await saveReadCount(user, count, messageId);
    }
  } catch (error) {
    errorHandler(ctx, error);
  }
});

bot.command("removeReader", async (ctx) => {
  try {
    const message = ctx.message.text;
    const readerName = message.replace("/removeReader", "").trim();

    if (!readerName) {
      throw new Error(`Reader's name not found.\ni.e. /removeReader សុង`);
    }

    const isAdmin = await isSenderAdmin(ctx.from.id);

    if (isAdmin) {
      await removeReader(readerName);
    }
  } catch (error) {
    errorHandler(ctx, error);
  }
});

bot.command("admins", async (ctx) => {
  try {
    const isAdmin = await isSenderAdmin(ctx.from.id);
    isAdmin && ctx.reply(await getAdminList());
  } catch (error) {
    errorHandler(ctx, error);
  }
});

bot.command("test", async (ctx) => {
  console.log("test");
});
// #endregion

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

expressApp.post(`/bot${BOT_TOKEN}`, (req: Request, res: Response) => {
  console.log("hey");
  res.send();
});

expressApp.listen(process.env.PORT || 3000, async () => {
  console.log(`[INFO]: App running on port ${process.env.PORT}`);
  console.log(`************* INIT BOT *************`);
  await initCronJobs();
  console.log(`************ INIT  DONE ************`);
});

//#endregion
