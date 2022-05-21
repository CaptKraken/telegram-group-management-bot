import { Context } from "telegraf";
import { Update } from "typegram";
import {
  addGlobalAdmin,
  getAdminList,
  isSenderAdmin,
  removeGlobalAdmin,
  sendDisappearingMessage,
} from "../services";
import { errorHandler } from "../utils";

export const sendAdminListCommand = async (ctx: Context<Update>) => {
  try {
    const isAdmin = await isSenderAdmin(Number(ctx.from?.id));
    isAdmin && ctx.reply(await getAdminList());
  } catch (error) {
    errorHandler(ctx, error);
  }
};

export const addGlobalAdminCommand = async (ctx: Context<Update>) => {
  try {
    // @ts-ignore
    const toBeAdmin = ctx.message?.reply_to_message?.from;
    if (!toBeAdmin) return;

    const isAdmin = await isSenderAdmin(Number(ctx.from?.id));
    if (!isAdmin) return;

    const firstName = toBeAdmin.first_name;
    const lastName = toBeAdmin.last_name;
    const username = toBeAdmin.username;

    const userId = toBeAdmin.id;
    const userName =
      firstName && lastName ? `${firstName} ${lastName}` : `${username}`;

    await addGlobalAdmin(userName, userId);
    await sendDisappearingMessage(
      ctx,
      `[Success]: "${userName}" is added to the database.`
    );
  } catch (error) {
    errorHandler(ctx, error);
  }
};

export const removeGlobalAdminCommand = async (ctx: Context<Update>) => {
  try {
    // @ts-ignore
    const toBeAdmin = ctx.message?.reply_to_message?.from;
    if (!toBeAdmin) return;

    const isAdmin = await isSenderAdmin(Number(ctx.from?.id));
    if (!isAdmin) return;

    const userId = toBeAdmin.id;

    await removeGlobalAdmin(userId);
    await sendDisappearingMessage(
      ctx,
      `[Success]: User removed from the database.`
    );
  } catch (error) {
    errorHandler(ctx, error);
  }
};
