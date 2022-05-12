import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";
import dotenv from "dotenv";
import { COMMANDS, errorHandler, setupWeightRegex } from "./utils";
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
import {
  addAdminAnnouncement,
  addGroupAnnouncement,
  cronJobs,
  fetchAnnouncements,
  initCronJobs,
  removeAdminAnnouncement,
  removeGroupAnnouncement,
  restartCronJobs,
  sendDisappearingMessage,
} from "./services";
import axios, { AxiosError } from "axios";
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

// Announce
bot.command(COMMANDS.addAdminAnnounce, async (ctx) => {
  try {
    const toBeAdminId = Number(ctx.message.reply_to_message?.from?.id);
    const firstName = ctx.message.reply_to_message?.from?.first_name;
    const lastName = ctx.message.reply_to_message?.from?.last_name;
    const userName = ctx.message.reply_to_message?.from?.username;
    const toBeAdminName = `${firstName ?? userName} ${lastName ?? ""}`;

    if (!toBeAdminId || !toBeAdminName) return;

    await addAdminAnnouncement(toBeAdminId, toBeAdminName);
    await sendDisappearingMessage(
      ctx,
      `[SUCCESS]: ${toBeAdminName} added to admin list.`
    );
  } catch (err) {
    errorHandler(ctx, err);
  }
});
bot.command(COMMANDS.removeAdminAnnounce, async (ctx) => {
  try {
    // ctx.callbackQuery()
    const data = await fetchAnnouncements();
    type Keyboard = {
      callback_data: string;
      text: string;
    };
    const allKeys: any = [];
    let tempKeys: Keyboard[] = [];
    data.admins.forEach(({ admin_id, admin_name }, i) => {
      tempKeys.push({
        text: admin_name,
        callback_data: `${COMMANDS.removeAdminAction} ${admin_id}`,
      });
      if (tempKeys.length === 2 || data.admins.length - 1 === i) {
        allKeys.push(tempKeys);
        tempKeys = [];
      }
    });

    await ctx.reply("Choose:", {
      reply_markup: {
        one_time_keyboard: true,
        resize_keyboard: true,
        force_reply: true,
        inline_keyboard: allKeys,
      },
    });
  } catch (err) {
    errorHandler(ctx, err);
  }
});
bot.action(/\bremove-admin-action\b -?[1-9]{0,}/g, async (ctx) => {
  try {
    ctx.deleteMessage();
    const callbackData = ctx.callbackQuery.data;
    if (!callbackData) return;
    console.log(ctx.callbackQuery);
    const id = callbackData
      .replaceAll(`${COMMANDS.removeAdminAction}`, "")
      .trim();
    await removeAdminAnnouncement(Number(id));
    sendDisappearingMessage(ctx, `[SUCCESS]: user removed from admin list.`);
  } catch (err) {
    errorHandler(ctx, err);
  }
});

bot.command(COMMANDS.addGroupAnnounce, async (ctx) => {
  try {
    if (!isGroup(ctx)) return;
    const groupId = ctx.chat.id;
    const chat = await ctx.getChat();
    // @ts-ignore
    const groupName = chat.title;
    if (!groupId) return;
    await addGroupAnnouncement(groupId, groupName || "UNNAMED GROUP");
    sendDisappearingMessage(ctx, `[SUCCESS]: Group added to the database.`);
  } catch (error) {
    errorHandler(ctx, error);
  }
});

bot.command(COMMANDS.removeGroupAnnounce, async (ctx) => {
  try {
    const data = await fetchAnnouncements();
    type Keyboard = {
      callback_data: string;
      text: string;
    };
    const allKeys: any = [];
    let tempKeys: Keyboard[] = [];
    data.groups.forEach(({ group_id, group_name }, i) => {
      tempKeys.push({
        text: group_name,
        callback_data: `${COMMANDS.removeGroupAction} ${group_id}`,
      });
      if (tempKeys.length === 2 || data.groups.length - 1 === i) {
        allKeys.push(tempKeys);
        tempKeys = [];
      }
    });

    await ctx.reply("Choose group:", {
      reply_markup: {
        one_time_keyboard: true,
        resize_keyboard: true,
        force_reply: true,
        inline_keyboard: allKeys,
      },
    });
  } catch (err) {
    errorHandler(ctx, err);
  }
});

bot.action(/\bremove-group-action\b -?[1-9]{0,}/g, async (ctx) => {
  try {
    ctx.deleteMessage();
    const callbackData = ctx.callbackQuery.data;
    if (!callbackData) return;
    const id = callbackData
      .replaceAll(`${COMMANDS.removeGroupAction}`, "")
      .trim();
    await removeGroupAnnouncement(Number(id));
    sendDisappearingMessage(
      ctx,
      `[SUCCESS]: group removed from the group list.`
    );
  } catch (err) {
    errorHandler(ctx, err);
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
  console.log(`************* INIT BOT *************`);
  await initCronJobs();
  console.log("PORT", process.env.PORT);

  console.log(`************ INIT  DONE ************`);
});

//#endregion
