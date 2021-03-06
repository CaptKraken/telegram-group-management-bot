import { Context } from "telegraf";
import { Update } from "typegram";
import { COMMANDS, errorHandler } from "../utils";

export const sendCommands = async (ctx: Context<Update>) => {
  try {
    const commands = `Available Commands:\n\n*** Day Count ***\n/${COMMANDS.setGroup} -d 1 -s "0 5 * * *" -m "whatever {day_count} you want." — set/update day count group.\n/${COMMANDS.removeGroup} — remove day count.\n\n*** Broadcast ***\n/${COMMANDS.createFolder} folder name — create a new folder.\n/${COMMANDS.renameFolder} -o old name -n new name — rename a folder.\n/${COMMANDS.deleteFolder} — delete a folder and its content.\n/${COMMANDS.addGroupBroadcast} — add current group to a folder.\n/${COMMANDS.removeGroupBroadcast} — remove current group from a folder.\n/${COMMANDS.emit} message here — mass send message to a folder group.\n\n*** Reading Group ***\n/${COMMANDS.removeReader} reader name — remove reader from reading group.\n/${COMMANDS.readReport} — send report to the reading group.\n\n*** Admins ***\n/${COMMANDS.admins} — send admin list.\n/${COMMANDS.addGlobalAdmin} {reply} — add user as global admin.\n/${COMMANDS.removeGlobalAdmin} {reply} — remove user from admin database.\n\n*** Quotes ***\n/${COMMANDS.addQuote} — add a new quote.\n/${COMMANDS.removeQuote} — remove a quote.`;
    await ctx.reply(commands);
  } catch (error) {
    errorHandler(ctx, error);
  }
};
