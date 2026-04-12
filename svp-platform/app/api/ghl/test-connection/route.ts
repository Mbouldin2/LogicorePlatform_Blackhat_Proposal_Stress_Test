import { NextRequest, NextResponse } from "next/server";
import { GoHighLevelClient } from "@/lib/gohighlevel";

/**
 * POST /api/ghl/test-connection
 * Test GoHighLevel API connection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { apiKey, locationId } = body as {
      apiKey: string;
      locationId: string;
    };

    if (!apiKey || !locationId) {
      return NextResponse.json(
        { error: "API key and location ID are required" },
        { status: 400 }
      );
    }

    const client = new GoHighLevelClient({
      apiKey,
      locationId,
    });

    // Try to get calendars as a simple test
    const result = await client.getCalendars();

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || "Connection failed",
          success: false,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: {
        success: true,
        message: "Connection successful",
        calendarsFound: result.data?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error testing GHL connection:", error);
    return NextResponse.json(
      { error: "Failed to test connection" },
      { status: 500 }
    );
  }
}
