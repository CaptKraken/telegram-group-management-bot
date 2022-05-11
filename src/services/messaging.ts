import axios from "axios";
import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";
import dotenv from "dotenv";
dotenv.config();

const { BOT_TOKEN } = process.env;

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const sendDisappearingMessage = async (
  ctx: Context<Update>,
  message: string,
  seconds: number = 5
) => {
  const res = await ctx.reply(
    `${message}\nThis message will be automatically deleted in ${seconds} seconds.`
  );

  setTimeout(async () => {
    ctx.telegram.deleteMessage(Number(`${ctx.chat?.id}`), res.message_id);
  }, seconds * 1000);
};

/**
 * sends a message to the given group with the given message
 * @param {number} chat_id chat id
 * @param {string} message message to be sent
 */
export const sendMessage = async (
  chat_id: number,
  message: string
): Promise<any | undefined> => {
  if (!chat_id || !message) return;
  try {
    const res = await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id,
      text: message,
    });
    if (res.data.ok) {
      return res.data.result;
    }
  } catch (err) {
    throw new Error(
      `function: "sendMessage"\nchat_id: ${chat_id}\nmessage: ${message}\n${err}`
    );
  }
};
