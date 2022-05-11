import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";
import dotenv from "dotenv";
import { COMMANDS, setupWeightRegex } from "./utils";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import {
  removeAdminCommand,
  setAdminCommand,
  setCountCommand,
  setGroupCommand,
  setScheduleCommand,
  setupWeightCommand,
} from "./commands";
import { cronJobs, initCronJobs, restartCronJobs } from "./services";
import axios, { AxiosError } from "axios";
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

// Announce
bot.command(COMMANDS.addAdminAnnounce, async (ctx) => {
  const replying_id = ctx.message.reply_to_message?.from?.id;

  console.log("replying", replying_id);
});

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
  console.log(`************* INIT BOT *************`);
  await initCronJobs();
  console.log("PORT", process.env.PORT);

  console.log(`************ INIT  DONE ************`);
});
