import cron from "node-cron";
import { emptyNodeCronStorage } from "../utils";
import { cache, fetchAndCache, increaseDayCount } from "./day-counter";
import { sendMessage } from "./messaging";
import { increaseReportCount, sendReport } from "./read-counter";
import { getAllWeightData, updateWeightAndDay } from "./weight-counter";

const createCronJobs = async () => {
  // empty cronJobs array
  emptyNodeCronStorage();

  // cron job to send report to the group everyday at 7 am
  cron.schedule(
    "00 07 * * *",
    async function () {
      try {
        await increaseReportCount();
        await sendReport();
      } catch (err) {
        console.log(`${err}`);
      }
    },
    {
      timezone: "Asia/Phnom_Penh",
    }
  );

  const groups = await getAllWeightData();

  groups.forEach((group) => {
    const isWeightScheduleValid = cron.validate(group.schedule);

    if (isWeightScheduleValid) {
      cron.schedule(
        group.schedule,
        async () => {
          const increased = await updateWeightAndDay(group.group_id);
          if (!increased) return;

          await sendMessage(
            group.group_id,
            `ថ្ងៃទី${increased.day_count}${
              increased.weight ? ` ល្ងាច ${increased.weight}kg` : ""
            }`
          );
        },
        {
          scheduled: false,
          timezone: "Asia/Phnom_Penh",
        }
      );
    }
  });

  await fetchAndCache();

  cache.forEach((group) => {
    const isScheduleExpressionValid = cron.validate(
      `${group?.schedule.trim()}`
    );

    // only run if the expression is valid
    if (isScheduleExpressionValid) {
      cron.schedule(
        `${group?.schedule}`,
        async () => {
          try {
            const groupId = Number(group?.chat_id);
            // increases the day count in db
            await increaseDayCount(groupId);

            // send message to the group
            const data = cache.find((g) => g?.chat_id === groupId);

            const uncleanedMessage = data?.message;
            const message = `${uncleanedMessage?.replace(
              "{day_count}",
              `${data?.day_count}`
            )}`;

            await sendMessage(Number(group?.chat_id), message);
          } catch (err) {
            console.error(`Cron Job Error\nerror: ${err}`);
          }
        },
        {
          scheduled: false,
          timezone: "Asia/Phnom_Penh",
        }
      );
    }
  });

  console.log(`[INFO]: ${cron.getTasks().length} jobs created.`);
};

export const startCronJobs = () => {
  cron.getTasks().forEach((job) => job.start());
  console.log(`[INFO]: ${cron.getTasks().length} jobs started.`);
};

export const stopCronJobs = () => {
  cron.getTasks().forEach((job) => job.stop());
  console.log(`[INFO]: ${cron.getTasks().length} jobs stopped.`);
  emptyNodeCronStorage();
};

export const initCronJobs = async () => {
  await createCronJobs();
  startCronJobs();
};

export const restartCronJobs = async () => {
  console.log(`******* Restarting Cron Jobs *******`);
  stopCronJobs();
  await initCronJobs();
  console.log(`********* Restarting Done **********`);
};
