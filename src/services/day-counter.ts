import {
  Cache,
  dayCountCollection,
  dbClient,
  everydayAtMidNight,
} from "./db-client";

import cron from "node-cron";
export let cache: Cache[];

export const isAdmin = (groupId: number, senderId: number) => {
  const isCacheEmpty = !cache || cache.length <= 0;
  if (isCacheEmpty) return false;
  return (
    cache.filter(
      (group) => group?.chat_id === groupId && group.admins.includes(senderId)
    ).length > 0
  );
};

export const fetchAndCache = async () => {
  try {
    await dbClient.connect();
    // @ts-ignore
    cache = await dayCountCollection.find({}).toArray();
  } catch (err) {
    throw new Error(`function: fetchAndCache\nError:\n${err}`);
  } finally {
    await dbClient.close();
  }
};

/**
 * increases day count in the database
 * @returns Document | null
 */
export const increaseDayCount = async (groupId: number) => {
  try {
    await dbClient.connect();
    const response = await dayCountCollection.findOneAndUpdate(
      { chat_id: groupId },
      { $inc: { day_count: 1 } }
    );
    await dbClient.close();

    const isCacheEmpty = !cache || cache.length <= 0;

    if (response.ok && !isCacheEmpty) {
      cache = cache.map((group) => {
        if (group?.chat_id === groupId) {
          group.day_count = response?.value?.day_count + 1;
        }
        return group;
      });
    } else {
      await fetchAndCache();
    }
  } catch (err) {
    throw new Error(`function: "increaseDayCount"\nError:\n${err}`);
  }
};

/**
 * sets day count in the database
 * @param {number} dayCount count
 */
export const setDayCount = async (
  groupId: number,
  dayCount: number
): Promise<void> => {
  try {
    await dbClient.connect();
    const response = await dayCountCollection.findOneAndUpdate(
      { chat_id: groupId },
      {
        $set: { day_count: dayCount },
      },
      {
        upsert: true,
      }
    );
    await dbClient.close();
    const isCacheEmpty = !cache || cache.length <= 0;

    if (response.ok && !isCacheEmpty) {
      cache = cache.map((group) => {
        if (group?.chat_id === groupId) {
          group.day_count = dayCount;
        }
        return group;
      });
    } else {
      await fetchAndCache();
    }
  } catch (err) {
    throw new Error(`function: "setDayCount"\nError:\n${err}`);
  }
};

type createGroupDTO = {
  groupId: number;
  adminId: number;
  dayCount?: number;
  schedule?: string;
};

/**
 * add a new group to the database
 * @param {number} groupId group id
 * @param {number} adminId user id
 * @param {number?} dayCount day count; default = 0;
 */
export const createGroup = async ({
  groupId,
  adminId,
  dayCount = 0,
  schedule,
}: createGroupDTO): Promise<void> => {
  try {
    await dbClient.connect();
    await dayCountCollection.insertOne({
      chat_id: groupId,
      admins: [adminId],
      day_count: dayCount,
      schedule: schedule || everydayAtMidNight,
    });
    await dbClient.close();
    await fetchAndCache();
  } catch (err) {
    throw new Error(`function: createGroup\nError:\n${err}`);
  }
};

/**
 * sets admin to the list in the database
 * @param {number} groupId chat id
 * @param {number} userId user id
 */
export const setAdmin = async (groupId: number, userId: number) => {
  try {
    await dbClient.connect();
    await dayCountCollection.updateOne(
      { chat_id: groupId },
      {
        $push: { admins: userId },
      }
    );
    await dbClient.close();
    await fetchAndCache();
  } catch (err) {
    throw new Error(`function: "setAdmin"\nError:\n${err}`);
  }
};

/**
 * sets schedule for the group in the database
 * @param {number} userId user id
 * @param {string} schedule cron expression
 */
export const setSchedule = async (groupId: number, schedule: string) => {
  const isExpressionValid = cron.validate(schedule.trim());
  if (isExpressionValid === false) {
    throw new Error("INVALID SCHEDULE");
  }
  try {
    await dbClient.connect();
    await dayCountCollection.updateOne(
      { chat_id: groupId },
      {
        $set: { schedule: schedule },
      }
    );
    await dbClient.close();
    await fetchAndCache();
  } catch (err) {
    throw new Error(`function: "setSchedule"\nError:\n${err}`);
  }
};

/**
 * removes admin from the list in the database
 * @param {number} userId user id
 */
export const removeAdmin = async (groupId: number, userId: number) => {
  try {
    await dbClient.connect();
    await dayCountCollection.updateOne(
      { chat_id: groupId },
      {
        $pull: { admins: userId },
      }
    );
    await dbClient.close();
    await fetchAndCache();
  } catch (err) {
    throw new Error(`function: "removeAdmin"\nError:\n${err}`);
  }
};
