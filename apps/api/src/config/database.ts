import { execFile } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { env } from "./env.js";
import { logger } from "./logger.js";
import { prisma } from "./prisma.js";

const execFileAsync = promisify(execFile);

function quoteIdentifier(identifier: string) {
  return `\`${identifier.replace(/`/g, "``")}\``;
}

function apiCwd() {
  return process.cwd().endsWith("apps\\api") || process.cwd().endsWith("apps/api") ? process.cwd() : "apps/api";
}

function hasMigrations() {
  const migrationsPath = join(apiCwd(), "prisma", "migrations");
  return existsSync(migrationsPath) && readdirSync(migrationsPath, { withFileTypes: true }).some((entry) => entry.isDirectory());
}

async function createDatabaseIfMissing() {
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: false
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(env.DB_NAME)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.end();
  logger.info({ database: env.DB_NAME }, "MySQL database ready");
}

async function runPrismaCommand(args: string[]) {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const { stdout, stderr } = await execFileAsync(command, ["prisma", ...args], {
    cwd: apiCwd(),
    env: process.env,
    windowsHide: true
  });
  if (stdout.trim()) logger.info(stdout.trim());
  if (stderr.trim()) logger.warn(stderr.trim());
}

async function runMigrationsAndSyncSchema() {
  if (hasMigrations()) {
    try {
      await runPrismaCommand(["migrate", "deploy"]);
    } catch (err) {
      if (env.NODE_ENV !== "development") {
        throw err;
      }

      logger.warn({ err }, "Migration deploy failed; resetting development database automatically");
      await runPrismaCommand(["migrate", "reset", "--force", "--skip-seed", "--skip-generate"]);
    }

    logger.info("Prisma migrations applied");
    return;
  }

  try {
    await runPrismaCommand(["db", "push", "--accept-data-loss", "--skip-generate"]);
  } catch (err) {
    if (env.NODE_ENV !== "development") {
      throw err;
    }

    logger.warn({ err }, "Schema sync failed; resetting development database automatically");
    await runPrismaCommand(["db", "push", "--force-reset", "--accept-data-loss", "--skip-generate"]);
  }

  logger.info("Prisma schema synchronized");
}

async function seedDevelopmentData() {
  if (env.NODE_ENV !== "development") return;

  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    logger.info("Development seed skipped; data already exists");
    return;
  }

  const passwordHash = await bcrypt.hash("password123", 12);
  const [restaurant, hotel, gym] = await Promise.all([
    prisma.category.create({ data: { name: "Restaurant", slug: "restaurant", icon: "utensils", description: "Restaurants and food places" } }),
    prisma.category.create({ data: { name: "Hotel", slug: "hotel", icon: "building", description: "Hotels and stays" } }),
    prisma.category.create({ data: { name: "Gym", slug: "gym", icon: "dumbbell", description: "Fitness and wellness" } })
  ]);

  const [admin, reviewer] = await Promise.all([
    prisma.user.create({ data: { name: "Admin", email: "admin@reviewhub.local", passwordHash, role: "admin" } }),
    prisma.user.create({ data: { name: "Aarav Reviewer", email: "user@reviewhub.local", passwordHash, role: "reviewer", reputationPoints: 120 } })
  ]);

  await prisma.business.createMany({
    data: [
      {
        name: "Copper Table Bistro",
        slug: "copper-table-bistro",
        categoryId: restaurant.id,
        address: "Airport Road",
        city: "New Delhi",
        state: "Delhi",
        country: "India",
        latitude: 28.5562,
        longitude: 77.1,
        averageRating: 4.7,
        totalReviews: 1284,
        verified: true,
        ownerId: admin.id,
        aiSummary: "Guests praise ambience, family seating, and biryani.",
        trendingScore: 94
      },
      {
        name: "Harbor View Hotel",
        slug: "harbor-view-hotel",
        categoryId: hotel.id,
        address: "Marine Drive",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        latitude: 19.076,
        longitude: 72.8777,
        averageRating: 4.5,
        totalReviews: 932,
        verified: true,
        ownerId: admin.id,
        aiSummary: "Travelers like clean rooms, breakfast, and location.",
        trendingScore: 87
      },
      {
        name: "PulseFit Studio",
        slug: "pulsefit-studio",
        categoryId: gym.id,
        address: "Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        latitude: 12.9716,
        longitude: 77.5946,
        averageRating: 4.4,
        totalReviews: 512,
        verified: false,
        ownerId: reviewer.id,
        aiSummary: "Members value coaches and equipment variety.",
        trendingScore: 78
      }
    ]
  });

  logger.info("Development seed data created");
}

export async function connectDatabase() {
  await createDatabaseIfMissing();
  await runMigrationsAndSyncSchema();
  await prisma.$connect();
  logger.info("MySQL connected");
  await seedDevelopmentData();
}
