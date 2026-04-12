import { NextRequest, NextResponse } from "next/server";
import { GoHighLevelClient, GHLContact } from "@/lib/gohighlevel";

/**
 * POST /api/ghl/contacts
 * Create a contact in GoHighLevel from webinar registration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      tags,
      source,
      customFields,
      apiKey,
      locationId,
    } = body as {
      firstName: string;
      lastName?: string;
      email: string;
      phone?: string;
      companyName?: string;
      tags?: string[];
      source?: string;
      customFields?: Record<string, string>;
      apiKey?: string;
      locationId?: string;
    };

    // Validate required fields
    if (!firstName || !email) {
      return NextResponse.json(
        { error: "First name and email are required" },
        { status: 400 }
      );
    }

    // Get API credentials from request or environment
    const ghlApiKey = apiKey || process.env.GHL_API_KEY;
    const ghlLocationId = locationId || process.env.GHL_LOCATION_ID;

    if (!ghlApiKey || !ghlLocationId) {
      return NextResponse.json(
        { error: "GoHighLevel API credentials not configured" },
        { status: 500 }
      );
    }

    const client = new GoHighLevelClient({
      apiKey: ghlApiKey,
      locationId: ghlLocationId,
    });

    const contact: GHLContact = {
      firstName,
      lastName: lastName || "",
      email,
      phone,
      tags: tags || [],
      source: source || "Webinar Registration",
      customFields: {
        ...customFields,
        ...(companyName ? { company: companyName } : {}),
      },
    };

    const result = await client.createContact(contact);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create contact in GoHighLevel" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        success: true,
        contactId: result.data?.id,
      },
    });
  } catch (error) {
    console.error("Error creating GHL contact:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
