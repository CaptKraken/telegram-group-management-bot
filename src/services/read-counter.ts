import { ObjectId } from "mongodb";
import {
  adminCollection,
  dbClient,
  readCountCollection,
  readCountDocId,
  readCountGroupId,
} from "./db-client";
import { sendMessage } from "./messaging";

export type ReadCountData = {
  _id: ObjectId;
  chat_id: number;
  report_count: number;
  data: {
    [key: string]: {
      count: number;
      last_msg_id: number;
    };
  };
};

export let readCountCache: ReadCountData | undefined = undefined;

export const setReadCountCache = async () => {
  try {
    await dbClient.connect();
    const col = await readCountCollection.findOne({ _id: readCountDocId });
    // @ts-ignore
    readCountCache = { ...col };
  } catch (err) {
    console.log(err);
    throw new Error(`${err}`);
  } finally {
    await dbClient.close();
  }
};

/**
 * updates or creates read count of a reader
 * @param {string} readerName
 * @param {number} count
 * @param {number} messageId
 * @returns void
 */
export const saveReadCount = async (
  readerName: string,
  count: number,
  messageId: number
) => {
  try {
    await readCountCollection.updateOne(
      { _id: readCountDocId },
      [
        {
          $set: {
            [`data.${readerName}.count`]: {
              $cond: {
                if: {
                  $gte: [messageId, `$data.${readerName}.last_msg_id`],
                },
                then: count,
                else: `$data.${readerName}.count`,
              },
            },
          },
        },
        {
          $set: {
            [`data.${readerName}.last_msg_id`]: {
              $cond: {
                if: {
                  $gte: [messageId, `$data.${readerName}.last_msg_id`],
                },
                then: messageId,
                else: `$data.${readerName}.last_msg_id`,
              },
            },
          },
        },
      ],
      {
        upsert: true,
      }
    );
  } catch (err) {
    throw new Error(
      `function: saveReader\nreaderName: ${readerName}\ncount: ${count}\nmessage id: ${messageId}\nerror: ${err}`
    );
  }
};

/**
 * increases the report count
 * @returns void
 */
export const increaseReportCount = async (increaseBy: number = 1) => {
  try {
    await dbClient.connect();
    await readCountCollection.findOneAndUpdate(
      { _id: readCountDocId },
      { $inc: { report_count: increaseBy } }
    );
    await dbClient.close();
  } catch (err) {
    throw new Error(`function: increaseReportCount\nerror: ${err}`);
  }
};

/**
 * removes a reader from the read count data
 * @param {string} readerName
 * @returns void
 */
export const removeReader = async (readerName: string) => {
  try {
    await dbClient.connect();
    await readCountCollection.updateOne(
      { _id: readCountDocId },
      {
        $unset: {
          [`data.${readerName}`]: null,
        },
      }
    );
    await dbClient.close();
  } catch (err) {
    throw new Error(
      `function: removeReader\nreaderName: ${readerName}\nerror: ${err}`
    );
  }
};

/**
 * sends the read count report to the group
 * @returns void
 */
export const sendReport = async () => {
  try {
    const collection = await readCountCollection.findOne({
      _id: readCountDocId,
    });
    if (!collection) {
      throw new Error(`Can't find collection`);
    }
    // prepare the message
    let report = `#${collection.report_count} អានប្រចាំថ្ងៃ 7AM:`;
    const countData = Object.fromEntries(
      // @ts-ignore
      Object.entries(collection.data).sort(([, a], [, b]) => b.count - a.count)
    );
    Object.keys(countData).forEach((key, i) => {
      // @ts-ignore
      const count = countData[key].count;
      report += `\n${(i + 1).toString().padStart(2, "0")} - ${key}: ${count}`;
    });

    await sendMessage(readCountGroupId, report);
  } catch (err) {
    throw new Error(`function: "sendReport"\nerror: ${err}`);
  }
};

// /**
//  * send the admin list to the provided chat id
//  * @param {number|string} chatId
//  * @returns void
//  */
// const sendAdminList = async (chatId) => {
//   if (!chatId) return;
//   try {
//     const admins = await findAllAdmins();
//     if (!admins) return;
//     let message = "ADMINS:";
//     const sortedAdmins = Object.fromEntries(
//       Object.entries(admins).sort(([, a], [, b]) => a - b)
//     );
//     Object.keys(sortedAdmins).forEach((key, i) => {
//       message += `\n${(i + 1).toString().padStart(2, "0")} - ${key}: ${
//         admins[key]
//       }`;
//     });
//     await sendMessage(chatId, message);
//   } catch (err) {
//     throw new Error(`function: sendAdminList\nerror: ${err}`);
//   }
// };
