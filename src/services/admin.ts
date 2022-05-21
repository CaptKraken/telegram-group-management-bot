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
