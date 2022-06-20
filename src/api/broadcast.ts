import express, { Request, Response } from "express";
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

// broadcastRouter.get("/folders",async(req: Request, res: Response)=>{});
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
          folders,
        },
      });
    } catch (error) {
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
        res.status(404).json({
          error: {
            code: 404,
            message: `Folder '${folderName}' not found.`,
          },
        });
      }
      res.json({
        data: {
          folder,
        },
      });
    } catch (error) {
      res.status(409).send();
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
        res.status(400).send();
      }
      await dbClient.connect();
      await createFolder(folder_name);
      await dbClient.close();
      res.status(201).send();
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

broadcastRouter.put(
  "/folders/:folderName",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const { folderName } = req.params;

      const { new_name } = req.body;
      if (!folderName || !new_name) {
        res.status(400).send({
          error: {
            code: 400,
            message: "Insufficient data received.",
          },
        });
      }
      await dbClient.connect();
      await renameFolder({ folder_name: folderName, new_name });
      await dbClient.close();
      res.send();
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
    try {
      const { folderName } = req.params;
      const { group_id, group_name } = req.body;

      await dbClient.connect();
      await addGroupBroadcast(
        { folder_name: folderName },
        group_id,
        group_name
      );
      await dbClient.close();
      return res.status(201).send();
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

broadcastRouter.delete(
  "/folders/:folderName/groups",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const { folderName } = req.params;
      const { group_id } = req.body;

      await dbClient.connect();
      await removeGroupBroadcast({ folder_name: folderName }, group_id);
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
