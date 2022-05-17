import { deleteFolder, sendDisappearingMessage } from "../services";
import { Context } from "telegraf";
import { Update } from "typegram";
import { COMMANDS, errorHandler } from "../utils";

export const deleteFolderAction = async (ctx: Context<Update>) => {
  try {
    ctx.answerCbQuery();
    ctx.deleteMessage();
    // @ts-ignore
    const callbackData = ctx.callbackQuery.data;
    if (!callbackData) return;

    const folderName = callbackData
      .replaceAll(`${COMMANDS.deleteFolderAction}`, "")
      .trim();
    await deleteFolder(folderName);
    await sendDisappearingMessage(
      ctx,
      `[SUCCESS]: Folder "${folderName}" deleted successfully.`
    );
  } catch (err) {
    errorHandler(ctx, err);
  }
};
