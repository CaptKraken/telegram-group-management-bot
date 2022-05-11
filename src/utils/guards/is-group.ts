import { Context } from "telegraf";
import { Update } from "typegram";

const isGroup = (ctx: Context<Update>): boolean =>
  ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
export default isGroup;
