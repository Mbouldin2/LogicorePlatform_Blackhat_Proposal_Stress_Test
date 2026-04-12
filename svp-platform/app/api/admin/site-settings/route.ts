import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS, SiteSettingsDoc } from "@/lib/schema";

const SETTINGS_DOC_ID = "main";

// Default settings based on the hardcoded values audit
const DEFAULT_SETTINGS: Omit<SiteSettingsDoc, "id" | "createdAt" | "updatedAt"> = {
  company: {
    name: "Strategic Value+",
    fullName: "Strategic Value+ Solutions",
    alternateName: "Strategic Value Plus",
    tagline: "Transforming U.S. Manufacturing",
    description: "Helping small- and mid-sized U.S. manufacturers win OEM contracts through supplier qualification, ISO certification, and operational readiness.",
    foundingDate: "2020",
    founderName: "Nel Varenas",
    founderTitle: "CEO",
  },
  branding: {
    logoPath: "/VPlus_logo.webp",
    logoAltText: "Strategic Value+ Logo",
    logoUrlSeo: "https://strategicvalueplus.com/logo.png",
    faviconPath: "/favicon.ico",
  },
  contact: {
    primaryEmail: "info@strategicvalueplus.com",
    notificationEmail: "info@strategicvalueplus.com",
    noReplyEmail: "noreply@strategicvalueplus.com",
    mainPhone: "(302) 215-4700",
    mainPhoneTel: "+1-302-215-4700",
    country: "United States",
    countryCode: "US",
    geoLatitude: 35.7796,
    geoLongitude: -78.6382,
  },
  businessHours: {
    displayText: "Mon-Fri: 8am - 6pm EST",
    openTime: "09:00",
    closeTime: "17:00",
    daysOpen: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    timezone: "America/New_York",
  },
  social: {
    linkedinUrl: "https://linkedin.com",
    linkedinCompanyUrl: "https://www.linkedin.com/company/strategicvalueplus",
    twitterUrl: "https://twitter.com",
    twitterHandle: "strategicvalueplus",
    youtubeUrl: "https://youtube.com",
    youtubeChannel: "https://www.youtube.com/@strategicvalueplus",
  },
  website: {
    mainDomain: "https://strategicvalueplus.com",
  },
  seo: {
    priceRange: "$$$$",
    aggregateRating: 4.9,
    reviewCount: 47,
    expertiseAreas: [
      "Manufacturing Consulting",
      "ISO Certification",
      "IATF 16949",
      "Lean Manufacturing",
      "Industry 4.0",
      "Digital Transformation",
      "Supply Chain Optimization",
      "OEM Supplier Qualification",
    ],
  },
  forms: {
    serviceOptions: [
      "Supplier Readiness & OEM Qualification",
      "ISO/QMS Certification",
      "Lean Manufacturing",
      "Digital Transformation",
      "Reshoring Advisory",
      "Workforce Development",
      "Other",
    ],
    companySizeOptions: [
      "1-25 employees",
      "25-100 employees",
      "100-250 employees",
      "250-500 employees",
      "500+ employees",
    ],
    responseTimeCommitment: "within 24 hours",
  },
  cta: {
    primaryButtonText: "Get Assessment",
    secondaryButtonText: "Learn More",
    assessmentButtonText: "Request Free Assessment",
  },
};

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return NextResponse.json({
        success: true,
        data: {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        },
      });
    }

    // Return defaults if no settings exist yet
    return NextResponse.json({
      success: true,
      data: {
        id: SETTINGS_DOC_ID,
        ...DEFAULT_SETTINGS,
        createdAt: null,
        updatedAt: null,
      },
      isDefault: true,
    });
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ error: "Settings data required" }, { status: 400 });
    }

    const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    const now = Timestamp.now();
    const dataToSave = {
      ...settings,
      id: SETTINGS_DOC_ID,
      updatedAt: now,
      createdAt: docSnap.exists() ? docSnap.data().createdAt : now,
    };

    await setDoc(docRef, dataToSave);

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      data: {
        ...dataToSave,
        createdAt: dataToSave.createdAt?.toDate?.()?.toISOString() || now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error saving site settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

// Reset to defaults
export async function DELETE() {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, SETTINGS_DOC_ID);
    const now = Timestamp.now();

    await setDoc(docRef, {
      id: SETTINGS_DOC_ID,
      ...DEFAULT_SETTINGS,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Settings reset to defaults",
    });
  } catch (error) {
    console.error("Error resetting site settings:", error);
    return NextResponse.json({ error: "Failed to reset settings" }, { status: 500 });
  }
}
