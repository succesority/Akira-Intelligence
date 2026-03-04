import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./server";
import { createCityProject, getCityProjectsByUserId, getCityProjectById, getBuildingsByProjectId, getLlmTasksByProjectId, getCommunicationLogsByProjectId } from "@/lib/db";

const systemRouter = router({
  health: publicProcedure.query(() => ({ status: "ok", timestamp: new Date().toISOString() })),
});

const authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user),
  logout: publicProcedure.mutation(() => ({ success: true } as const)),
});

const cityRouter = router({
  create: publicProcedure.input(z.object({ name: z.string(), prompt: z.string() })).mutation(async ({ ctx, input }) => {
    const userId = ctx.user?.id || 0;
    const result = await createCityProject({ userId, name: input.name, prompt: input.prompt, status: "pending" });
    if (!result.insertId || isNaN(result.insertId)) throw new Error("Failed to create project");
    return { success: true, projectId: result.insertId };
  }),
  startBuilding: publicProcedure.input(z.object({ projectId: z.number() })).mutation(async ({ ctx, input }) => {
    const project = await getCityProjectById(input.projectId);
    if (!project) throw new Error("Project not found");
    if (ctx.user && project.userId !== ctx.user.id && project.userId !== 0) throw new Error("Unauthorized");
    const { LLMOrchestrator } = await import("@/lib/llmOrchestrator");
    const orchestrator = new LLMOrchestrator(input.projectId);
    // Initialize project and build first phase immediately
    await orchestrator.initializeProject(project.prompt);
    const result = await orchestrator.buildPhase(1);
    return { ...result, success: true, message: "Phase 1 complete" };
  }),
  buildNextPhase: publicProcedure.input(z.object({ projectId: z.number(), phaseNumber: z.number() })).mutation(async ({ ctx, input }) => {
    const project = await getCityProjectById(input.projectId);
    if (!project) throw new Error("Project not found");
    if (ctx.user && project.userId !== ctx.user.id && project.userId !== 0) throw new Error("Unauthorized");
    const { LLMOrchestrator } = await import("@/lib/llmOrchestrator");
    const orchestrator = new LLMOrchestrator(input.projectId);
    const result = await orchestrator.buildPhase(input.phaseNumber);
    return { ...result, success: true };
  }),
  list: protectedProcedure.query(async ({ ctx }) => getCityProjectsByUserId(ctx.user.id)),
  getProject: publicProcedure.input(z.object({ projectId: z.number() })).query(async ({ ctx, input }) => {
    const project = await getCityProjectById(input.projectId);
    if (!project) throw new Error("Project not found");
    if (ctx.user && project.userId !== ctx.user.id && project.userId !== 0) throw new Error("Unauthorized");
    return project;
  }),
  getBuildings: publicProcedure.input(z.object({ projectId: z.number() })).query(async ({ ctx, input }) => {
    const project = await getCityProjectById(input.projectId);
    if (!project) throw new Error("Project not found");
    if (ctx.user && project.userId !== ctx.user.id && project.userId !== 0) throw new Error("Unauthorized");
    return getBuildingsByProjectId(input.projectId);
  }),
  getTasks: publicProcedure.input(z.object({ projectId: z.number() })).query(async ({ ctx, input }) => {
    const project = await getCityProjectById(input.projectId);
    if (!project) throw new Error("Project not found");
    return getLlmTasksByProjectId(input.projectId);
  }),
  getLogs: publicProcedure.input(z.object({ projectId: z.number() })).query(async ({ ctx, input }) => {
    const project = await getCityProjectById(input.projectId);
    if (!project) throw new Error("Project not found");
    return getCommunicationLogsByProjectId(input.projectId);
  }),
});

export const appRouter = router({ system: systemRouter, auth: authRouter, city: cityRouter });
export type AppRouter = typeof appRouter;
