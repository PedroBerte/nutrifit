import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { errorHandler } from "./common/error-handler";
import routes from "./routes";

export function createApp() {
  const app = express();

  app.use((req, _res, next) => {
    if (req.url === "/api") {
      req.url = "/";
    } else if (req.url.startsWith("/api/")) {
      req.url = req.url.slice(4);
    }
    next();
  });

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp());

  app.use(routes);
  app.use(errorHandler);

  return app;
}
