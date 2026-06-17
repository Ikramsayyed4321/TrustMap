import http from "node:http";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { logger } from "./config/logger.js";
import { createApp } from "./app.js";

const app = createApp();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true
  }
});

io.on("connection", (socket) => {
  socket.on("join:user", (userId: string) => socket.join(`user:${userId}`));
});

try {
  await connectDatabase();
  server.listen(env.PORT, () => {
    logger.info(`ReviewHub API listening on port ${env.PORT}`);
  });
} catch (err) {
  logger.error({ err }, "Database setup failed; API startup aborted");
  process.exit(1);
}
