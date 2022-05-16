import { ObjectId } from "mongodb";
import { everydayAt5AM } from "../utils/constants";
import {
  dayCountWeightCollection,
  dayCountWeightDocId,
  dbClient,
} from "./db-client";

export type SetupWeightDTO = {
  group_id: number;
  group_name: string;
  day_count?: number;
  weight?: number;
  schedule?: string;
};
export const setupWeight = async (payload: SetupWeightDTO) => {
  try {
    const doc = await getWeightData();
    await dbClient.connect();
    await dayCountWeightCollection.updateOne(
      {
        group_id: payload.group_id,
      },
      {
        $set: {
          group_id: payload.group_id,
          group_name: payload.group_name,
          day_count: payload.day_count ?? doc.day_count ?? 0,
          weight: payload.weight ?? doc.weight ?? 0,
          schedule: payload.schedule ?? doc.schedule ?? "",
        },
      },
      {
        upsert: true,
      }
    );
    await dbClient.close();
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const getWeightData = async () => {
  try {
    await dbClient.connect();
    const doc = await dayCountWeightCollection.findOne({
      _id: new ObjectId(dayCountWeightDocId),
    });
    await dbClient.close();

    if (!doc) {
      throw new Error(`No data available.`);
    }
    return doc;
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const updateWeightAndDay = async () => {
  try {
    await dbClient.connect();
    const res = await dayCountWeightCollection.findOneAndUpdate(
      {
        _id: new ObjectId(dayCountWeightDocId),
      },
      {
        $inc: {
          day_count: 1,
        },
      }
    );
    await dbClient.close();
    console.log("RES", res.value);

    const newData = await getWeightData();
    return newData;
  } catch (error) {
    throw new Error(`Error updating weight data.`);
  }
};
