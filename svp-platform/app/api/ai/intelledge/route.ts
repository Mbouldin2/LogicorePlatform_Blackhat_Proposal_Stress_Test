import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface IntellEdgeRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

interface DataContext {
  opportunities?: unknown[];
  projects?: unknown[];
  affiliates?: unknown[];
  teamMembers?: unknown[];
  customers?: unknown[];
  meetings?: unknown[];
  rocks?: unknown[];
  contacts?: unknown[];
}

// Keywords to determine which collections to query
const COLLECTION_KEYWORDS = {
  opportunities: ["opportunity", "opportunities", "pipeline", "deal", "deals", "proposal", "proposals", "sales", "revenue", "closing"],
  projects: ["project", "projects", "engagement", "engagements", "active project", "deliverable"],
  affiliates: ["affiliate", "affiliates", "consultant", "consultants", "expert", "experts", "specialist", "network"],
  teamMembers: ["team", "member", "members", "employee", "employees", "staff", "who works"],
  customers: ["customer", "customers", "client", "clients", "account", "accounts"],
  meetings: ["meeting", "meetings", "calendar", "scheduled", "appointment", "call", "calls"],
  rocks: ["rock", "rocks", "goal", "goals", "quarterly", "objective", "objectives", "okr"],
  contacts: ["contact", "contacts", "lead", "leads", "submission", "form"],
};

function detectRelevantCollections(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const relevant: string[] = [];

  for (const [collectionKey, keywords] of Object.entries(COLLECTION_KEYWORDS)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      relevant.push(collectionKey);
    }
  }

  // If no specific collection detected, query the most common ones
  if (relevant.length === 0) {
    relevant.push("opportunities", "projects", "affiliates");
  }

  return relevant;
}

