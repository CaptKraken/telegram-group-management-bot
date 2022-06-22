import express, { Request, Response } from "express";
import { CustomError } from "../utils";
import {
  createGroup,
  deleteGroup,
  findOneDayCounterGroup,
  getDayCountCollection,
} from "../services";
import { isAdmin } from "./current-current-middleware";
export const dayCounterRouter = express.Router();

dayCounterRouter.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const groups = await getDayCountCollection();
    return res.send({
      data: {
        groups: groups ?? [],
      },
    });
  } catch (error) {
    return res.status(400).send();
  }
});

dayCounterRouter.get(
  "/:groupId",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const { groupId } = req.params;

      const group = await findOneDayCounterGroup(Number(groupId));
      if (!group) {
        throw new CustomError(`Group with ID '${groupId}' not found.`, 404);
      }
      return res.send({
        data: {
          group,
        },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        const code = error.getErrorCode();
        const message = error.getErrorMessage();
        return res.status(code).send({
          error: {
            code,
            message,
          },
        });
      }

      return res.status(409).send();
    }
  }
);

dayCounterRouter.post("/", isAdmin, async (req: Request, res: Response) => {
  const { group_id, group_name, day_count, schedule, message } = req.body;
  try {
    if (!group_id || !group_name) {
      throw new CustomError("Group id and name required.", 400);
    }

    await createGroup({
      groupId: group_id,
      groupName: group_name,
      dayCount: day_count,
      schedule,
      message,
    });
    return res.status(201).send();
  } catch (error) {
    if (error instanceof CustomError) {
      const code = error.getErrorCode();
      const message = error.getErrorMessage();
      const fields = [];

      if (!group_id) {
        fields.push("group_id");
      }

      if (!group_name) {
        fields.push("group_name");
      }

      return res.status(code).send({
        error: {
          code,
          message,
          fields,
        },
      });
    }

    if (error instanceof Error) {
      return res.status(400).send({
        error: {
          code: 400,
          message: error.message,
        },
      });
    }
    return res.status(409).send();
  }
});

dayCounterRouter.put(
  "/:groupId",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const { groupId } = req.params;
      const { group_name, day_count, schedule, message } = req.body;

      await createGroup({
        groupId: Number(groupId),
        groupName: group_name,
        dayCount: day_count,
        schedule,
        message,
      });
      return res.status(200).send();
    } catch (error) {
      return res.status(409).send();
    }
  }
);

dayCounterRouter.delete(
  "/:groupId",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const { groupId } = req.params;
      await deleteGroup(Number(groupId));
      return res.status(204).send();
    } catch (error) {
      return res.status(409).send();
    }
  }
);
