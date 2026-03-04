import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, cityProjects, buildings, llmTasks, communicationLogs,
  InsertCityProject, InsertBuilding, InsertLlmTask, InsertCommunicationLog
} from "@/drizzle/schema";
import { ENV } from "./env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } 
    catch { _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  if (user.name !== undefined) { values.name = user.name; updateSet.name = user.name; }
  if (user.email !== undefined) { values.email = user.email; updateSet.email = user.email; }
  if (user.loginMethod !== undefined) { values.loginMethod = user.loginMethod; updateSet.loginMethod = user.loginMethod; }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCityProject(project: InsertCityProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cityProjects).values(project);
  return { insertId: Number((result as any)[0]?.insertId) };
}

export async function getCityProjectsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(cityProjects).where(eq(cityProjects.userId, userId)).orderBy(desc(cityProjects.createdAt));
}

export async function getCityProjectById(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cityProjects).where(eq(cityProjects.id, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCityProjectStatus(projectId: number, status: string, currentStep?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cityProjects).set({ status: status as any, currentStep }).where(eq(cityProjects.id, projectId));
}

export async function createBuilding(building: InsertBuilding) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(buildings).values(building);
  return { insertId: Number((result as any)[0]?.insertId) };
}

export async function getBuildingsByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(buildings).where(eq(buildings.projectId, projectId));
}

export async function createLlmTask(task: InsertLlmTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(llmTasks).values(task);
  return { insertId: Number((result as any)[0]?.insertId) };
}

export async function getLlmTasksByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(llmTasks).where(eq(llmTasks.projectId, projectId)).orderBy(desc(llmTasks.createdAt));
}

export async function updateLlmTaskStatus(taskId: number, status: string, output?: string, codeGenerated?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { status: status as any };
  if (status === "in_progress") updateData.startedAt = new Date();
  else if (status === "completed" || status === "failed") updateData.completedAt = new Date();
  if (output) updateData.output = output;
  if (codeGenerated) updateData.codeGenerated = codeGenerated;
  await db.update(llmTasks).set(updateData).where(eq(llmTasks.id, taskId));
}

export async function createCommunicationLog(log: InsertCommunicationLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(communicationLogs).values(log);
  return { insertId: Number((result as any)[0]?.insertId) };
}

export async function getCommunicationLogsByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(communicationLogs).where(eq(communicationLogs.projectId, projectId)).orderBy(desc(communicationLogs.timestamp));
}
