"use client";

import { useState, useEffect } from "react";

interface DetailPanelProps {
  nodeId: string | null;
  nodeData: any | null;
  onClose: () => void;
}

interface FileData {
  label: string;
  path: string;
  type: string;
  content?: string | null;
  rules?: { category: string; rules: string[] }[];
  parsed?: any;
  totalRules?: number;
  feedbackRules?: string | null;
}

// Map node IDs to API calls
function getApiUrl(nodeId: string, companySlug?: string): string | null {
  const base = "/api/engine/files";
  switch (nodeId) {
    case "file-claude-md":
      return `${base}?type=claude-md`;
    case "file-campaign-planner":
      return `${base}?type=skill&name=campaign-planner`;
    case "file-creative-builder":
      return `${base}?type=skill&name=creative-builder`;
    case "file-brand-guide":
      return companySlug ? `${base}?type=brand-guide&company=${companySlug}` : null;
    case "file-company-json":
      return companySlug ? `${base}?type=company-config&company=${companySlug}` : null;
    case "file-feedback-rules":
      return companySlug ? `${base}?type=feedback-rules&company=${companySlug}` : null;
    case "file-campaign-brief":
      return companySlug ? `${base}?type=campaign-brief&company=${companySlug}&period=2026-04` : null;
    case "generate":
    case "feedback-ai":
      return `${base}?type=global-creative-rules`;
    case "db-supabase":
      return "/api/engine/status";
    default:
      return null;
  }
}

export default function DetailPanel({ nodeId, nodeData, onClose }: DetailPanelProps) {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("qcc");
  const [companies, setCompanies] = useState<any[]>([]);

  // Load companies list
  useEffect(() => {
    fetch("/api/engine/companies")
      .then((r) => r.json())
      .then(setCompanies)
      .catch(() => {});
  }, []);

  // Load file data when node changes
  useEffect(() => {
    if (!nodeId) {
      setFileData(null);
      return;
    }

    const url = getApiUrl(nodeId, selectedCompany);
    if (!url) {
      setFileData(null);
      return;
    }

    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setFileData(data);
        setLoading(false);
      })
      .catch(() => {
        setFileData(null);
        setLoading(false);
      });
  }, [nodeId, selectedCompany]);

  if (!nodeId) return null;

  const isCompanySpecific = [
    "file-brand-guide",
    "file-company-json",
    "file-feedback-rules",
    "file-campaign-brief",
  ].includes(nodeId);

  return (
    <div className="w-[420px] h-full border-l border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: nodeData?.accent || "#3f3f46" }}
          />
          <h3 className="text-sm font-semibold text-zinc-100 truncate">
            {nodeData?.label || nodeId}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none px-1"
        >
          ×
        </button>
      </div>

      {/* Company selector for company-specific files */}
      {isCompanySpecific && (
        <div className="px-4 py-2 border-b border-zinc-800 shrink-0">
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
            Company
          </label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600"
          >
            {companies.map((c: any) => (
              <option key={c.slug} value={c.slug}>
                {c.short_name || c.name} — {c.slug}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
          </div>
        ) : fileData ? (
          <div className="p-4 space-y-4">
            {/* File path */}
            {fileData.path && (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-600 font-mono truncate">
                  {fileData.path}
                </span>
              </div>
            )}

            {/* Feedback rules view */}
            {fileData.rules && fileData.rules.length > 0 && (
              <div className="space-y-3">
                {fileData.totalRules !== undefined && (
                  <div className="text-xs text-zinc-500">
                    {fileData.totalRules} rules across{" "}
                    {fileData.rules.length} categories
                  </div>
                )}
                {fileData.rules.map((section, i) => (
                  <div key={i}>
                    <h4 className="text-xs font-semibold text-zinc-400 mb-1.5">
                      {section.category}
                    </h4>
                    <div className="space-y-1">
                      {section.rules.map((rule, j) => (
                        <div
                          key={j}
                          className="flex items-start gap-2 px-2 py-1.5 rounded bg-zinc-900/50 border border-zinc-800/50"
                        >
                          <span className="text-green-500 text-xs mt-0.5 shrink-0">
                            ✓
                          </span>
                          <span className="text-[11px] text-zinc-400 leading-relaxed">
                            {rule}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Markdown / text content view */}
            {fileData.content && (
              <div className="relative">
                <pre className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap font-mono bg-zinc-900/50 rounded-lg border border-zinc-800/50 p-3 max-h-[60vh] overflow-y-auto">
                  {fileData.content.length > 3000
                    ? fileData.content.substring(0, 3000) + "\n\n... (truncated)"
                    : fileData.content}
                </pre>
              </div>
            )}

            {/* Status view (for Supabase node) */}
            {fileData.label === undefined && (fileData as any).status && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-400">
                  Engine Status
                </h4>
                {Object.entries((fileData as any).status).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between px-2 py-1.5 rounded bg-zinc-900/50 border border-zinc-800/50"
                    >
                      <span className="text-[11px] text-zinc-500">{key}</span>
                      <span className="text-[11px] text-zinc-300 font-mono">
                        {Array.isArray(value)
                          ? (value as any[]).join(", ")
                          : String(value)}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Empty state */}
            {!fileData.content &&
              (!fileData.rules || fileData.rules.length === 0) &&
              !((fileData as any).status) && (
                <div className="text-center py-8 text-zinc-600 text-xs">
                  No data yet — this file will be populated as the system runs.
                </div>
              )}
          </div>
        ) : (
          <div className="p-4">
            <div className="text-xs text-zinc-500 leading-relaxed">
              {nodeData?.description || "Select a node to see details."}
            </div>
            {nodeData?.details && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {nodeData.details.map((d: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-zinc-900 text-[10px] text-zinc-400 font-mono border border-zinc-800"
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
