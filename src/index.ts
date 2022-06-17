import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";
import axios from "axios";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { COMMANDS, setupWeightRegex } from "./utils";

import { initCronJobs } from "./services";
import {
  addGlobalAdminCommand,
  addGroupBroadcastCommand,
  addQuoteCommand,
  createFolderCommand,
  deleteFolderCommand,
  emitBroadcastCommand,
  readReportCommand,
  removeAdminCommand,
  removeGlobalAdminCommand,
  removeGroupBroadcastCommand,
  removeGroupCommand,
  removeQuoteCommand,
  removeReaderCommand,
  removeWeightCommand,
  renameFolderCommand,
  sendAdminListCommand,
  sendCommands,
  setAdminCommand,
  setGroupCommand,
  setupWeightCommand,
  updateReadCountCommand,
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
import { adminRouter, quoteRouter } from "./api";
dotenv.config();
const { BOT_TOKEN, SERVER_URL } = process.env;

const bot: Telegraf<Context<Update>> = new Telegraf(BOT_TOKEN as string);
const expressApp = express();
expressApp.use(bodyParser.json());
export const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

bot.start(sendCommands);
bot.help(sendCommands);
bot.command("/test", (ctx) => {
  console.log(`**888**\n**888**\n`, ctx);
});

bot.on("edited_message", (ctx) => {
  console.log(`**888**\n**888**\n`, ctx);
});

// #region Count
bot.command(COMMANDS.setGroup, setGroupCommand);
bot.command(COMMANDS.removeGroup, removeGroupCommand);
bot.command(COMMANDS.setAdmin, setAdminCommand);
bot.command(COMMANDS.removeAdmin, removeAdminCommand);
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
bot.hears(/\#\d{1,}/g, updateReadCountCommand);
bot.command(COMMANDS.removeReader, removeReaderCommand);
bot.command(COMMANDS.readReport, readReportCommand);
// #endregion

// #region Admins
bot.command(COMMANDS.admins, sendAdminListCommand);
bot.command(COMMANDS.addGlobalAdmin, addGlobalAdminCommand);
bot.command(COMMANDS.removeGlobalAdmin, removeGlobalAdminCommand);
// #endregion

//#region Quote
bot.command(COMMANDS.addQuote, addQuoteCommand);
bot.command(COMMANDS.removeQuote, removeQuoteCommand);
//#endregion

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

import cookieParser from "cookie-parser";
expressApp.use(cookieParser());
expressApp.use("/admins", adminRouter);
expressApp.use("/quotes", quoteRouter);
expressApp.get("/", (req: Request, res: Response) => {
  res.json({ alive: true, uptime: process.uptime() });
});

expressApp.listen(process.env.PORT || 3000, async () => {
  console.log(`[INFO]: App running on port ${process.env.PORT || 3000}`);
  console.log(`************* INIT BOT *************`);
  await initCronJobs();
  console.log(`************ INIT  DONE ************`);
});

//#endregion
