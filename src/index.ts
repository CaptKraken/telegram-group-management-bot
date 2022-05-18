import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";
import axios from "axios";
import dotenv from "dotenv";
import {
  cancelKey,
  COMMANDS,
  errorHandler,
  goBackBroadcastKey,
  setupWeightRegex,
} from "./utils";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import {
  addAdminAnnounceCommand,
  addGroupAnnounceCommand,
  addGroupBroadcastCommand,
  createFolderCommand,
  deleteFolderCommand,
  emitAnnounceCommand,
  removeAdminAnnounceCommand,
  removeAdminCommand,
  removeGroupAnnounceCommand,
  removeGroupBroadcastCommand,
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
  addGroupBroadcastAction,
  cancelAnnounceAction,
  deleteFolderAction,
  goBackBroadcastAction,
  removeAdminAnnounceAction,
  removeGroupAnnounceAction,
  showRemoveGroupBroadcastAction,
} from "./actions";
import {
  addGroupBroadcast,
  BroadcastFolder,
  BroadcastGroup,
  createFolder,
  deleteFolder,
  findAllFolders,
  findOneFolder,
  removeGroupBroadcast,
  renameFolder,
  RenameFolderDTO,
} from "./services/broadcast";
import { ObjectId } from "mongodb";
import { isGroup } from "./utils/guards";
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

bot.action(/\bremove-group-broadcast-action\b/g, async (ctx) => {
  try {
    ctx.answerCbQuery();
    ctx.deleteMessage();

    // @ts-ignore
    const callbackData = ctx.callbackQuery.data;
    if (!callbackData) return;

    const parts = callbackData
      .replaceAll(`${COMMANDS.removeGroupBroadcastAction}`, "")
      .split(" -")
      .filter((part) => part);

    const payload = {
      folder_name: "",
      group_id: 0,
    };

    parts.forEach((part) => {
      if (part.startsWith("f")) {
        payload.folder_name = part.substring(1);
      }
      if (part.startsWith("g")) {
        payload.group_id = Number(part.substring(1));
      }
    });

    if (!payload.folder_name || !payload.group_id) {
      throw new Error(`Error decoding remove group broadcast action.`);
    }

    await removeGroupBroadcast(
      { folder_name: payload.folder_name },
      payload.group_id
    );
    await sendDisappearingMessage(
      ctx,
      `[Success]: Group removed from "${payload.folder_name}"`
    );
  } catch (error) {
    errorHandler(ctx, error);
  }
});

bot.action(/\bgo-back-broadcast-action\b/g, goBackBroadcastAction);

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
