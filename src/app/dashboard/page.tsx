"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Company {
  name: string;
  short_name: string;
  slug: string;
  industry: string;
  primary_color: string;
  accent_color: string;
  tagline?: string;
  platforms?: string[];
  hasAssets: boolean;
  hasCampaigns: boolean;
}

interface EngineStatus {
  companies: number;
  companiesWithAssets: number;
  companiesWithCampaigns: number;
  totalPhotos: number;
  totalCampaigns: number;
  skillsAvailable: string[];
  globalCreativeRules: number;
  globalPlannerRules: number;
}

export default function Dashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [status, setStatus] = useState<EngineStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/engine/status")
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data.companies || []);
        setStatus(data.status || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              S
            </div>
            <div>
              <h1 className="text-base font-semibold">Social Media Engine</h1>
              <p className="text-[11px] text-zinc-500">Dashboard</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Workflow
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-md text-xs text-zinc-200 bg-zinc-800"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Cards */}
        {status && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatusCard
              label="Companies"
              value={status.companies}
              sub={`${status.companiesWithAssets} with photos`}
              color="#3b82f6"
            />
            <StatusCard
              label="Total Photos"
              value={status.totalPhotos}
              sub="across all companies"
              color="#f97316"
            />
            <StatusCard
              label="AI Skills"
              value={status.skillsAvailable.length}
              sub={status.skillsAvailable.join(", ")}
              color="#a855f7"
            />
            <StatusCard
              label="Learning Rules"
              value={status.globalCreativeRules + status.globalPlannerRules}
              sub={`${status.globalCreativeRules} creative · ${status.globalPlannerRules} planner`}
              color="#22c55e"
            />
          </div>
        )}

        {/* Companies Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">Companies</h2>
          <span className="text-[11px] text-zinc-600">
            {companies.length} companies registered
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <CompanyCard key={company.slug} company={company} />
          ))}
        </div>
      </main>
    </div>
  );
}

function StatusCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-zinc-600 mt-1">{sub}</div>
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        {/* Color dot with company initial */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: company.primary_color || "#3f3f46" }}
        >
          {(company.short_name || company.name)[0]}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-100 truncate">
            {company.short_name || company.name}
          </h3>
          <p className="text-[10px] text-zinc-500">{company.industry}</p>
        </div>
      </div>

      {company.tagline && (
        <p className="text-[11px] text-zinc-500 mb-3 italic">
          &ldquo;{company.tagline}&rdquo;
        </p>
      )}

      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          label="Brand Guide"
          active={true}
          color={company.primary_color}
        />
        <Badge
          label="Photos"
          active={company.hasAssets}
          color={company.primary_color}
        />
        <Badge
          label="Campaigns"
          active={company.hasCampaigns}
          color={company.primary_color}
        />
        {company.platforms?.map((p) => (
          <span
            key={p}
            className="text-[9px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

function Badge({
  label,
  active,
  color,
}: {
  label: string;
  active: boolean;
  color?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${
        active
          ? "bg-zinc-800 text-zinc-300"
          : "bg-zinc-900 text-zinc-600"
      }`}
    >
      <span
        className={`w-1 h-1 rounded-full ${
          active ? "bg-green-500" : "bg-zinc-700"
        }`}
      />
      {label}
    </span>
  );
}
