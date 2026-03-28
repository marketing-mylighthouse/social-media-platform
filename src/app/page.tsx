"use client";

import dynamic from "next/dynamic";

const WorkflowBoard = dynamic(
  () => import("@/components/workflow/WorkflowBoard"),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            S
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">Social Media Engine</h1>
            <p className="text-[11px] text-zinc-500">Pipeline Architecture — Workflow View</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-3 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="w-5 h-0.5 bg-zinc-600 inline-block" /> Pipeline
            </span>
            <span className="flex items-center gap-1">
              <span className="w-5 h-0.5 border-t border-dashed border-zinc-600 inline-block" /> File/Data
            </span>
            <span className="flex items-center gap-1">
              <span className="w-5 h-0.5 bg-yellow-500 inline-block" /> Feedback Loop
            </span>
            <span className="flex items-center gap-1">
              <span className="w-5 h-0.5 bg-green-500 inline-block" /> Approved
            </span>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-zinc-400">System Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Workflow Board */}
      <main className="flex-1 relative">
        <WorkflowBoard />
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-2 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-4 text-[10px] text-zinc-600">
          <span>14 companies</span>
          <span>6 pipeline stages</span>
          <span>2 AI skills</span>
        </div>
        <div className="text-[10px] text-zinc-600">
          Drag to pan · Scroll to zoom · Click nodes for details
        </div>
      </footer>
    </div>
  );
}
