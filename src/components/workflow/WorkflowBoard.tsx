"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import PipelineNode from "./PipelineNode";
import FileNode from "./FileNode";

const nodeTypes: NodeTypes = {
  pipeline: PipelineNode,
  file: FileNode,
};

// ============================================================
// NODES — Pipeline stages + files/skills
// ============================================================

const initialNodes: Node[] = [
  // ── PIPELINE STAGES ──────────────────────────────────────

  {
    id: "wizard",
    type: "pipeline",
    position: { x: 80, y: 300 },
    data: {
      label: "Campaign Wizard",
      description: "User fills in: company, dates, frequency, themes, and recommendations.",
      status: "idle",
      icon: "📝",
      accent: "#3b82f6",
      stage: "Stage 0 — Input",
      details: ["company", "period", "frequency", "themes"],
    },
  },
  {
    id: "generate",
    type: "pipeline",
    position: { x: 500, y: 200 },
    data: {
      label: "AI Campaign Generation",
      description: "Claude Agent SDK reads skills, brand guide, feedback rules and generates the full campaign.",
      status: "idle",
      icon: "🤖",
      accent: "#a855f7",
      stage: "Stage 1 — Generate",
      details: ["Agent SDK", "campaign-planner", "creative-builder", "Puppeteer"],
    },
  },
  {
    id: "render",
    type: "pipeline",
    position: { x: 500, y: 480 },
    data: {
      label: "Render & Upload",
      description: "HTML → PNG via Puppeteer. PNGs uploaded to Supabase Storage. Records saved to database.",
      status: "idle",
      icon: "🎨",
      accent: "#f97316",
      stage: "Stage 1b — Render",
      details: ["Puppeteer", "Supabase Storage", "PostgreSQL"],
    },
  },
  {
    id: "internal-review",
    type: "pipeline",
    position: { x: 980, y: 200 },
    data: {
      label: "Internal Review",
      description: "Marketing team reviews each post: Approve, Suggest Edit, or Remove. Magic link access via email.",
      status: "idle",
      icon: "👁️",
      accent: "#06b6d4",
      stage: "Stage 2 — Internal Review",
      details: ["email notification", "magic link", "post-by-post"],
    },
  },
  {
    id: "feedback-ai",
    type: "pipeline",
    position: { x: 980, y: 480 },
    data: {
      label: "AI Feedback Processing",
      description: "AI reads reviewer feedback, regenerates affected posts, extracts rules for machine learning.",
      status: "idle",
      icon: "🔄",
      accent: "#eab308",
      stage: "Stage 3 — Learn & Revise",
      details: ["regenerate posts", "extract rules", "update examples"],
    },
  },
  {
    id: "client-review",
    type: "pipeline",
    position: { x: 1460, y: 200 },
    data: {
      label: "Client Review",
      description: "Company managers review approved content. Same interface, branded with client's colours.",
      status: "idle",
      icon: "✅",
      accent: "#22c55e",
      stage: "Stage 4 — Client Review",
      details: ["branded UI", "magic link", "client approvers"],
    },
  },
  {
    id: "schedule",
    type: "pipeline",
    position: { x: 1460, y: 480 },
    data: {
      label: "Auto Schedule",
      description: "Fully approved posts are sent to scheduling API. Published across Instagram, LinkedIn, Facebook.",
      status: "idle",
      icon: "📅",
      accent: "#10b981",
      stage: "Stage 5 — Publish",
      details: ["scheduling API", "Instagram", "LinkedIn", "Facebook"],
    },
  },

  // ── FILE / SKILL NODES ───────────────────────────────────

  {
    id: "file-claude-md",
    type: "file",
    position: { x: 280, y: 30 },
    data: {
      label: "CLAUDE.md",
      fileType: "config",
      path: "engine/CLAUDE.md",
      description: "Master orchestration rules",
    },
  },
  {
    id: "file-campaign-planner",
    type: "file",
    position: { x: 500, y: 30 },
    data: {
      label: "campaign-planner",
      fileType: "skill",
      path: "engine/skills/campaign-planner/",
      description: "Plans campaigns → brief JSON",
    },
  },
  {
    id: "file-creative-builder",
    type: "file",
    position: { x: 740, y: 30 },
    data: {
      label: "creative-builder",
      fileType: "skill",
      path: "engine/skills/creative-builder/",
      description: "Builds visuals → HTML → PNG",
    },
  },
  {
    id: "file-brand-guide",
    type: "file",
    position: { x: 80, y: 100 },
    data: {
      label: "Brand Guide",
      fileType: "config",
      path: "companies/{slug}/brand/",
      description: "Colours, fonts, tone, audience",
    },
  },
  {
    id: "file-company-json",
    type: "file",
    position: { x: 80, y: 180 },
    data: {
      label: "company.json",
      fileType: "config",
      path: "companies/{slug}/config/",
      description: "Company metadata & settings",
    },
  },
  {
    id: "file-campaign-brief",
    type: "file",
    position: { x: 740, y: 620 },
    data: {
      label: "campaign-brief.json",
      fileType: "output",
      path: "campaigns/YYYY-MM/",
      description: "Generated campaign plan",
    },
  },
  {
    id: "file-feedback-rules",
    type: "file",
    position: { x: 980, y: 660 },
    data: {
      label: "feedback-rules.md",
      fileType: "data",
      path: "companies/{slug}/config/",
      description: "Accumulated AI learning rules",
    },
  },
  {
    id: "file-photos",
    type: "file",
    position: { x: 280, y: 560 },
    data: {
      label: "Photo Library",
      fileType: "asset",
      path: "companies/{slug}/assets/photos/",
      description: "Agent reads & selects visually",
    },
  },
  {
    id: "file-pngs",
    type: "file",
    position: { x: 500, y: 660 },
    data: {
      label: "Rendered PNGs",
      fileType: "output",
      path: "→ Supabase Storage",
      description: "Final images served to web",
    },
  },

  // ── DATABASE ─────────────────────────────────────────────

  {
    id: "db-supabase",
    type: "file",
    position: { x: 1200, y: 660 },
    data: {
      label: "Supabase",
      fileType: "data",
      path: "PostgreSQL + Storage + Auth",
      description: "Database, images, auth, realtime",
    },
  },
];

