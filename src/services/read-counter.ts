import { ObjectId } from "mongodb";
import {
  adminCollection,
  dbClient,
  readCountCollection,
  readCountDocId,
} from "./db-client";

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

const setReadCountCache = async () => {
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
const saveReader = async (
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
const increaseReportCount = async (increaseBy: number = 1) => {
  try {
    await readCountCollection.findOneAndUpdate(
      { _id: readCountDocId },
      { $inc: { report_count: increaseBy } }
    );
  } catch (err) {
    throw new Error(`function: increaseReportCount\nerror: ${err}`);
  }
};

/**
 * removes a reader from the read count data
 * @param {string} readerName
 * @returns void
 */
const removeReader = async (readerName: string) => {
  try {
    await readCountCollection.updateOne(
      { _id: readCountDocId },
      {
        $unset: {
          [`data.${readerName}`]: null,
        },
      }
    );
  } catch (err) {
    throw new Error(
      `function: removeReader\nreaderName: ${readerName}\nerror: ${err}`
    );
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
