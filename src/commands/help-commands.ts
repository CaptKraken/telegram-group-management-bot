import { Context } from "telegraf";
import { Update } from "typegram";
import { COMMANDS, errorHandler } from "../utils";

export const sendCommands = async (ctx: Context<Update>) => {
  try {
    const commands = `Available Commands:\n\n*** Day Count ***\n/${COMMANDS.setGroup} -d 1 -s "0 5 * * *" — set/update day count group.\n/${COMMANDS.removeGroup} — remove day count.\n/${COMMANDS.setAdmin} {reply} — set admin for the particular group.\n/${COMMANDS.removeAdmin} {reply} — remove admin for the particular group.\n\n*** Fish Group ***\n/setupWeight -d 1 -w 0.2 -s "0 5 * * *" — setup fish group.\n/${COMMANDS.removeWeight} — remove fish group.\n\n*** Broadcast ***\n/${COMMANDS.createFolder} folder name — create a new folder.\n/${COMMANDS.renameFolder} -o old name -n new name — rename a folder.\n/${COMMANDS.deleteFolder} — delete a folder and its content.\n/${COMMANDS.addGroupBroadcast} — add current group to a folder.\n/${COMMANDS.removeGroupBroadcast} — remove current group from a folder.\n/${COMMANDS.emit} — mass send message to a folder group.\n\n*** Reading Group ***\n/${COMMANDS.removeReader} reader name — remove reader from reading group.\n/${COMMANDS.readReport} — send report to the reading group.\n\n*** Admins ***\n/${COMMANDS.admins} — send admin list.\n/${COMMANDS.addGlobalAdmin} {reply} — add user as global admin.\n/${COMMANDS.removeGlobalAdmin} {reply} — remove user from admin database.`;
    await ctx.reply(commands);
  } catch (error) {
    errorHandler(ctx, error);
  }
};