// ============================================================
// EDGES — Connections between nodes
// ============================================================

const edgeDefaults = {
  animated: false,
  style: { stroke: "#3f3f46", strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#3f3f46", width: 16, height: 16 },
};

const activeEdge = {
  animated: true,
  style: { stroke: "#a855f7", strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7", width: 16, height: 16 },
};

const fileEdge = {
  animated: false,
  style: { stroke: "#27272a", strokeWidth: 1, strokeDasharray: "4 4" },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#27272a", width: 12, height: 12 },
};

const initialEdges: Edge[] = [
  // Main pipeline flow
  { id: "e-wizard-generate", source: "wizard", target: "generate", ...edgeDefaults },
  { id: "e-generate-render", source: "generate", target: "render", ...edgeDefaults },
  { id: "e-render-internal", source: "render", target: "internal-review", ...edgeDefaults },
  { id: "e-internal-feedback", source: "internal-review", target: "feedback-ai", label: "changes requested", ...edgeDefaults, style: { ...edgeDefaults.style, stroke: "#eab308" }, markerEnd: { ...edgeDefaults.markerEnd, color: "#eab308" } },
  { id: "e-feedback-internal", source: "feedback-ai", target: "internal-review", label: "revised", ...edgeDefaults, style: { ...edgeDefaults.style, stroke: "#eab308" }, markerEnd: { ...edgeDefaults.markerEnd, color: "#eab308" } },
  { id: "e-internal-client", source: "internal-review", target: "client-review", label: "all approved", ...edgeDefaults, style: { ...edgeDefaults.style, stroke: "#22c55e" }, markerEnd: { ...edgeDefaults.markerEnd, color: "#22c55e" } },
  { id: "e-client-feedback", source: "client-review", target: "feedback-ai", label: "changes requested", ...edgeDefaults, style: { ...edgeDefaults.style, stroke: "#eab308" }, markerEnd: { ...edgeDefaults.markerEnd, color: "#eab308" } },
  { id: "e-client-schedule", source: "client-review", target: "schedule", label: "all approved", ...edgeDefaults, style: { ...edgeDefaults.style, stroke: "#10b981" }, markerEnd: { ...edgeDefaults.markerEnd, color: "#10b981" } },

  // File → Pipeline connections (dashed)
  { id: "e-claude-generate", source: "file-claude-md", target: "generate", ...fileEdge },
  { id: "e-planner-generate", source: "file-campaign-planner", target: "generate", ...fileEdge },
  { id: "e-builder-generate", source: "file-creative-builder", target: "generate", ...fileEdge },
  { id: "e-brand-wizard", source: "file-brand-guide", target: "wizard", ...fileEdge },
  { id: "e-company-wizard", source: "file-company-json", target: "wizard", ...fileEdge },
  { id: "e-brand-generate", source: "file-brand-guide", target: "generate", ...fileEdge },
  { id: "e-photos-render", source: "file-photos", target: "render", ...fileEdge },
  { id: "e-render-pngs", source: "render", target: "file-pngs", ...fileEdge },
  { id: "e-generate-brief", source: "generate", target: "file-campaign-brief", ...fileEdge },
  { id: "e-feedback-rules", source: "feedback-ai", target: "file-feedback-rules", ...fileEdge },
  { id: "e-rules-generate", source: "file-feedback-rules", target: "generate", ...fileEdge },

  // Supabase connections
  { id: "e-pngs-supabase", source: "file-pngs", target: "db-supabase", ...fileEdge },
  { id: "e-supabase-internal", source: "db-supabase", target: "internal-review", ...fileEdge },
  { id: "e-supabase-client", source: "db-supabase", target: "client-review", ...fileEdge },
  { id: "e-supabase-schedule", source: "db-supabase", target: "schedule", ...fileEdge },
];

// ============================================================
// COMPONENT
// ============================================================

export default function WorkflowBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={1.5}
        defaultEdgeOptions={edgeDefaults}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1a1a1e" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "file") return "#3f3f46";
            const accent = (node.data as any)?.accent;
            return accent || "#3f3f46";
          }}
          maskColor="rgba(0,0,0,0.7)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
