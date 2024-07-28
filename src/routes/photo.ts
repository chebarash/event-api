import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import axios from "axios";
import bot from "../bot";

const photo: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async (req, res) => {
    const fileId = req.params.fileId;

    if (!fileId) return res.status(400).send(`File ID is required`);

    try {
      const file = await bot.telegram.getFile(fileId);

      if (!file.file_path) return res.status(404).send(`File not found`);

      const fileUrl = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path}`;

      const response = await axios.get(fileUrl, { responseType: `stream` });

      res.setHeader(
        `Content-Type`,
        response.headers[`content-type`] || `image/jpeg`
      );
      res.setHeader(`Content-Disposition`, `inline; filename="photo.jpg"`);

      response.data.pipe(res);
    } catch (error) {
      res.status(500).json({ message: `Error fetching the file` });
    }
  },
};

export = photo;
