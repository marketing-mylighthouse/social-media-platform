import fs from "fs";
import path from "path";

// Engine root path — in production this will be an env var
// For local dev, the platform lives INSIDE the engine folder:
//   Social Media Engine/social-media-platform/  ← cwd()
//   Social Media Engine/companies/              ← engine root is parent
//   Social Media Engine/skills/
//
// So engine root = one level up from cwd
const ENGINE_ROOT = process.env.ENGINE_PATH || path.resolve(process.cwd(), "..");

// Debug: log the resolved path on startup
console.log("[Engine] Root path:", ENGINE_ROOT);
console.log("[Engine] Companies dir exists:", fs.existsSync(path.join(ENGINE_ROOT, "companies")));
console.log("[Engine] Skills dir exists:", fs.existsSync(path.join(ENGINE_ROOT, "skills")));

// ============================================================
// PATH HELPERS
// ============================================================

export function enginePath(...segments: string[]): string {
  return path.join(ENGINE_ROOT, ...segments);
}

export function companyPath(slug: string, ...segments: string[]): string {
  return path.join(ENGINE_ROOT, "companies", slug, ...segments);
}

export function skillPath(skill: string, ...segments: string[]): string {
  return path.join(ENGINE_ROOT, "skills", skill, ...segments);
}

// ============================================================
// FILE READING
// ============================================================

export function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

export function readJson<T = any>(filePath: string): T | null {
  const content = readFile(filePath);
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function listDir(dirPath: string): string[] {
  try {
    return fs.readdirSync(dirPath);
  } catch {
    return [];
  }
}

export function listDirRecursive(
  dirPath: string,
  extensions?: string[]
): string[] {
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        results.push(...listDirRecursive(fullPath, extensions));
      } else if (
        !extensions ||
        extensions.some((ext) => entry.name.endsWith(ext))
      ) {
        results.push(fullPath);
      }
    }
  } catch {
    // silently ignore
  }
  return results;
}

// ============================================================
// COMPANY DATA
// ============================================================

export interface CompanyConfig {
  name: string;
  short_name: string;
  slug: string;
  industry: string;
  segment?: string;
  country?: string;
  language?: string;
  tagline?: string;
  platforms?: string[];
  default_format?: string;
  post_id_prefix?: string;
  primary_color?: string;
  accent_color?: string;
  font_family?: string;
  website?: string;
  social_handles?: Record<string, string>;
}

export function getCompanySlugs(): string[] {
  return listDir(enginePath("companies")).filter((name) => {
    const configPath = companyPath(name, "config", "company.json");
    return fileExists(configPath);
  });
}

export function getCompanyConfig(slug: string): CompanyConfig | null {
  return readJson<CompanyConfig>(companyPath(slug, "config", "company.json"));
}

export function getAllCompanies(): (CompanyConfig & { hasAssets: boolean; hasCampaigns: boolean })[] {
  return getCompanySlugs()
    .map((slug) => {
      const config = getCompanyConfig(slug);
      if (!config) return null;

      const photos = listDir(companyPath(slug, "assets", "photos"));
      const campaigns = listDir(companyPath(slug, "campaigns"));

      return {
        ...config,
        slug,
        hasAssets: photos.length > 0,
        hasCampaigns: campaigns.length > 0,
      };
    })
    .filter(Boolean) as any[];
}

// ============================================================
// FEEDBACK SYSTEM
// ============================================================

export interface FeedbackRule {
  category: string;
  rules: string[];
}

function parseRulesFromMarkdown(content: string): FeedbackRule[] {
  const sections: FeedbackRule[] = [];
  let currentCategory = "";
  let currentRules: string[] = [];

  for (const line of content.split("\n")) {
    if (line.startsWith("## ")) {
      if (currentCategory && currentRules.length > 0) {
        sections.push({ category: currentCategory, rules: currentRules });
      }
      currentCategory = line.replace("## ", "").trim();
      currentRules = [];
    } else if (line.startsWith("- ") && !line.includes("<!--")) {
      currentRules.push(line.replace("- ", "").trim());
    }
  }
  if (currentCategory && currentRules.length > 0) {
    sections.push({ category: currentCategory, rules: currentRules });
  }

  return sections;
}

export function getGlobalCreativeRules(): FeedbackRule[] {
  const content = readFile(
    skillPath("creative-builder", "feedback", "global-rules.md")
  );
  return content ? parseRulesFromMarkdown(content) : [];
}

export function getGlobalPlannerRules(): FeedbackRule[] {
  const content = readFile(
    skillPath("campaign-planner", "feedback", "global-rules.md")
  );
  return content ? parseRulesFromMarkdown(content) : [];
}

export function getCompanyFeedbackRules(slug: string): FeedbackRule[] {
  const content = readFile(
    companyPath(slug, "config", "feedback-rules.md")
  );
  return content ? parseRulesFromMarkdown(content) : [];
}

// ============================================================
// BRAND & SKILLS
// ============================================================

export function getBrandGuide(slug: string): string | null {
  return readFile(companyPath(slug, "brand", "brand-guide.md"));
}

export function getSkillContent(skill: string): string | null {
  return readFile(skillPath(skill, "SKILL.md"));
}

export function getClaudeMd(): string | null {
  return readFile(enginePath("CLAUDE.md"));
}

// ============================================================
// CAMPAIGNS
// ============================================================

export function getCompanyCampaigns(slug: string): string[] {
  return listDir(companyPath(slug, "campaigns")).filter((name) =>
    /^\d{4}-\d{2}$/.test(name)
  );
}

export function getCampaignBrief(slug: string, period: string): any | null {
  return readJson(
    companyPath(slug, "campaigns", period, "campaign-brief.json")
  );
}

// ============================================================
// ASSETS
// ============================================================

export function getCompanyPhotos(slug: string): string[] {
  return listDir(companyPath(slug, "assets", "photos")).filter((f) =>
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  );
}

export function getCompanyLogos(slug: string): string[] {
  return listDir(companyPath(slug, "assets", "logos"));
}

// ============================================================
// ENGINE STATUS (for whiteboard)
// ============================================================

export interface EngineStatus {
  companies: number;
  companiesWithAssets: number;
  companiesWithCampaigns: number;
  totalPhotos: number;
  totalCampaigns: number;
  skillsAvailable: string[];
  globalCreativeRules: number;
  globalPlannerRules: number;
}

export function getEngineStatus(): EngineStatus {
  const slugs = getCompanySlugs();
  let totalPhotos = 0;
  let totalCampaigns = 0;
  let companiesWithAssets = 0;
  let companiesWithCampaigns = 0;

  for (const slug of slugs) {
    const photos = getCompanyPhotos(slug);
    const campaigns = getCompanyCampaigns(slug);
    totalPhotos += photos.length;
    totalCampaigns += campaigns.length;
    if (photos.length > 0) companiesWithAssets++;
    if (campaigns.length > 0) companiesWithCampaigns++;
  }

  const creativeRules = getGlobalCreativeRules();
  const plannerRules = getGlobalPlannerRules();

  return {
    companies: slugs.length,
    companiesWithAssets,
    companiesWithCampaigns,
    totalPhotos,
    totalCampaigns,
    skillsAvailable: listDir(enginePath("skills")),
    globalCreativeRules: creativeRules.reduce((sum, s) => sum + s.rules.length, 0),
    globalPlannerRules: plannerRules.reduce((sum, s) => sum + s.rules.length, 0),
  };
}
