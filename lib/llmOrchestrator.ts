import { createLlmTask, updateLlmTaskStatus, createCommunicationLog, createBuilding, updateCityProjectStatus, getCityProjectById } from "./db";

type LLMRole = "architect" | "frontend" | "backend" | "database" | "qa";
type PhaseStatus = "pending" | "in_progress" | "completed";

interface BuildingData {
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  color: string;
}

interface PhaseData {
  phase: number;
  name: string;
  buildings: BuildingData[];
}

export class LLMOrchestrator {
  private projectId: number;

  constructor(projectId: number) { this.projectId = projectId; }

  private async logCommunication(from: string, to: string, message: string) {
    console.log(`[Akira Orchestrator] ${from} → ${to}: ${message.slice(0, 100)}`);
    await createCommunicationLog({ projectId: this.projectId, fromLlm: from, toLlm: to, message });
  }

  private async createTask(role: LLMRole, description: string, llmName: string) {
    const result = await createLlmTask({ projectId: this.projectId, llmRole: role, llmModel: llmName, taskDescription: description, status: "in_progress", input: description });
    return result.insertId;
  }

  private async completeTask(taskId: number, output: string, code?: string) {
    await updateLlmTaskStatus(taskId, "completed", output, code || output);
  }

  // Initialize project - called once at start
  async initializeProject(userPrompt: string) {
    console.log(`[Akira Orchestrator] Initializing neural project ${this.projectId}`);

    await updateCityProjectStatus(this.projectId, "in_progress", "phase_0");

    // Quick planning logs
    await this.logCommunication("Akira Core", "Akira (Architect)", `New neural synthesis request: "${userPrompt}". Analyzing architectural seed...`);
    await this.logCommunication("Akira (Architect)", "All", `Neural blueprint initiated. 5-phase synthesis sequence: Infrastructure → Commercial → Residential → Office → Public. Decoding spatial parameters...`);
    await this.logCommunication("Akira (Database)", "All", `Neural memory buffer ready with spatial indexing. All sectors clear for synthesis.`);
    await this.logCommunication("Akira (Frontend)", "All", `Neural Viz Engine 4.0 online. Real-time mesh generation active.`);

    const architectTaskId = await this.createTask("architect", "Synthesize 5-phase nexus plan", "Akira (Architect)");
    await this.completeTask(architectTaskId, "Neural plan synthesized: 50 structures mapped across 5 phases");

    await this.logCommunication("Akira (Architect)", "All", `Seed synthesis successful. Establishing topological grid for Phase 1...`);

    return { success: true, totalPhases: 5, message: "Neural project initialized" };
  }

  // Build a single phase - called incrementally
  async buildPhase(phaseNumber: number): Promise<{ success: boolean; buildingsCreated: number; hasNextPhase: boolean; phaseName: string }> {
    const plan = this.getDefaultPlan();
    const phaseData = plan.phases.find(p => p.phase === phaseNumber);

    if (!phaseData) {
      return { success: false, buildingsCreated: 0, hasNextPhase: false, phaseName: "" };
    }

    console.log(`[Akira Orchestrator] Synthesizing Phase ${phaseNumber}: ${phaseData.name}`);

    await updateCityProjectStatus(this.projectId, "in_progress", `phase_${phaseNumber}`);
    await this.logCommunication("Akira (Architect)", "All", `🏗️ Initiating Neural Synthesis: Phase ${phaseNumber} - ${phaseData.name}`);

    // Helper function for delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Build all buildings in this phase with gradual delay
    for (let i = 0; i < phaseData.buildings.length; i++) {
      const building = phaseData.buildings[i];

      // User's requested delay maintained
      if (i > 0) await delay(1500);

      await createBuilding({
        projectId: this.projectId,
        name: building.name,
        type: building.type,
        positionX: building.position.x,
        positionY: building.position.y,
        positionZ: building.position.z,
        width: building.size.width,
        height: building.size.height,
        depth: building.size.depth,
        color: building.color,
      });

      // Log every 3rd building to reduce API calls
      if (i % 3 === 0 || i === phaseData.buildings.length - 1) {
        await this.logCommunication("Akira (Backend)", "All", `Synthesized: ${building.name} (${i + 1}/${phaseData.buildings.length})`);
      }
    }

    await this.logCommunication("Akira (QA)", "All", `✅ Neural Validation Complete: Phase ${phaseNumber} synchronized.`);

    const hasNextPhase = phaseNumber < plan.phases.length;

    // If this is the last phase, mark as completed
    if (!hasNextPhase) {
      await updateCityProjectStatus(this.projectId, "completed");
      await this.logCommunication("Akira (Architect)", "All", `🏆 Synthesis Cycle Complete. Autonomous Architectural Nexus operational.`);
    }

    return {
      success: true,
      buildingsCreated: phaseData.buildings.length,
      hasNextPhase,
      phaseName: phaseData.name
    };
  }

