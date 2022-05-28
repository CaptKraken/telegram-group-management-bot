import { ObjectId } from "mongodb";
import { dbClient, quoteCollection, usedQuoteCollection } from "./db-client";

export const fetchQuote = async () => {
  try {
    await dbClient.connect();
    let data = await quoteCollection
      .aggregate([{ $sample: { size: 1 } }])
      .toArray();
    let quotesCount = await quoteCollection.estimatedDocumentCount();
    let usedCount = await usedQuoteCollection.estimatedDocumentCount();

    if (quotesCount <= 0 && usedCount <= 0) {
      throw new Error("send quote");
    }

    if (data.length === 0 && usedCount > 0) {
      await quoteCollection.drop();
      await usedQuoteCollection.rename("data");
      data = await quoteCollection
        .aggregate([{ $sample: { size: 1 } }])
        .toArray();
    }

    if (data && data.length > 0) {
      await usedQuoteCollection.insertOne(data[0]);
      await quoteCollection.deleteOne({ _id: data[0]._id });
    }
    return data[0].text;
  } catch (error) {
    return "SAMPLE QUOTE HERE";
  } finally {
    await dbClient.close();
  }
};

export const fetchAllQuotes = async () => {
  try {
    await dbClient.connect();
    const quotes = await quoteCollection.find().toArray();
    const used = await usedQuoteCollection.find().toArray();
    return [...quotes, ...used];
  } catch (error) {
    throw new Error(`${error}`);
  } finally {
    await dbClient.close();
  }
};

export const addQuote = async (text: string, author: string = "unknown") => {
  try {
    await dbClient.connect();
    await quoteCollection.insertOne({
      text,
      author,
    });
    await dbClient.close();
  } catch (error) {
    throw new Error(`${error}`);
  }
};

export const removeQuote = async (condition: ObjectId | string) => {
  try {
    await dbClient.connect();
    const payload =
      typeof condition === "object"
        ? {
            _id: condition,
          }
        : { text: condition };
    await quoteCollection.deleteOne({
      ...payload,
    });
    await usedQuoteCollection.deleteOne({
      ...payload,
    });
    await dbClient.close();
  } catch (error) {
    throw new Error(`${error}`);
  }
};
