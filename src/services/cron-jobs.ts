import cron from "node-cron";
import { emptyNodeCronStorage } from "../utils";
import { cache, fetchAndCache, increaseDayCount } from "./day-counter";
import { sendMessage } from "./messaging";
import {
  getAllWeightData,
  getWeightData,
  updateWeightAndDay,
} from "./weight-counter";

const createCronJobs = async () => {
  // empty cronJobs array
  emptyNodeCronStorage();
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
              increased.weight && ` ព្រឹកនិងល្ងាច ${increased.weight}kg`
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
            await sendMessage(Number(group?.admins[0]), `running cache job`);
            const groupId = Number(group?.chat_id);
            // increases the day count in db
            await increaseDayCount(groupId);

            // send message to the group
            const data = cache.find((g) => g?.chat_id === groupId);

            await sendMessage(
              Number(group?.chat_id),
              `ថ្ងៃ ${data?.day_count}`
            );
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
