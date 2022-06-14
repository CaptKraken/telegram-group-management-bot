export { errorHandler } from "./error-handler";
export {
  COMMANDS,
  setupWeightRegex,
  regexCronExpression,
  cancelKey,
  goBackBroadcastKey,
} from "./constants";
export const errorLog = (name: string, err: Error) => {
  const errorString = `[ERROR]: (${Date.now().toLocaleString()})\nFunction: ${name}\nError:\n${
    err.message
  }`;
  console.error(errorString);
  return errorString;
};
export const getDayCountAndScheduleExpression = (message: string) => {
  const flags = message.split(" -");
  type Result = {
    message?: string;
    dayCount?: number;
    schedule?: string;
  };
  const result: Result = {
    message: undefined,
    dayCount: undefined,
    schedule: undefined,
  };
  flags
    .map((flag) => flag.trim())
    .forEach((flag) => {
      if (flag.startsWith("m ")) {
        const message = flag
          .replace("m ", "")
          .trim()
          .replaceAll(`"`, "")
          .replaceAll(`'`, "");
        if (message) {
          result.message = message;
        }
      }
      if (flag.startsWith("d ")) {
        const number = flag.replace("d ", "");
        if (number) {
          result.dayCount = parseInt(number);
        }
      }
      if (flag.startsWith("s ")) {
        const schedule = flag
          .replace("s ", "")
          .trim()
          .replaceAll(`"`, "")
          .replaceAll(`'`, "");
        result.schedule = schedule;
      }
    });
  return result;
};

export { convertKhmerToArabicNumerals, isNumber } from "./read-count-utils";

export const decodeSetupWeightPayload = (text: string) => {
  type WeightSetup = {
    day_count?: number;
    weight?: number;
    schedule?: string;
  };
  const payload: WeightSetup = {};
  const flags = text.split("-");
  flags.forEach((flag) => {
    if (flag.includes("d ")) {
      payload.day_count = parseInt(flag.replace("d ", ""));
    }
    if (flag.includes("w ")) {
      payload.weight = parseFloat(
        parseFloat(flag.replace("w ", "")).toFixed(1)
      );
    }
    if (flag.includes("s ")) {
      payload.schedule = flag
        .replace("s ", "")
        .replaceAll(`"`, "")
        .replaceAll(`'`, "")
        .trim();
    }
  });

  return payload;
};

/**
 * ¡specifically for node-cron.js!
 *
 * sets cron.getTasks() = []
 *
 */
export const emptyNodeCronStorage = () => {
  // looked into the source code for this.
  // @ts-ignore
  global.scheduledTasks = [];
};
