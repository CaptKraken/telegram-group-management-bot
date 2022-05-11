import { ObjectId } from "mongodb";
import { everydayAt5AM } from "../utils/constants";
import {
  dayCountWeightCollection,
  dayCountWeightDocId,
  dbClient,
} from "./db-client";

export type SetupWeightDTO = {
  group_id: number;
  admin_id: number;
  day_count?: number;
  weight?: number;
  increase_by?: number;
  schedule?: string;
};
export const setupWeight = async (payload: SetupWeightDTO) => {
  try {
    const doc = await getWeightData();
    await dbClient.connect();
    await dayCountWeightCollection.updateOne(
      {
        _id: new ObjectId(dayCountWeightDocId),
      },
      {
        $set: {
          group_id: payload.group_id,
          admin_id: payload.admin_id,
          day_count: payload.day_count ?? doc.day_count,
          weight: payload.weight ?? doc.weight,
          increase_by: payload.increase_by ?? doc.increase_by,
          schedule: payload.schedule ?? doc.schedule,
        },
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
    const data = await getWeightData();
    await dbClient.connect();
    await dayCountWeightCollection.updateOne(
      {
        _id: new ObjectId(dayCountWeightDocId),
      },
      {
        $set: {
          day_count: data.day_count + 1,
          weight: parseFloat(
            parseFloat(data.weight + data.increase_by).toFixed(1)
          ),
        },
      }
    );
    await dbClient.close();
    const newData = await getWeightData();
    return newData;
  } catch (error) {
    throw new Error(`Error updating weight data.`);
  }
};
