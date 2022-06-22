import express, { Request, Response } from "express";
import { CustomError } from "../utils";
import {
  addGroupBroadcast,
  createFolder,
  dbClient,
  deleteFolder,
  findAllFolders,
  findOneFolder,
  removeGroupBroadcast,
  renameFolder,
} from "../services";
import { isAdmin } from "./current-current-middleware";
export const broadcastRouter = express.Router();

broadcastRouter.get(
  "/folders",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      await dbClient.connect();
      const folders = await findAllFolders();
      await dbClient.close();

      return res.json({
        data: {
          folders: folders ?? [],
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(409).send({
          error: {
            code: 409,
            name: error.name,
            message: error.message,
          },
        });
      }
      return res.status(409).send();
    }
  }
);

broadcastRouter.get(
  "/folders/:folderName",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const { folderName } = req.params;
      await dbClient.connect();
      const folder = await findOneFolder({ folder_name: folderName });
      await dbClient.close();

      if (!folder) {
        throw new CustomError(`Folder '${folderName}' not found.`, 404);
      }
      return res.send({
        data: {
          folder,
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

      if (error instanceof Error) {
        return res.status(409).send({
          error: {
            code: 409,
            name: error.name,
            message: error.message,
          },
        });
      }

      return res.status(409).send();
    }
  }
);

broadcastRouter.post(
  "/folders",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const { folder_name } = req.body;
      if (!folder_name) {
        throw new CustomError("folder_name not found.", 400);
      }
      await dbClient.connect();
      await createFolder(folder_name);
      await dbClient.close();
      return res.status(201).send();
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).send({
          error: {
            code: error.statusCode,
            message: error.getErrorMessage(),
          },
        });
      }

      return res.status(409).send({
        error: {
          code: 409,
          message: error,
        },
      });
    }
  }
);

broadcastRouter.put(
  "/folders/:folderName",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const { folderName } = req.params;

      const { new_name } = req.body;
      if (!new_name) {
        throw new CustomError("new_name not found.", 400);
      }
      await dbClient.connect();
      await renameFolder({ folder_name: folderName, new_name });
      await dbClient.close();
      return res.status(204).send();
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).send({
          error: {
            code: error.statusCode,
            message: error.getErrorMessage(),
          },
        });
      }

      if (error instanceof Error) {
        return res.status(409).send({
          error: {
            code: 409,
            name: error.name,
            message: error.message,
          },
        });
      }

      return res.status(409).send({
        error: {
          code: 409,
          message: error,
        },
      });
    }
  }
);

broadcastRouter.delete(
  "/folders/:folderName",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const { folderName } = req.params;
      await dbClient.connect();
      await deleteFolder(folderName);
      await dbClient.close();
      res.status(204).send();
    } catch (error) {
      res.status(409).send({
        error: {
          code: 409,
          message: error,
        },
      });
    }
  }
);

broadcastRouter.post(
  "/folders/:folderName/groups",
  isAdmin,
  async (req: Request, res: Response) => {
    const { folderName } = req.params;
    const { group_id, group_name } = req.body;
    try {
      if (!group_id || !group_name) {
        throw new CustomError("Insufficient data was given.");
      }
      await dbClient.connect();
      await addGroupBroadcast(
        { folder_name: folderName },
        group_id,
        group_name
      );
      await dbClient.close();
      return res.status(201).send();
    } catch (error) {
      if (error instanceof CustomError) {
        const fields = [];
        if (!group_id) {
          fields.push("group_id");
        }
        if (!group_name) {
          fields.push("group_name");
        }
        return res.status(error.statusCode).send({
          error: {
            code: error.statusCode,
            message: error.getErrorMessage(),
            fields,
          },
        });
      }

      if (error instanceof Error) {
        return res.status(409).send({
          error: {
            code: 409,
            message: error.message,
          },
        });
      }

      res.status(409).send();
    }
  }
);

broadcastRouter.delete(
  "/folders/:folderName/groups/:groupId",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const { folderName, groupId } = req.params;
      await dbClient.connect();
      await removeGroupBroadcast(folderName, Number(groupId));
      await dbClient.close();
      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(409).send({
          error: {
            code: 409,
            message: error.message,
          },
        });
      }

      res.status(409).send();
    }
  }
);
