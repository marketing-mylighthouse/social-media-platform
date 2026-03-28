"use client";

import { Handle, Position } from "@xyflow/react";

type Status = "idle" | "running" | "success" | "error" | "waiting";

interface PipelineNodeData {
  label: string;
  description: string;
  status: Status;
  icon: string;
  accent: string;
  details?: string[];
  stage?: string;
}

const statusConfig: Record<Status, { dot: string; label: string; bg: string }> = {
  idle: { dot: "bg-zinc-500", label: "Idle", bg: "bg-zinc-500/10" },
  running: { dot: "bg-blue-500 animate-pulse", label: "Running", bg: "bg-blue-500/10" },
  success: { dot: "bg-green-500", label: "Done", bg: "bg-green-500/10" },
  error: { dot: "bg-red-500", label: "Error", bg: "bg-red-500/10" },
  waiting: { dot: "bg-yellow-500 animate-pulse", label: "Waiting", bg: "bg-yellow-500/10" },
};

export default function PipelineNode({ data }: { data: PipelineNodeData }) {
  const status = statusConfig[data.status];

  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-sm shadow-xl min-w-[280px] max-w-[320px] overflow-hidden transition-all duration-200 hover:border-zinc-700 hover:shadow-2xl"
      style={{ borderTopColor: data.accent, borderTopWidth: "3px" }}
    >
      <Handle type="target" position={Position.Left} className="!bg-zinc-600 !w-3 !h-3 !border-2 !border-zinc-900" />

      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: data.accent + "20" }}
        >
          {data.icon}
        </div>
        <div className="flex-1 min-w-0">
          {data.stage && (
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-0.5">
              {data.stage}
            </div>
          )}
          <h3 className="text-sm font-semibold text-zinc-100 truncate">{data.label}</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium ${status.bg}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          <span className="text-zinc-300">{status.label}</span>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-xs text-zinc-500 leading-relaxed">{data.description}</p>
      </div>

      {/* Details */}
      {data.details && data.details.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {data.details.map((detail, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] text-zinc-400 font-mono"
            >
              {detail}
            </span>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-zinc-600 !w-3 !h-3 !border-2 !border-zinc-900" />
    </div>
  );
}