async function fetchCollectionData(collectionName: string, maxItems = 50): Promise<unknown[]> {
  if (!db) return [];

  try {
    let collectionRef;
    let q;

    switch (collectionName) {
      case "opportunities":
        collectionRef = collection(db, COLLECTIONS.OPPORTUNITIES);
        q = query(collectionRef, orderBy("updatedAt", "desc"), limit(maxItems));
        break;
      case "projects":
        collectionRef = collection(db, COLLECTIONS.PROJECTS);
        q = query(collectionRef, orderBy("updatedAt", "desc"), limit(maxItems));
        break;
      case "affiliates":
        collectionRef = collection(db, COLLECTIONS.AFFILIATE_BIOGRAPHIES);
        q = query(collectionRef, limit(maxItems));
        break;
      case "teamMembers":
        collectionRef = collection(db, COLLECTIONS.TEAM_MEMBERS);
        q = query(collectionRef, where("status", "==", "active"), limit(maxItems));
        break;
      case "customers":
        collectionRef = collection(db, COLLECTIONS.CUSTOMERS);
        q = query(collectionRef, orderBy("updatedAt", "desc"), limit(maxItems));
        break;
      case "meetings":
        collectionRef = collection(db, COLLECTIONS.CALENDAR_EVENTS);
        const now = Timestamp.now();
        q = query(collectionRef, where("startDate", ">=", now), orderBy("startDate", "asc"), limit(maxItems));
        break;
      case "rocks":
        collectionRef = collection(db, COLLECTIONS.TRACTION_ROCKS);
        q = query(collectionRef, orderBy("updatedAt", "desc"), limit(maxItems));
        break;
      case "contacts":
        collectionRef = collection(db, COLLECTIONS.CONTACT_FORM_SUBMISSIONS);
        q = query(collectionRef, orderBy("submittedAt", "desc"), limit(maxItems));
        break;
      default:
        return [];
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Timestamps to strings for JSON serialization
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}

async function gatherContext(relevantCollections: string[]): Promise<DataContext> {
  const context: DataContext = {};

  const fetchPromises = relevantCollections.map(async (collName) => {
    const data = await fetchCollectionData(collName);
    return { collName, data };
  });

  const results = await Promise.all(fetchPromises);

  for (const { collName, data } of results) {
    (context as Record<string, unknown[]>)[collName] = data;
  }

  return context;
}

function buildSystemPrompt(context: DataContext): string {
  let dataDescription = "";

  if (context.opportunities && context.opportunities.length > 0) {
    dataDescription += `\n\n**OPPORTUNITIES DATA (${context.opportunities.length} records):**\n${JSON.stringify(context.opportunities, null, 2)}`;
  }
  if (context.projects && context.projects.length > 0) {
    dataDescription += `\n\n**PROJECTS DATA (${context.projects.length} records):**\n${JSON.stringify(context.projects, null, 2)}`;
  }
  if (context.affiliates && context.affiliates.length > 0) {
    dataDescription += `\n\n**AFFILIATES DATA (${context.affiliates.length} records):**\n${JSON.stringify(context.affiliates, null, 2)}`;
  }
  if (context.teamMembers && context.teamMembers.length > 0) {
    dataDescription += `\n\n**TEAM MEMBERS DATA (${context.teamMembers.length} records):**\n${JSON.stringify(context.teamMembers, null, 2)}`;
  }
  if (context.customers && context.customers.length > 0) {
    dataDescription += `\n\n**CUSTOMERS DATA (${context.customers.length} records):**\n${JSON.stringify(context.customers, null, 2)}`;
  }
  if (context.meetings && context.meetings.length > 0) {
    dataDescription += `\n\n**UPCOMING MEETINGS DATA (${context.meetings.length} records):**\n${JSON.stringify(context.meetings, null, 2)}`;
  }
  if (context.rocks && context.rocks.length > 0) {
    dataDescription += `\n\n**ROCKS/GOALS DATA (${context.rocks.length} records):**\n${JSON.stringify(context.rocks, null, 2)}`;
  }
  if (context.contacts && context.contacts.length > 0) {
    dataDescription += `\n\n**CONTACT FORM SUBMISSIONS (${context.contacts.length} records):**\n${JSON.stringify(context.contacts, null, 2)}`;
  }

  return `You are IntellEDGE, an intelligent business assistant for Strategic Value+ platform. You have access to real-time business data from the company's database.

Your role is to:
1. Answer questions about the business data accurately and helpfully
2. Provide insights and analysis based on the data
3. Suggest actionable next steps when appropriate
4. Format responses clearly with markdown (use **bold**, bullet points, tables when helpful)
5. Always cite which data sources you used in your response

When responding:
- Be concise but thorough
- Use specific names, numbers, and dates from the data
- If data is missing or incomplete, acknowledge it
- Suggest relevant follow-up actions or links when appropriate

IMPORTANT: Base your answers ONLY on the provided data. If the data doesn't contain information to answer the question, say so clearly.

Here is the current business data from the database:
${dataDescription || "\n\nNo relevant data found in the database for this query."}`;
}

function identifyDataSources(context: DataContext): string[] {
  const sources: string[] = [];
  if (context.opportunities && context.opportunities.length > 0) sources.push("Opportunities Pipeline");
  if (context.projects && context.projects.length > 0) sources.push("Projects Database");
  if (context.affiliates && context.affiliates.length > 0) sources.push("Affiliate Network");
  if (context.teamMembers && context.teamMembers.length > 0) sources.push("Team Directory");
  if (context.customers && context.customers.length > 0) sources.push("Customer Database");
  if (context.meetings && context.meetings.length > 0) sources.push("Calendar Events");
  if (context.rocks && context.rocks.length > 0) sources.push("Rocks & Goals");
  if (context.contacts && context.contacts.length > 0) sources.push("Contact Submissions");
  return sources;
}

function generateSuggestedActions(message: string, context: DataContext): { label: string; href: string }[] {
  const actions: { label: string; href: string }[] = [];
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("opportunit") && context.opportunities?.length) {
    actions.push({ label: "View All Opportunities", href: "/portal/opportunities" });
  }
  if (lowerMessage.includes("project") && context.projects?.length) {
    actions.push({ label: "View All Projects", href: "/portal/projects" });
  }
  if (lowerMessage.includes("affiliate") || lowerMessage.includes("consultant")) {
    actions.push({ label: "View Affiliate Network", href: "/portal/networking" });
  }
  if (lowerMessage.includes("team") || lowerMessage.includes("member")) {
    actions.push({ label: "View Team Members", href: "/portal/admin/team-members" });
  }
  if (lowerMessage.includes("customer") || lowerMessage.includes("client")) {
    actions.push({ label: "View Customers", href: "/portal/customers" });
  }
  if (lowerMessage.includes("meeting") || lowerMessage.includes("calendar")) {
    actions.push({ label: "View Calendar", href: "/portal/calendar" });
  }
  if (lowerMessage.includes("rock") || lowerMessage.includes("goal")) {
    actions.push({ label: "View Rocks", href: "/portal/rocks" });
  }
  if (lowerMessage.includes("contact") || lowerMessage.includes("lead") || lowerMessage.includes("submission")) {
    actions.push({ label: "View Form Submissions", href: "/portal/admin/form-submissions" });
  }

  return actions.slice(0, 3); // Limit to 3 actions
}

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response generated";
}

