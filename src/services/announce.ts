import { ObjectId } from "mongodb";
import {
  announcementCollection,
  announcementDocId,
  AnnouncementSchema,
  dbClient,
} from "./db-client";

//#region ANNOUNCEMENTS
export const fetchAnnouncements = async (): Promise<AnnouncementSchema> => {
  try {
    await dbClient.connect();
    const res = await announcementCollection.findOne({
      _id: new ObjectId(announcementDocId),
    });
    await dbClient.close();

    // @ts-ignore
    return res;
  } catch (err) {
    throw new Error(`function: fetchAnnouncements\nError:\n${err}`);
  }
};
export const addAdminAnnouncement = async (
  adminId: number,
  adminName: string
) => {
  try {
    await dbClient.connect();
    await announcementCollection.updateOne(
      { _id: new ObjectId(announcementDocId) },
      {
        $push: {
          admins: {
            admin_id: adminId,
            admin_name: adminName,
          },
        },
      }
    );
    await dbClient.close();
  } catch (err) {
    throw new Error(`function: "addAdminAnnouncement"\nError:\n${err}`);
  }
};
export const removeAdminAnnouncement = async (adminId: number) => {
  try {
    await dbClient.connect();
    await announcementCollection.updateOne(
      { _id: new ObjectId(announcementDocId) },
      {
        $pull: {
          admins: {
            admin_id: adminId,
          },
        },
      }
    );
    await dbClient.close();
  } catch (err) {
    throw new Error(`function: "removeAdminAnnouncement"\nError:\n${err}`);
  }
};
export const addGroupAnnouncement = async (
  groupId: number,
  groupName: string
) => {
  try {
    await dbClient.connect();
    await announcementCollection.updateOne(
      { _id: new ObjectId(announcementDocId) },
      {
        $push: {
          groups: {
            group_id: groupId,
            group_name: groupName,
          },
        },
      }
    );
    await dbClient.close();
  } catch (err) {
    throw new Error(`function: "addGroupAnnouncement"\nError:\n${err}`);
  }
};
export const removeGroupAnnouncement = async (groupId: number) => {
  try {
    await dbClient.connect();
    await announcementCollection.updateOne(
      { _id: new ObjectId(announcementDocId) },
      {
        $pull: {
          groups: {
            group_id: groupId,
          },
        },
      }
    );
    await dbClient.close();
  } catch (err) {
    throw new Error(`function: "removeGroupAnnouncement"\nError:\n${err}`);
  }
};

export const findGroup = async (groupId: number) => {
  await dbClient.connect();
  const col = await announcementCollection.updateOne(
    {
      _id: new ObjectId(announcementDocId),
    },
    {
      $pull: {
        groups: {
          group_id: groupId,
        },
      },
    }
  );
  await dbClient.close();
  return col;
};

export const isSenderAdminAnnounce = async (senderId: number) => {
  const data = await fetchAnnouncements();
  return data.admins.some((admin) => admin.admin_id === senderId);
};
//#endregion
