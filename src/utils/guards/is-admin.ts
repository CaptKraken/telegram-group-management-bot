import { isAdmin } from "../../services";
import { Context } from "telegraf";
import { Update } from "typegram";

const adminGuardCache = (ctx: Context<Update>): void => {
  const groupId = Number(ctx.chat?.id);
  const senderId = Number(ctx.from?.id);
  const isSenderAdmin = isAdmin(groupId, senderId);

  if (!isSenderAdmin) {
    throw new Error(`Command is only available to admins.`);
  }
};

export default adminGuardCache;
