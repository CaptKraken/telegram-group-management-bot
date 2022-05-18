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

type NameOrId = {
  folder_name?: string;
  _id?: ObjectId;
};

export const findOneFolder = async ({ _id, folder_name }: NameOrId) => {
  try {
    if (!_id && !folder_name) {
      throw new Error(`No folder id or name was given.`);
    }

    const condition = _id ? { _id } : { folder_name };
    await dbClient.connect();

    const folder = await announcementCollection.findOne(condition);

    await dbClient.close();

    return folder;
  } catch (err) {
    throw new Error(`${err}`);
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
        throw new Error(
          `Folder "${folder_name}" already exists. Please try again with a different name.`
        );
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

export const addGroupBroadcast = async (
  { _id, folder_name }: NameOrId,
  group_id: number,
  group_name: string
) => {
  try {
    if (!_id && !folder_name) {
      throw new Error(`No folder id or name was given.`);
    }

    const condition = _id ? { _id } : { folder_name };

    await dbClient.connect();
    await announcementCollection.updateOne(condition, {
      $addToSet: {
        groups: {
          group_id,
          group_name,
        },
      },
    });
    await dbClient.close();
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const removeGroupBroadcast = async (
  { _id, folder_name }: NameOrId,
  group_id: number
) => {
  try {
    if (!_id && !folder_name) {
      throw new Error(`No folder id or name was given.`);
    }

    const condition = _id ? { _id } : { folder_name };

    await dbClient.connect();
    await announcementCollection.updateOne(condition, {
      $pull: {
        groups: {
          group_id,
        },
      },
    });
    await dbClient.close();
  } catch (error) {
    throw new Error(`${error}`);
  }
};