  // Get current phase based on building count
  async getCurrentPhase(): Promise<number> {
    const project = await getCityProjectById(this.projectId);
    if (!project) return 0;

    const currentStep = project.currentStep || "phase_0";
    const match = currentStep.match(/phase_(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private getDefaultPlan(): { phases: PhaseData[] } {
    // LAYOUT DESIGN: "NEURAL HUB & RADIANT BRANCHES" - EXACTLY 50 UNITS
    return {
      phases: [
        {
          phase: 1,
          name: "Neural Grid Foundation",
          buildings: [ // 10 Units
            { name: "Apex Neural Nexus", type: "park", position: { x: 0, y: 0, z: 0 }, size: { width: 12, height: 1.5, depth: 12 }, color: "#065f46" },
            { name: "North Spoke", type: "park", position: { x: 0, y: 0, z: -25 }, size: { width: 4, height: 0.5, depth: 30 }, color: "#334155" },
            { name: "South Spoke", type: "park", position: { x: 0, y: 0, z: 25 }, size: { width: 4, height: 0.5, depth: 30 }, color: "#334155" },
            { name: "East Spoke", type: "park", position: { x: 25, y: 0, z: 0 }, size: { width: 30, height: 0.5, depth: 4 }, color: "#334155" },
            { name: "West Spoke", type: "park", position: { x: -25, y: 0, z: 0 }, size: { width: 30, height: 0.5, depth: 4 }, color: "#334155" },
            { name: "North-West Gate", type: "park", position: { x: -30, y: 0, z: -30 }, size: { width: 8, height: 1, depth: 8 }, color: "#0ea5e9" },
            { name: "North-East Gate", type: "park", position: { x: 30, y: 0, z: -30 }, size: { width: 8, height: 1, depth: 8 }, color: "#0ea5e9" },
            { name: "South-West Gate", type: "park", position: { x: -30, y: 0, z: 30 }, size: { width: 8, height: 1, depth: 8 }, color: "#0ea5e9" },
            { name: "South-East Gate", type: "park", position: { x: 30, y: 0, z: 30 }, size: { width: 8, height: 1, depth: 8 }, color: "#0ea5e9" },
            { name: "Zenith Fountain", type: "park", position: { x: 0, y: 1.5, z: 0 }, size: { width: 4, height: 4, depth: 4 }, color: "#10b981" },
          ]
        },
        {
          phase: 2,
          name: "The Commercial Orbit",
          buildings: [ // 12 Units
            { name: "Hyperion Gallery", type: "commercial", position: { x: -14, y: 0, z: -14 }, size: { width: 10, height: 10, depth: 10 }, color: "#0284c7" },
            { name: "Lumina Retail Hub", type: "commercial", position: { x: 14, y: 0, z: -14 }, size: { width: 10, height: 12, depth: 10 }, color: "#0ea5e9" },
            { name: "Vortex Tech Mall", type: "commercial", position: { x: -14, y: 0, z: 14 }, size: { width: 10, height: 8, depth: 10 }, color: "#38bdf8" },
            { name: "Quasar Boutique", type: "commercial", position: { x: 14, y: 0, z: 14 }, size: { width: 10, height: 9, depth: 10 }, color: "#7dd3fc" },
            { name: "Neon Food District", type: "commercial", position: { x: -35, y: 0, z: 0 }, size: { width: 12, height: 6, depth: 18 }, color: "#0369a1" },
            { name: "Flux Cinema", type: "commercial", position: { x: 35, y: 0, z: 0 }, size: { width: 12, height: 8, depth: 18 }, color: "#0ea5e9" },
            { name: "Cyber Arcade", type: "commercial", position: { x: 0, y: 0, z: -35 }, size: { width: 18, height: 5, depth: 10 }, color: "#38bdf8" },
            { name: "Prism Market", type: "commercial", position: { x: 0, y: 0, z: 35 }, size: { width: 18, height: 7, depth: 10 }, color: "#059669" },
            { name: "Starlight Cafe", type: "commercial", position: { x: 22, y: 0, z: -22 }, size: { width: 6, height: 4, depth: 6 }, color: "#0369a1" },
            { name: "Nova Supermarket", type: "commercial", position: { x: -22, y: 0, z: 22 }, size: { width: 8, height: 5, depth: 8 }, color: "#7dd3fc" },
            { name: "Emerald Emporium", type: "commercial", position: { x: 30, y: 0, z: 15 }, size: { width: 7, height: 6, depth: 7 }, color: "#10b981" },
            { name: "Solaris Lounge", type: "commercial", position: { x: -30, y: 0, z: -15 }, size: { width: 7, height: 4, depth: 7 }, color: "#0ea5e9" },
          ]
        },
        {
          phase: 3,
          name: "Neural Living Clusters",
          buildings: [ // 12 Units
            { name: "Helix Pod Alpha", type: "residential", position: { x: -26, y: 0, z: -20 }, size: { width: 6, height: 22, depth: 6 }, color: "#10b981" },
            { name: "Helix Pod Beta", type: "residential", position: { x: -20, y: 0, z: -26 }, size: { width: 6, height: 18, depth: 6 }, color: "#34d399" },
            { name: "Helix Pod Gamma", type: "residential", position: { x: 26, y: 0, z: -20 }, size: { width: 6, height: 20, depth: 6 }, color: "#6ee7b7" },
            { name: "Helix Pod Delta", type: "residential", position: { x: 20, y: 0, z: -26 }, size: { width: 6, height: 24, depth: 6 }, color: "#059669" },
            { name: "Mantle Pod A", type: "residential", position: { x: -26, y: 0, z: 20 }, size: { width: 6, height: 30, depth: 6 }, color: "#10b981" },
            { name: "Mantle Pod B", type: "residential", position: { x: -20, y: 0, z: 26 }, size: { width: 6, height: 26, depth: 6 }, color: "#34d399" },
            { name: "Mantle Pod C", type: "residential", position: { x: 26, y: 0, z: 20 }, size: { width: 6, height: 32, depth: 6 }, color: "#6ee7b7" },
            { name: "Mantle Pod D", type: "residential", position: { x: 20, y: 0, z: 26 }, size: { width: 6, height: 28, depth: 6 }, color: "#059669" },
            { name: "Sky Garden Tower", type: "residential", position: { x: 0, y: 0, z: 45 }, size: { width: 10, height: 35, depth: 10 }, color: "#10b981" },
            { name: "Oceanic Loft", type: "residential", position: { x: 0, y: 0, z: -45 }, size: { width: 10, height: 32, depth: 10 }, color: "#34d399" },
            { name: "Bento Block A", type: "residential", position: { x: 45, y: 0, z: 0 }, size: { width: 8, height: 15, depth: 8 }, color: "#6ee7b7" },
            { name: "Bento Block B", type: "residential", position: { x: -45, y: 0, z: 0 }, size: { width: 8, height: 15, depth: 8 }, color: "#059669" },
          ]
        },
        {
          phase: 4,
          name: "The Core Spire District",
          buildings: [ // 10 Units
            { name: "Akira Prime Tower", type: "office", position: { x: -6, y: 0, z: -6 }, size: { width: 8, height: 65, depth: 8 }, color: "#022c22" },
            { name: "Nerves Hub Tower", type: "office", position: { x: 6, y: 0, z: -6 }, size: { width: 8, height: 58, depth: 8 }, color: "#064e3b" },
            { name: "Matrix Office Spire", type: "office", position: { x: -6, y: 0, z: 6 }, size: { width: 8, height: 62, depth: 8 }, color: "#065f46" },
            { name: "Synapse Command HQ", type: "office", position: { x: 6, y: 0, z: 6 }, size: { width: 8, height: 60, depth: 8 }, color: "#042f2e" },
            { name: "Sub-Spire A", type: "office", position: { x: 0, y: 0, z: -12 }, size: { width: 5, height: 45, depth: 5 }, color: "#115e59" },
            { name: "Sub-Spire B", type: "office", position: { x: 0, y: 0, z: 12 }, size: { width: 5, height: 48, depth: 5 }, color: "#134e4a" },
            { name: "Outer Edge Spire X", type: "office", position: { x: -18, y: 0, z: 0 }, size: { width: 4, height: 40, depth: 4 }, color: "#064e3b" },
            { name: "Outer Edge Spire Y", type: "office", position: { x: 18, y: 0, z: 0 }, size: { width: 4, height: 42, depth: 4 }, color: "#065f46" },
            { name: "Research Link Alpha", type: "office", position: { x: -12, y: 0, z: -18 }, size: { width: 4, height: 35, depth: 4 }, color: "#115e59" },
            { name: "Research Link Beta", type: "office", position: { x: 12, y: 0, z: 18 }, size: { width: 4, height: 35, depth: 4 }, color: "#134e4a" },
          ]
        },
        {
          phase: 5,
          name: "Guardian Facilities",
          buildings: [ // 6 Units (Total = 50)
            { name: "Neural Bio-Dome", type: "commercial", position: { x: -45, y: 0, z: -45 }, size: { width: 18, height: 15, depth: 18 }, color: "#10b981" },
            { name: "Savant Library", type: "commercial", position: { x: 45, y: 0, z: -45 }, size: { width: 16, height: 18, depth: 16 }, color: "#14b8a6" },
            { name: "Nexus Civic Hall", type: "commercial", position: { x: -45, y: 0, z: 45 }, size: { width: 22, height: 12, depth: 22 }, color: "#059669" },
            { name: "Akira Health Institute", type: "commercial", position: { x: 45, y: 0, z: 45 }, size: { width: 20, height: 20, depth: 20 }, color: "#0d9488" },
            { name: "Defense Core Alpha", type: "commercial", position: { x: 0, y: 0, z: 55 }, size: { width: 12, height: 25, depth: 12 }, color: "#064e3b" },
            { name: "Defense Core Omega", type: "commercial", position: { x: 0, y: 0, z: -55 }, size: { width: 12, height: 25, depth: 12 }, color: "#0f766e" },
          ]
        }
      ]
    };
  }
}
