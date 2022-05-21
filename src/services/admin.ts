import { adminCollection, dbClient } from "./db-client";

export const findAllAdmins = async () => {
  try {
    await dbClient.connect();
    const admins = await adminCollection.find().toArray();
    await dbClient.close();
    return admins;
  } catch (err) {
    throw new Error(`${err}`);
  }
};

export const isSenderAdmin = async (userId: number) => {
  try {
    const admins = await findAllAdmins();
    let isAdmin = false;
    admins.forEach((admin) => {
      if (admin.admin_id === userId) {
        isAdmin = true;
      }
    });
    return isAdmin;
  } catch (error) {
    throw new Error(`${error}`);
  }
};
export const sendAdminList = async () => {
  try {
    const admins = await findAllAdmins();
    if (!admins || admins.length <= 0) return;
    let message = "ADMINS:";
    type AdminSchema = {
      admin_id: number;
      admin_name: string;
    };
    const sortedAdmins = admins.sort((a, b) => {
      if (a.admin_name > b.admin_name) return -1;
      if (a.admin_name < b.admin_name) return 1;
      return 0;
    });

    console.log(sortedAdmins);

    // Object.keys(sortedAdmins).forEach((key, i) => {
    //   message += `\n${(i + 1).toString().padStart(2, "0")} - ${key}: ${
    //     admins[key]
    //   }`;
    // });
    // await sendMessage(chatId, message);
  } catch (err) {
    throw new Error(`function: sendAdminList\nerror: ${err}`);
  }
};