function generateFallbackResponse(context: DataContext): string {
  const summaries: string[] = [];

  if (context.opportunities?.length) {
    summaries.push(`- **${context.opportunities.length}** opportunities in the pipeline`);
  }
  if (context.projects?.length) {
    summaries.push(`- **${context.projects.length}** projects tracked`);
  }
  if (context.affiliates?.length) {
    summaries.push(`- **${context.affiliates.length}** affiliates in the network`);
  }
  if (context.teamMembers?.length) {
    summaries.push(`- **${context.teamMembers.length}** active team members`);
  }
  if (context.customers?.length) {
    summaries.push(`- **${context.customers.length}** customers on record`);
  }
  if (context.meetings?.length) {
    summaries.push(`- **${context.meetings.length}** upcoming meetings`);
  }
  if (context.rocks?.length) {
    summaries.push(`- **${context.rocks.length}** rocks/goals being tracked`);
  }
  if (context.contacts?.length) {
    summaries.push(`- **${context.contacts.length}** recent contact submissions`);
  }

  if (summaries.length === 0) {
    return `I searched the database but couldn't find relevant data for your query. 

To enable AI-powered analysis, please configure your OpenAI API key in the environment variables.

In the meantime, you can explore the portal sections directly to find the information you need.`;
  }

  return `I found the following data in your database:

${summaries.join("\n")}

To get detailed AI-powered analysis and insights, please configure your OpenAI API key in the environment variables (OPENAI_API_KEY).

You can click the action buttons below to explore this data directly.`;
}

export async function POST(request: NextRequest) {
  try {
    const body: IntellEdgeRequest = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Detect which collections are relevant to the query
    const relevantCollections = detectRelevantCollections(message);

    // Fetch data from relevant collections
    const context = await gatherContext(relevantCollections);

    // Identify data sources used
    const sources = identifyDataSources(context);

    // Generate suggested actions
    const actions = generateSuggestedActions(message, context);

    // Build the system prompt with context
    const systemPrompt = buildSystemPrompt(context);

    // Build conversation messages
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // Try to call OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    let responseContent: string;

    if (apiKey) {
      try {
        responseContent = await callOpenAI(apiKey, systemPrompt, messages);
      } catch (error) {
        console.error("OpenAI error:", error);
        responseContent = generateFallbackResponse(context);
      }
    } else {
      responseContent = generateFallbackResponse(context);
    }

    return NextResponse.json({
      success: true,
      response: responseContent,
      sources,
      actions,
      collectionsQueried: relevantCollections,
    });
  } catch (error) {
    console.error("IntellEDGE error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
