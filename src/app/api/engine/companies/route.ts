import { NextRequest, NextResponse } from "next/server";
import {
  getAllCompanies,
  getCompanyConfig,
  getCompanyPhotos,
  getCompanyCampaigns,
  getCompanyFeedbackRules,
  getBrandGuide,
} from "@/lib/engine";

// GET /api/engine/companies — list all companies
// GET /api/engine/companies?slug=qcc — get full detail for one company

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const config = getCompanyConfig(slug);
    if (!config) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const photos = getCompanyPhotos(slug);
    const campaigns = getCompanyCampaigns(slug);
    const feedbackRules = getCompanyFeedbackRules(slug);
    const brandGuide = getBrandGuide(slug);

    return NextResponse.json({
      ...config,
      slug,
      stats: {
        photos: photos.length,
        campaigns: campaigns.length,
        feedbackRules: feedbackRules.reduce((sum, s) => sum + s.rules.length, 0),
        hasBrandGuide: !!brandGuide,
      },
      campaigns,
      feedbackRules,
      brandGuidePreview: brandGuide ? brandGuide.substring(0, 500) + "..." : null,
    });
  }

  const companies = getAllCompanies();
  return NextResponse.json(companies);
}
