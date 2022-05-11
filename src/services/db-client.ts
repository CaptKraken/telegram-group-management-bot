import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const { TOKEN, CONNECTION_STRING, DOCUMENT_ID } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
export const dbClient = new MongoClient(`${CONNECTION_STRING}`);

export const everydayAtMidNight = "0 0 0 * * *";
export const dayCountCollection = dbClient
  .db("day-count-db")
  .collection("data");

export const dayCountWeightDocId = "6279d2e0569f28d138481c00";
export const dayCountWeightCollection = dbClient
  .db("day-count-db")
  .collection("weight");

export const announcementDocId = "6274cf3ea80aedaa90c11c3f";
export const announcementCollection = dbClient
  .db("announcement-db")
  .collection("data");

type DBSchema = {
  _id: ObjectId;
  chat_id: number;
  schedule: string;
  admins: number[];
  day_count: number;
};
type Admin = {
  admin_id: number;
  admin_name: string;
};
type Group = {
  group_id: number;
  group_name: string;
};
type AnnouncementSchema = {
  _id: ObjectId;
  admins: Admin[];
  groups: Group[];
};

export type Cache = DBSchema | undefined;
