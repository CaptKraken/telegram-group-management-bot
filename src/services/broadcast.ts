import { ObjectId } from "mongodb";
import { announcementCollection, dbClient } from "./db-client";

export const findAllFolders = async () => {
  try {
    await dbClient.connect();
    const folders = await announcementCollection.find().toArray();
    await dbClient.close();

    return folders;
  } catch (err) {
    throw new Error(`${err}`);
  }
};

// type NameOrId = {
//   folder_name?: string;
//   _id?: ObjectId;
// };

export const findOneFolder = async ({
  folder_name,
}: {
  folder_name: string;
}) => {
  try {
    if (!folder_name) {
      throw new Error(`No folder id or name was given.`);
    }
    await dbClient.connect();
    const folder = await announcementCollection.findOne({ folder_name });
    await dbClient.close();

    return folder;
  } catch (err) {
    throw err;
  }
};

export const createFolder = async (folder_name: string) => {
  try {
    await dbClient.connect();
    await announcementCollection.insertOne({
      folder_name,
      groups: [],
    });
    await dbClient.close();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("E11000")) {
        throw `Folder '${folder_name}' already exists. Please try again with a different name.`;
      }
    }
    throw new Error(`${error}`);
  }
};

export type RenameFolderDTO = {
  folder_name: string;
  new_name: string;
};

export const renameFolder = async ({
  folder_name,
  new_name,
}: RenameFolderDTO) => {
  try {
    await dbClient.connect();
    await announcementCollection.findOneAndUpdate(
      {
        folder_name,
      },
      {
        $set: {
          folder_name: new_name,
        },
      }
    );
    await dbClient.close();
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const deleteFolder = async (folder_name: string) => {
  try {
    if (!folder_name) {
      throw new Error(`No folder name was given.`);
    }

    await dbClient.connect();
    await announcementCollection.findOneAndDelete({ folder_name });
    await dbClient.close();
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export type BroadcastFolder = {
  _id: ObjectId;
  folder_name: string;
  groups: BroadcastGroup[];
};

export type BroadcastGroup = {
  group_id: number;
  group_name: string;
};

export const addGroupBroadcast = async (
  { folder_name }: { folder_name: string },
  group_id: number,
  group_name: string
) => {
  try {
    const folder = await findOneFolder({ folder_name });
    // @ts-ignore
    const groups: BroadcastGroup[] = folder.groups;

    const isAlreadyInGroup =
      folder &&
      groups &&
      groups.find((group) => group.group_id === group_id) !== undefined;

    if (isAlreadyInGroup) {
      throw new Error(
        `Group "${group_name}" is already in the folder "${folder_name}".`
      );
    }

    if (!folder_name) {
      throw new Error(`No folder id or name was given.`);
    }

    await dbClient.connect();
    await announcementCollection.updateOne(
      { folder_name },
      {
        $push: {
          groups: {
            group_id,
            group_name,
          },
        },
      }
    );
    await dbClient.close();
  } catch (error) {
    throw error;
  }
};

export const removeGroupBroadcast = async (
  folder_name: string,
  group_id: number
) => {
  try {
    if (!folder_name) {
      throw new Error(`No folder id or name was given.`);
    }

    await dbClient.connect();
    await announcementCollection.updateOne(
      { folder_name },
      {
        $pull: {
          groups: {
            group_id,
          },
        },
      }
    );
    await dbClient.close();
  } catch (error) {
    throw error;
  }
};
