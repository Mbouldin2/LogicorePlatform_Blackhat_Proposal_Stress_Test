import { NextRequest, NextResponse } from "next/server";
import { exportToExcel, generateExportFilename } from "@/lib/sam/excelExporter";
import { SamOpportunity } from "@/lib/sam/samApiClient";

export async function POST(request: NextRequest) {
  try {
    const { opportunities, query, options } = await request.json();

    if (!opportunities || !Array.isArray(opportunities) || opportunities.length === 0) {
      return NextResponse.json(
        { error: "No opportunities to export" },
        { status: 400 }
      );
    }

    // Generate Excel file using the enhanced exporter
    const buffer = await exportToExcel(opportunities as SamOpportunity[], {
      sheetName: options?.sheetName || "SAM Opportunities",
      includeDescription: options?.includeDescription ?? true,
      includeContacts: options?.includeContacts ?? false,
    });

    // Generate filename with query
    const filename = generateExportFilename(query);

    // Return Excel file as downloadable response
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error exporting opportunities:", error);
    return NextResponse.json(
      { error: "Failed to export opportunities", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
