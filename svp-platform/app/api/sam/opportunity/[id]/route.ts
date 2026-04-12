import { NextRequest, NextResponse } from "next/server";
import { fetchOpportunityDetails, fetchResourceLinks } from "@/lib/sam/samApiClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Notice ID is required" },
        { status: 400 }
      );
    }

    // Fetch opportunity details and attachments in parallel
    const [opportunity, resourceLinks] = await Promise.all([
      fetchOpportunityDetails(id),
      fetchResourceLinks(id),
    ]);

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    // Merge attachments into the opportunity object
    opportunity.resourceLinks = resourceLinks;

    return NextResponse.json({
      opportunity,
    });
  } catch (error) {
    console.error("Error fetching opportunity details:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunity details", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
