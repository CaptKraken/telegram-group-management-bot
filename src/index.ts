import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";
import dotenv from "dotenv";
import { COMMANDS, setupWeightRegex } from "./utils";
import {
  removeAdminCommand,
  setAdminCommand,
  setCountCommand,
  setGroupCommand,
  setScheduleCommand,
  setupWeightCommand,
} from "./commands";
import { cronJobs, initCronJobs, restartCronJobs } from "./services";
import axios from "axios";
dotenv.config();

const { BOT_TOKEN, SERVER_URL } = process.env;

const bot: Telegraf<Context<Update>> = new Telegraf(BOT_TOKEN as string);

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
  const replying_id = ctx.message.reply_to_message?.message_id;

  console.log("replying", replying_id);
});

const initBot = async () => {
  console.log(`************* INIT BOT *************`);
  // bot.launch();
  bot.launch({
    webhook: {
      domain: SERVER_URL,
      port: Number(process.env.PORT),
      cb: (f) => console.log(f),
    },
  });
  console.log(`[INFO]: Bot started.`);
  await initCronJobs();
  console.log(`************ INIT  DONE ************`);
};

initBot();
// keeps the heroku app alive
setInterval(function () {
  axios
    .get(`${process.env.SERVER_URL}`)
    .catch((e) => console.log("[INTERVAL ERROR]:", e.name));
}, 600000); // every 10 minutes
