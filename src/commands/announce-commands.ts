import { Context } from "telegraf";
import { Update } from "typegram";
import { isGroup } from "../utils/guards";
import {
  addAdminAnnouncement,
  addGroupAnnouncement,
  fetchAnnouncements,
  sendDisappearingMessage,
} from "../services";
import { cancelKey, COMMANDS, errorHandler } from "../utils";

export const addAdminAnnounceCommand = async (ctx: Context<Update>) => {
  try {
    // @ts-ignore
    const toBeAdminId = Number(ctx.message.reply_to_message?.from?.id);
    // @ts-ignore
    const firstName = ctx.message.reply_to_message?.from?.first_name;
    // @ts-ignore
    const lastName = ctx.message.reply_to_message?.from?.last_name;
    // @ts-ignore
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
};

export const removeAdminAnnounceCommand = async (ctx: Context<Update>) => {
  try {
    const data = await fetchAnnouncements();
    type Keyboard = {
      callback_data: string;
      text: string;
    };
    const allKeys: any[] = [];
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
    if (allKeys.length > 0) {
      allKeys.push(cancelKey);
    }
    await ctx.reply("Choose Admin:", {
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
};

export const addGroupAnnounceCommand = async (ctx: Context<Update>) => {
  try {
    if (!isGroup(ctx)) return;
    // @ts-ignore
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
};

export const removeGroupAnnounceCommand = async (ctx: Context<Update>) => {
  try {
    const data = await fetchAnnouncements();
    type Keyboard = {
      callback_data: string;
      text: string;
    };
    const allKeys: any[] = [];
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

    if (allKeys.length > 0) {
      allKeys.push(cancelKey);
    }

    await ctx.reply("Choose Group:", {
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
};
