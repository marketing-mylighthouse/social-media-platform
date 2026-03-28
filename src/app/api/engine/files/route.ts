import { NextRequest, NextResponse } from "next/server";
import {
  getClaudeMd,
  getSkillContent,
  getBrandGuide,
  getCompanyConfig,
  getCompanyFeedbackRules,
  getGlobalCreativeRules,
  getGlobalPlannerRules,
  getCampaignBrief,
  readFile,
  skillPath,
} from "@/lib/engine";

// Read any engine file by type + params
// GET /api/engine/files?type=claude-md
// GET /api/engine/files?type=skill&name=creative-builder
// GET /api/engine/files?type=brand-guide&company=qcc
// GET /api/engine/files?type=company-config&company=qcc
// GET /api/engine/files?type=feedback-rules&company=qcc
// GET /api/engine/files?type=global-creative-rules
// GET /api/engine/files?type=global-planner-rules
// GET /api/engine/files?type=campaign-brief&company=qcc&period=2026-04

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const company = searchParams.get("company");
  const name = searchParams.get("name");
  const period = searchParams.get("period");

  switch (type) {
    case "claude-md": {
      const content = getClaudeMd();
      return NextResponse.json({
        label: "CLAUDE.md",
        path: "engine/CLAUDE.md",
        type: "markdown",
        content,
      });
    }

    case "skill": {
      if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
      const content = getSkillContent(name);
      const feedbackContent = readFile(skillPath(name, "feedback", "global-rules.md"));
      return NextResponse.json({
        label: `${name}/SKILL.md`,
        path: `engine/skills/${name}/SKILL.md`,
        type: "markdown",
        content,
        feedbackRules: feedbackContent,
      });
    }

    case "brand-guide": {
      if (!company) return NextResponse.json({ error: "company required" }, { status: 400 });
      const content = getBrandGuide(company);
      return NextResponse.json({
        label: "Brand Guide",
        path: `companies/${company}/brand/brand-guide.md`,
        type: "markdown",
        content,
      });
    }

    case "company-config": {
      if (!company) return NextResponse.json({ error: "company required" }, { status: 400 });
      const config = getCompanyConfig(company);
      return NextResponse.json({
        label: "company.json",
        path: `companies/${company}/config/company.json`,
        type: "json",
        content: config ? JSON.stringify(config, null, 2) : null,
        parsed: config,
      });
    }

    case "feedback-rules": {
      if (!company) return NextResponse.json({ error: "company required" }, { status: 400 });
      const rules = getCompanyFeedbackRules(company);
      return NextResponse.json({
        label: "feedback-rules.md",
        path: `companies/${company}/config/feedback-rules.md`,
        type: "feedback",
        rules,
      });
    }

    case "global-creative-rules": {
      const rules = getGlobalCreativeRules();
      return NextResponse.json({
        label: "Global Creative Rules",
        path: "skills/creative-builder/feedback/global-rules.md",
        type: "feedback",
        rules,
        totalRules: rules.reduce((sum, s) => sum + s.rules.length, 0),
      });
    }

    case "global-planner-rules": {
      const rules = getGlobalPlannerRules();
      return NextResponse.json({
        label: "Global Planner Rules",
        path: "skills/campaign-planner/feedback/global-rules.md",
        type: "feedback",
        rules,
        totalRules: rules.reduce((sum, s) => sum + s.rules.length, 0),
      });
    }

    case "campaign-brief": {
      if (!company || !period)
        return NextResponse.json({ error: "company and period required" }, { status: 400 });
      const brief = getCampaignBrief(company, period);
      return NextResponse.json({
        label: "campaign-brief.json",
        path: `companies/${company}/campaigns/${period}/campaign-brief.json`,
        type: "json",
        content: brief ? JSON.stringify(brief, null, 2) : null,
        parsed: brief,
      });
    }

    default:
      return NextResponse.json({ error: "Unknown file type" }, { status: 400 });
  }
}
