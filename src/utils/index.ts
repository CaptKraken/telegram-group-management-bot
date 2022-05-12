export { errorHandler } from "./error-handler";
export {
  COMMANDS,
  setupWeightRegex,
  regexCronExpression,
  cancelKey,
} from "./constants";
export const errorLog = (name: string, err: Error) => {
  const errorString = `[ERROR]: (${Date.now().toLocaleString()})\nFunction: ${name}\nError:\n${
    err.message
  }`;
  console.error(errorString);
  return errorString;
};
export const getDayCountAndScheduleExpression = (message: string) => {
  const flags = message.split("-");
  type Result = {
    dayCount?: number;
    schedule?: string;
  };
  const result: Result = {
    dayCount: undefined,
    schedule: undefined,
  };
  flags.forEach((flag) => {
    if (flag.includes("d ")) {
      const number = flag.replace("d ", "");
      if (number) {
        result.dayCount = parseInt(number);
      }
    }
    if (flag.includes("s ")) {
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

export const decodeSetupWeightPayload = (text: string) => {
  type WeightSetup = {
    day_count?: number;
    weight?: number;
    increase_by?: number;
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
    if (flag.includes("i ")) {
      payload.increase_by = parseFloat(
        parseFloat(flag.replace("i ", "")).toFixed(1)
      );
    }
    if (flag.includes("s ")) {
      payload.schedule = flag
        .replace("s ", "")
        .replaceAll(`"`, "")
        .replaceAll(`'`, "");
    }
  });

  return payload;
};
