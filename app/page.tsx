"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Play,
  Sparkle,
  CircleNotch,
  Gear,
  Info,
  GithubLogo,
  Cpu,
  Cube,
  TrendUp,
  City,
  TerminalWindow,
  ArrowRight,
  ShieldCheck,
  Buildings,
  Storefront,
  House,
  OfficeChair,
  Bank
} from "@phosphor-icons/react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { PROJECT_NAME, PROJECT_TAGLINE } from "@/lib/constants";
import { trpc } from "@/lib/trpc/client";
import CityVisualization from "@/components/CityVisualization";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Use shadcn components from @/components/ui
import { Button as ShadcnButton } from "@/components/ui/button";

const ACCESS_CODE = "COGNITECT2024";
const TOTAL_PHASES = 5;

// Physics-driven spring constants
const SPRING_CONFIG = { type: "spring", stiffness: 100, damping: 20 } as const;

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState<number | undefined>();
  const [showAccessCodeDialog, setShowAccessCodeDialog] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [currentPhaseNumber, setCurrentPhaseNumber] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);

  const { data: buildings, refetch: refetchBuildings } = trpc.city.getBuildings.useQuery(
    { projectId: currentProjectId! },
    { enabled: !!currentProjectId, refetchInterval: 2000 }
  );

  const { data: logs } = trpc.city.getLogs.useQuery(
    { projectId: currentProjectId! },
    { enabled: !!currentProjectId, refetchInterval: 2000 }
  );

  const createProject = trpc.city.create.useMutation({
    onSuccess: (data) => {
      setCurrentProjectId(data.projectId);
      setCurrentPhaseNumber(0);
      setIsBuilding(true);
      toast.success("Akira is neural-synthesizing your architectural blueprint!");
      startBuilding.mutate({ projectId: data.projectId });
    },
    onError: (error) => toast.error(`Synthesis Failed: ${error.message}`),
  });

  const startBuilding = trpc.city.startBuilding.useMutation({
    onSuccess: (data) => {
      setCurrentPhaseNumber(1);
      toast.success("Core Infrastructure Synthesized");
      refetchBuildings();
      if (data.hasNextPhase) {
        buildNextPhaseSequentially(2);
      } else {
        setIsBuilding(false);
      }
    },
    onError: (error) => {
      toast.error(`Neural Error: ${error.message}`);
      setIsBuilding(false);
    },
  });

  const buildNextPhase = trpc.city.buildNextPhase.useMutation({
    onSuccess: (data) => {
      setCurrentPhaseNumber(prev => prev + 1);
      toast.success(`Phase: ${data.phaseName} Active`);
      refetchBuildings();
      if (data.hasNextPhase && currentProjectId) {
        const nextPhase = currentPhaseNumber + 2;
        if (nextPhase <= TOTAL_PHASES) {
          buildNextPhaseSequentially(nextPhase);
        }
      } else {
        setIsBuilding(false);
        toast.success("Architectural Synthesis Complete");
      }
    },
    onError: (error) => {
      toast.error(`Synthesis Aborted: ${error.message}`);
      setIsBuilding(false);
    },
  });

  const buildNextPhaseSequentially = (phaseNumber: number) => {
    if (!currentProjectId || phaseNumber > TOTAL_PHASES) {
      setIsBuilding(false);
      return;
    }
    setTimeout(() => {
      buildNextPhase.mutate({ projectId: currentProjectId, phaseNumber });
    }, 15000);
  };

  const handleAccessCodeSubmit = () => {
    if (accessCode === ACCESS_CODE) {
      setShowAccessCodeDialog(false);
      setAccessCode("");
      proceedWithBuilding();
    } else {
      toast.error("Invalid decryption key");
    }
  };

  const proceedWithBuilding = () => {
    const finalPrompt = isAutoMode ? "Create an innovative AI-powered virtual city with creative urban design" : prompt.trim();
    if (!finalPrompt) { toast.error("Provide a neural seed prompt"); return; }
    createProject.mutate({ name: isAutoMode ? "Akira Autonomous Nexus" : "Neural Custom Project", prompt: finalPrompt });
  };

  const handleStartBuilding = () => {
    if (!isAutoMode) { setShowAccessCodeDialog(true); return; }
    proceedWithBuilding();
  };

  const isLoading = createProject.isPending || startBuilding.isPending || buildNextPhase.isPending || isBuilding;
  const totalBuildings = 50;
  const currentBuildings = buildings?.length || 0;
  const progress = Math.min((currentBuildings / totalBuildings) * 100, 100);

  const phases = [
    { name: "Infrastructure", range: [0, 10], icon: <Cpu weight="duotone" className="w-5 h-5" />, phaseNum: 1 },
    { name: "Commercial", range: [10, 22], icon: <Storefront weight="duotone" className="w-5 h-5" />, phaseNum: 2 },
    { name: "Residential", range: [22, 34], icon: <House weight="duotone" className="w-5 h-5" />, phaseNum: 3 },
    { name: "Office", range: [34, 44], icon: <OfficeChair weight="duotone" className="w-5 h-5" />, phaseNum: 4 },
    { name: "Public", range: [44, 50], icon: <Bank weight="duotone" className="w-5 h-5" />, phaseNum: 5 },
  ];

  const currentPhase = phases.find((p) => currentBuildings >= p.range[0] && currentBuildings < p.range[1]) || phases[phases.length - 1];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      <Dialog open={showAccessCodeDialog} onOpenChange={setShowAccessCodeDialog}>
        <DialogContent className="akira-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Access Decryption Required</DialogTitle>
            <DialogDescription className="text-muted-foreground">Neural Manual Mode requires a verified Cognitect key.</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Input
              type="password"
              placeholder="Enter Access Key..."
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAccessCodeSubmit()}
              className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-primary/50 transition-all"
            />
          </div>
          <DialogFooter className="gap-2">
            <ShadcnButton variant="ghost" onClick={() => setShowAccessCodeDialog(false)} className="rounded-2xl">Cancel</ShadcnButton>
            <ShadcnButton onClick={handleAccessCodeSubmit} className="bg-primary hover:bg-primary/80 rounded-2xl px-8 shadow-lg shadow-primary/20">Verify</ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className="border-b border-white/5 backdrop-blur-2xl bg-background/60 sticky top-0 z-[50]">
        <div className="container py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={SPRING_CONFIG}
            className="flex items-center gap-4"
          >
            <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image
                src="/LOGO.png"
                alt={PROJECT_NAME}
                width={48}
                height={48}
                className="relative z-10 object-contain drop-shadow-[0_0_12px_rgba(var(--primary),0.3)]"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase akira-emerald-color">{PROJECT_NAME}</h1>
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground opacity-60 leading-none mt-0.5">{PROJECT_TAGLINE}</p>
            </div>
          </motion.div>
          <div className="flex items-center gap-2">
            <ShadcnButton variant="ghost" size="icon" className="w-10 h-10 rounded-2xl" onClick={() => window.open('https://github.com/succesority/Akira-Intelligence.git', '_blank')}><GithubLogo weight="bold" className="h-5 w-5" /></ShadcnButton>
            <ShadcnButton variant="ghost" size="icon" className="w-10 h-10 rounded-2xl"><Gear weight="bold" className="h-5 w-5" /></ShadcnButton>
            <ShadcnButton variant="ghost" size="icon" className="w-10 h-10 rounded-2xl"><Info weight="bold" className="h-5 w-5" /></ShadcnButton>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 space-y-12 relative z-10">
        <AnimatePresence mode="wait">
          {!currentProjectId ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={SPRING_CONFIG}
              className="max-w-4xl mx-auto"
            >
              <Card className="akira-card p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity">
                  <Buildings size={240} weight="duotone" />
                </div>

                <div className="relative space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black tracking-tight leading-none uppercase">Neural Seed Input</h2>
                      <p className="text-muted-foreground font-medium">Initialize autonomous architectural synthesis</p>
                    </div>
                    <div className="flex items-baseline gap-3 bg-black/20 p-1.5 rounded-full border border-white/5">
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2"
                      >
                        <Switch id="auto-mode" checked={isAutoMode} onCheckedChange={setIsAutoMode} />
                        <Label htmlFor="auto-mode" className="flex items-center gap-2 pr-2 font-bold text-xs uppercase cursor-pointer select-none">
                          <Sparkle weight="fill" className={`w-3.5 h-3.5 ${isAutoMode ? 'text-primary' : 'text-muted-foreground'}`} />
                          {isAutoMode ? "Auto Pulse" : "Manual Link"}
                        </Label>
                      </motion.div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence>
                      {!isAutoMode && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <Textarea
                            placeholder="Seed architectural directives (e.g. Neo-Brutalist Nexus with Vertical Gardens)..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="min-h-[160px] bg-black/20 border-white/5 rounded-3xl p-6 focus:ring-primary/20 text-lg leading-relaxed transition-all placeholder:text-white/10"
                            disabled={isLoading}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <ShadcnButton
                      onClick={handleStartBuilding}
                      disabled={isLoading}
                      className="w-full h-16 rounded-[2rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl tracking-tight transition-all active:scale-[0.98] shadow-2xl shadow-primary/20 hover:shadow-primary/30"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <CircleNotch className="h-6 w-6 animate-spin" />
                          <span>SYNTHESIZING...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Play weight="fill" className="h-6 w-6" />
                          <span>INITIALIZE BLUEPRINT</span>
                        </div>
                      )}
                    </ShadcnButton>

                    {!isAutoMode && (
                      <div className="flex items-center justify-center gap-2 opacity-40">
                        <ShieldCheck weight="duotone" className="w-4 h-4" />
                        <span className="text-[10px] uppercase font-black tracking-widest leading-none">Cognitect Protection Active</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Main Visualization */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-[650px] relative rounded-[2.5rem] overflow-hidden border border-white/10 group shadow-2xl"
              >
                <div className="absolute inset-0 bg-neutral-950 z-[-1]" />
                <CityVisualization projectId={currentProjectId} />

                {/* HUD Elements */}
                <div className="absolute top-8 left-8 p-6 liquid-glass rounded-3xl border-white/10 space-y-1 pointer-events-none">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">Live Feed</p>
                  <h3 className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">City Synthesis Grid</h3>
                </div>

                <div className="absolute bottom-8 left-8 flex items-center gap-4">
                  <div className="liquid-glass p-4 px-6 rounded-full flex items-center gap-3 border-white/10">
                    <span className="w-2 h-2 bg-emerald-500 animate-pulse rounded-full" />
                    <span className="text-xs font-mono font-bold uppercase tracking-tight opacity-80">Autonomous Engine Online</span>
                  </div>
                </div>
              </motion.div>

              {/* Stats & Progress Bento */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="akira-card p-8 lg:col-span-2 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black tracking-tight uppercase">Structural Expansion</h3>
                      <p className="text-xs font-medium text-muted-foreground">Neural synchronization progress</p>
                    </div>
                    <div className="text-4xl font-mono font-black tracking-tighter akira-emerald-color leading-none">
                      {Math.round(progress)}%
                    </div>
                  </div>

                  <div className="space-y-8 relative">
                    <Progress value={progress} className="h-2.5 bg-white/5 border border-white/5" />

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {phases.map((phase) => {
                        const isActive = phase.name === currentPhase.name;
                        const isCompleted = currentBuildings >= phase.range[1];
                        return (
                          <div
                            key={phase.name}
                            className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all duration-500 border ${isActive ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20' : 'bg-white/5 border-transparent'
                              }`}
                          >
                            <div className={`${isActive ? 'akira-emerald-color animate-pulse' : 'opacity-40'}`}>
                              {phase.icon}
                            </div>
                            <span className={`text-[10px] uppercase font-black tracking-widest ${isActive ? 'akira-emerald-color' : 'opacity-60'}`}>
                              {phase.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                <Card className="akira-card p-8 bg-primary/5 border-primary/10">
                  <h3 className="text-xl font-black tracking-tight uppercase mb-8">Asset Analysis</h3>
                  <div className="space-y-6">
                    {[
                      { label: "Total Units", value: currentBuildings, icon: <TrendUp weight="duotone" className="w-5 h-5" /> },
                      { label: "Infrastructure", value: buildings?.filter(b => b.type === 'park').length || 0, icon: <Cpu weight="duotone" className="w-5 h-5" /> },
                      { label: "Commercial", value: buildings?.filter(b => b.type === 'commercial').length || 0, icon: <Storefront weight="duotone" className="w-5 h-5" /> },
                      { label: "Residential", value: buildings?.filter(b => b.type === 'residential').length || 0, icon: <House weight="duotone" className="w-5 h-5" /> },
                    ].map((stat, i) => (
                      <div key={i} className="flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                          <div className="opacity-40 group-hover:opacity-100 group-hover:akira-emerald-color transition-all">
                            {stat.icon}
                          </div>
                          <span className="text-xs uppercase font-black tracking-widest opacity-40 group-hover:opacity-100 group-hover:text-foreground transition-all">
                            {stat.label}
                          </span>
                        </div>
                        <span className="text-2xl font-mono font-black tracking-tighter">{stat.value}</span>
                      </div>
                    ))}

                    <div className="pt-6 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Phase Lock</span>
                        <div className="flex items-center gap-2 group-hover:scale-105 transition-transform cursor-pointer">
                          <span className="text-sm font-bold akira-emerald-color uppercase tracking-tight">{currentPhase.name}</span>
                          <ArrowRight className="w-4 h-4 akira-emerald-color" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Terminal & Blueprints */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="akira-card p-8 flex flex-col h-[500px]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <TerminalWindow weight="duotone" className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-black tracking-tight uppercase">Neural Stream</h3>
                    </div>
                    <span className="text-[10px] font-mono font-black opacity-30 select-none">SYSLOG_V2.0</span>
                  </div>

                  <div className="flex-1 overflow-y-auto terminal-text pr-2 space-y-4 hide-scrollbar">
                    {logs && logs.length > 0 ? logs.map((log, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={idx}
                        className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2 group hover:bg-black/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-tighter akira-emerald-color">Akira Engine</span>
                          </div>
                          <span className="text-[9px] font-mono opacity-30">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-white/80">{log.message}</p>
                      </motion.div>
                    )) : (
                      <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
                        <CircleNotch className="w-12 h-12 animate-spin" />
                        <p className="text-xs uppercase font-black tracking-widest">Awaiting Neural Link...</p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="akira-card p-8 flex flex-col h-[500px]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Buildings weight="duotone" className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-black tracking-tight uppercase">Synthesis Queue</h3>
                    </div>
                    <span className="text-[10px] font-mono font-black opacity-30 select-none">BLUEPRINT_DB</span>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 hide-scrollbar">
                    {buildings && buildings.length > 0 ? buildings.map((b, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx}
                        className="p-4 rounded-[1.5rem] bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-primary/5 hover:border-primary/20 transition-all cursor-default"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-primary border border-white/5 group-hover:scale-110 transition-transform">
                            {b.type === 'residential' ? <House weight="duotone" /> :
                              b.type === 'commercial' ? <Storefront weight="duotone" /> :
                                b.type === 'park' ? <Cpu weight="duotone" /> : <City weight="duotone" />}
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase tracking-tight">{b.name}</p>
                            <p className="text-[10px] font-mono opacity-40 uppercase">{b.type} • {b.width}x{b.depth}x{b.height}m</p>
                          </div>
                        </div>
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                      </motion.div>
                    )) : (
                      <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
                        <Buildings className="w-12 h-12" />
                        <p className="text-xs uppercase font-black tracking-widest">No Active Blueprints</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-12 relative z-10 bg-background/40 backdrop-blur-md">
        <div className="container flex flex-col items-center gap-6">
          <div className="flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all group">
            <div className="flex items-center gap-2">
              <Image
                src="/LOGO.png"
                alt="Logo"
                width={20}
                height={20}
                className="opacity-60 group-hover:opacity-100 transition-opacity"
              />
              <span className="text-xs font-black uppercase tracking-widest">NeuralOS</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck weight="duotone" className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Cognitect</span>
            </div>
          </div>
          <div className="max-w-2xl text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Powered by the <span className="akira-emerald-color font-black uppercase">Akira Synthesis Engine</span>.
              Designed for autonomous architectural generation and neural nexus coordination.
            </p>
            <p className="text-[10px] uppercase font-black tracking-[0.4em] opacity-20">
              © 2026 AKIRA INTELLIGENCE • ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
