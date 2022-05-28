export const COMMANDS = {
  setGroup: "setGroup",
  removeGroup: "removeGroup",
  setCount: "setCount",
  setSchedule: "setSchedule",
  setAdmin: "setAdmin",
  removeAdmin: "removeAdmin",
  addAdminAnnounce: "addAdminAnnounce",
  addGroupAnnounce: "addGroupAnnounce",
  removeAdminAnnounce: "removeAdminAnnounce",
  removeGroupAnnounce: "removeGroupAnnounce",
  emit: "emit",
  removeAdminAction: "remove-admin-action",
  removeGroupAction: "remove-group-action",
  removeWeight: "removeWeight",
  createFolder: "createFolder",
  renameFolder: "renameFolder",
  deleteFolder: "deleteFolder",
  renameFolderAction: "rename-folder-action",
  deleteFolderAction: "delete-folder-action",
  addGroupBroadcast: "addGroupBroadcast",
  addGroupBroadcastAction: "add-group-broadcast-action",
  removeGroupBroadcast: "removeGroupBroadcast",
  removeGroupBroadcastAction: "remove-group-broadcast-action",
  showRemoveGroupBroadcastAction: "show-remove-group-broadcast-action",
  goBackBroadcastAction: "go-back-broadcast-action",
  admins: "admins",
  addGlobalAdmin: "addGlobalAdmin",
  removeGlobalAdmin: "removeGlobalAdmin",
  removeReader: "removeReader",
  readReport: "readReport",
  addQuote: "addQuote",
  removeQuote: "removeQuote",
};

export const everydayAt5AM = "0 0 5 * * *";

// https://stackoverflow.com/a/63729682/17758690
export const regexCronExpression =
  "^((((d+,)+d+|(d+(/|-|#)d+)|d+L?|*(/d+)?|L(-d+)?|?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$|(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (d+(ns|us|µs|ms|s|m|h))+)";
export const setupWeightRegex = /\/setupWeight\s?(-d|-s|-i|-w)?/g;

export const cancelKey = [
  {
    text: "Cancel",
    callback_data: "cancel",
  },
];
export const goBackBroadcastKey = [
  { text: "Go Back", callback_data: COMMANDS.goBackBroadcastAction },
];
