import { Context } from "telegraf";
import { Update } from "typegram";
import {
  COMMANDS,
  convertKhmerToArabicNumerals,
  errorHandler,
  isNumber,
} from "../utils";
import {
  isSenderAdmin,
  removeReader,
  saveReadCount,
  sendDisappearingMessage,
  sendReport,
} from "../services";

export const updateReadCountCommand = async (ctx: Context<Update>) => {
  try {
    const isAdmin = await isSenderAdmin(Number(ctx.from?.id));
    // @ts-ignore
    const message = ctx.message.text;

    const isReaderGroup = ctx.chat?.id === -643478967;
    const isStartsWithHashtag = message.startsWith("#");
    const isValid = isAdmin || (isReaderGroup && isStartsWithHashtag);

    if (!isValid) return;

    const parts: string[] = message
      .replace("\n", " ")
      .split(" ")
      .filter((part: string) => part);

    const count = convertKhmerToArabicNumerals(parts[0].replace("#", ""));
    const user = parts[1];
    const messageId = ctx.message?.message_id;
    const hasEnoughData = isNumber(count.toString()) && user && messageId;

    if (hasEnoughData) {
      await saveReadCount(user, count, messageId);
    }
  } catch (error) {
    errorHandler(ctx, error);
  }
};

export const removeReaderCommand = async (ctx: Context<Update>) => {
  try {
    // @ts-ignore
    const message = ctx.message.text;
    const readerName = message.replace(`/${COMMANDS.removeReader}`, "").trim();

    if (!readerName) {
      throw new Error(
        `Reader's name not found.\ni.e. /${COMMANDS.removeReader} សុង`
      );
    }

    const isAdmin = await isSenderAdmin(Number(ctx.from?.id));

    if (isAdmin) {
      await removeReader(readerName);
      sendDisappearingMessage(
        ctx,
        `[Success]: "${readerName}" removed from database.`
      );
    }
  } catch (error) {
    errorHandler(ctx, error);
  }
};

export const readReportCommand = async (ctx: Context<Update>) => {
  try {
    const isAdmin = await isSenderAdmin(Number(ctx.from?.id));

    if (isAdmin) {
      await sendReport();
    }
  } catch (error) {
    errorHandler(ctx, error);
  }
};
