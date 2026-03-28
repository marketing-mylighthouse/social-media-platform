"use client";

import { Handle, Position } from "@xyflow/react";

interface FileNodeData {
  label: string;
  fileType: "skill" | "config" | "output" | "data" | "asset";
  path: string;
  description?: string;
}

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  skill: { icon: "🧠", color: "text-purple-400", bg: "border-purple-500/30 bg-purple-500/5" },
  config: { icon: "⚙️", color: "text-cyan-400", bg: "border-cyan-500/30 bg-cyan-500/5" },
  output: { icon: "📄", color: "text-green-400", bg: "border-green-500/30 bg-green-500/5" },
  data: { icon: "💾", color: "text-yellow-400", bg: "border-yellow-500/30 bg-yellow-500/5" },
  asset: { icon: "🖼️", color: "text-orange-400", bg: "border-orange-500/30 bg-orange-500/5" },
};

export default function FileNode({ data }: { data: FileNodeData }) {
  const config = typeConfig[data.fileType] || typeConfig.config;

  return (
    <div className={`rounded-lg border ${config.bg} backdrop-blur-sm shadow-md min-w-[200px] max-w-[240px] overflow-hidden transition-all duration-200 hover:shadow-lg`}>
      <Handle type="target" position={Position.Left} className="!bg-zinc-600 !w-2.5 !h-2.5 !border-2 !border-zinc-900" />

      <div className="px-3 py-2.5 flex items-center gap-2.5">
        <span className="text-base">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className={`text-xs font-semibold ${config.color} truncate`}>{data.label}</h4>
          <p className="text-[10px] text-zinc-600 font-mono truncate">{data.path}</p>
        </div>
      </div>

      {data.description && (
        <div className="px-3 pb-2.5 -mt-0.5">
          <p className="text-[10px] text-zinc-500">{data.description}</p>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-zinc-600 !w-2.5 !h-2.5 !border-2 !border-zinc-900" />
    </div>
  );
}
