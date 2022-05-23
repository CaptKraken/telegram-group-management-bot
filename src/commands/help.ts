import { Context } from "telegraf";
import { Update } from "typegram";
import { COMMANDS, errorHandler } from "../utils";

export const sendCommands = async (ctx: Context<Update>) => {
  try {
    const commands = `/${COMMANDS.setGroup} -d 1 -s "0 5 * * *" — set/update day count group.\n/${COMMANDS.removeGroup} - remove day count.\n/${COMMANDS.setAdmin} {reply} - set admin for the particular group.\n/${COMMANDS.removeAdmin} {reply} - remove admin for the particular group.\n/setupWeight -d 1 -w 0.2 -s "0 5 * * *" - setup fish group.\n/${COMMANDS.removeWeight} - remove fish group.\n/${COMMANDS.createFolder} folder name - create a new folder.\n/${COMMANDS.renameFolder} -o old name -n new name - rename a folder.\n/${COMMANDS.deleteFolder} - delete a folder and its content.\n/${COMMANDS.addGroupBroadcast} - add current group to a folder.\n/${COMMANDS.removeGroupBroadcast} - remove current group from a folder.\n/${COMMANDS.emit} - mass send message to a folder group.\n/${COMMANDS.removeReader} reader name - remove reader from reading group.\n/${COMMANDS.readReport} - send report to the reading group.`;
    await ctx.reply(commands);
  } catch (error) {
    errorHandler(ctx, error);
  }
};
