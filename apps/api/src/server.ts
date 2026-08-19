import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Redis from "ioredis";
import { PrismaClient, ProjectStatus } from "@prisma/client";
import { planAndRespond } from "./services/orchestrator.js";
import { createSessionToken, hashPassword, verifyPassword } from "./services/auth.js";

const app = Fastify({ logger: true });
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(",") ?? "http://localhost:3000",
  methods: ["GET", "POST"]
});
await app.register(sensible);

app.get("/health", async () => {
  await prisma.$queryRaw`SELECT 1`;
  const redisStatus = redis.status;

  return {
    ok: true,
    service: "master-oscar-api",
    database: "connected",
    redis: redisStatus
  };
});

app.get("/api/auth/bootstrap-status", async () => {
  const owner = await prisma.user.findFirst({ where: { role: "OWNER" } });
  return { setupRequired: !owner };
});

app.post("/api/auth/bootstrap", async (request, reply) => {
  const body = request.body as { name?: string; email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  if (!body.name?.trim() || !email || !body.password || body.password.length < 12) return reply.badRequest("Name, email, and a 12+ character password are required");
  const existingOwner = await prisma.user.findFirst({ where: { role: "OWNER" } });
  if (existingOwner) return reply.conflict("An owner account already exists");
  const user = await prisma.user.create({ data: { name: body.name.trim(), email, passwordHash: await hashPassword(body.password), role: "OWNER" } });
  const session = createSessionToken();
  await prisma.session.create({ data: { tokenHash: session.tokenHash, userId: user.id, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12) } });
  return reply.code(201).send({ token: session.token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post("/api/auth/login", async (request, reply) => {
  const body = request.body as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  if (!user?.passwordHash || !body.password || !(await verifyPassword(body.password, user.passwordHash))) return reply.unauthorized("Invalid email or password");
  const session = createSessionToken();
  await prisma.session.create({ data: { tokenHash: session.tokenHash, userId: user.id, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12) } });
  return reply.send({ token: session.token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get("/api/projects", async () => {
  return prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { deployments: true }
  });
});

app.post("/api/projects", async (request, reply) => {
  const body = request.body as {
    name?: string;
    description?: string;
  };

  if (!body.name?.trim()) {
    return reply.badRequest("Project name is required");
  }

  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "owner@masteroscar.local",
        name: "Master Oscar"
      }
    });
  }

  const project = await prisma.project.create({
    data: {
      name: body.name.trim(),
      description: body.description,
      ownerId: user.id,
      status: ProjectStatus.ACTIVE
    }
  });

  return reply.code(201).send(project);
});

app.post("/api/ai/command", async (request, reply) => {
  const body = request.body as { prompt?: string };

  if (!body.prompt?.trim()) {
    return reply.badRequest("Prompt is required");
  }

  const result = await planAndRespond(body.prompt.trim());
  return reply.send(result);
});

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);
  return reply.status(500).send({
    error: "Internal server error"
  });
});

const port = Number(process.env.API_PORT ?? 4000);

await app.listen({
  port,
  host: "0.0.0.0"
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  await redis.quit();
  await app.close();
  process.exit(0);
});
