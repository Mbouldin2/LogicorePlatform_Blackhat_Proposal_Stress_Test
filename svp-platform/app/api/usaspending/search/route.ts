import { NextRequest, NextResponse } from "next/server";

// ─── USASpending.gov API base ────────────────────────────────────────────────
const USA_BASE = "https://api.usaspending.gov/api/v2";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface USASpendingSearchRequest {
  query: string;
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
}

interface ParsedIntent {
  endpoint: "awards" | "spending_by_agency" | "spending_by_category" | "recipient" | "federal_accounts" | "transactions";
  filters: Record<string, unknown>;
  summary: string;
  keywords: string[];
}

// ─── Plain-language → USASpending API parameter mapping ──────────────────────

/**
 * Uses OpenAI (or falls back to rule-based parsing) to convert a plain-language
 * query into a structured USASpending API request.
 */
async function parseQueryWithAI(query: string, history: { role: string; content: string }[]): Promise<ParsedIntent> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const systemPrompt = `You are a USASpending.gov API query expert. Convert plain-language questions about federal spending into structured JSON.

Return ONLY a valid JSON object (no markdown, no code fences) with this exact shape:
{
  "endpoint": "<one of: awards | spending_by_agency | spending_by_category | recipient | federal_accounts | transactions>",
  "filters": { /* USASpending API v2 filter object */ },
  "summary": "<one sentence describing what will be searched>",
  "keywords": ["<keyword1>", "<keyword2>"]
}

USASpending API v2 filter reference:
- award_type_codes: ["A","B","C","D"] for contracts; ["02","03","04","05"] for grants; ["06","10"] for loans
- recipient_name: string (company / org name)
- recipient_location_county_code, recipient_location_state_code: geographic filters
- agencies: [{"type":"awarding|funding","tier":"toptier|subtier","name":"<agency name>"}]
- time_period: [{"start_date":"YYYY-MM-DD","end_date":"YYYY-MM-DD"}]
- award_amounts: [{"lower_bound":number,"upper_bound":number}]
- naics_codes: ["<6-digit code>"]
- keywords: ["term1","term2"]
- program_numbers: ["<CFDA number>"]

Endpoint guide:
- "awards" → search for specific contracts/grants/loans (most common)
- "spending_by_agency" → total spending grouped by agency
- "spending_by_category" → breakdown by recipient/NAICS/PSC/etc.
- "recipient" → look up a specific recipient/company
- "federal_accounts" → federal account spending
- "transactions" → individual transaction-level data

Current year for reference: ${new Date().getFullYear()}`;

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
            ...history,
            { role: "user", content: query },
          ],
          temperature: 0.1,
          max_tokens: 800,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const raw = data.choices[0]?.message?.content || "";
        const parsed = JSON.parse(raw) as ParsedIntent;
        return parsed;
      }
    } catch (err) {
      console.error("[USASpending] AI parse failed, using rule-based fallback:", err);
    }
  }

  // ── Rule-based fallback ──────────────────────────────────────────────────
  return ruleBasedParse(query);
}

function ruleBasedParse(query: string): ParsedIntent {
  const lower = query.toLowerCase();
  const filters: Record<string, unknown> = {};
  let endpoint: ParsedIntent["endpoint"] = "awards";

  // Award type
  if (lower.includes("contract")) filters.award_type_codes = ["A", "B", "C", "D"];
  else if (lower.includes("grant")) filters.award_type_codes = ["02", "03", "04", "05"];
  else if (lower.includes("loan")) filters.award_type_codes = ["06", "10"];

  // Agency detection
  const agencyPatterns: [RegExp, string][] = [
    [/\b(dod|defense|department of defense)\b/, "Department of Defense"],
    [/\b(hhs|health and human services)\b/, "Department of Health and Human Services"],
    [/\b(dot|department of transportation)\b/, "Department of Transportation"],
    [/\b(doe|department of energy)\b/, "Department of Energy"],
    [/\b(dhs|homeland security)\b/, "Department of Homeland Security"],
    [/\b(nasa)\b/, "National Aeronautics and Space Administration"],
    [/\b(va|veterans affairs)\b/, "Department of Veterans Affairs"],
    [/\b(sba|small business)\b/, "Small Business Administration"],
    [/\b(usda|agriculture)\b/, "Department of Agriculture"],
    [/\b(state department|department of state)\b/, "Department of State"],
  ];
  for (const [regex, name] of agencyPatterns) {
    if (regex.test(lower)) {
      filters.agencies = [{ type: "awarding", tier: "toptier", name }];
      break;
    }
  }

  // Year detection
  const yearMatch = query.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    const yr = yearMatch[1];
    filters.time_period = [{ start_date: `${yr}-10-01`, end_date: `${parseInt(yr) + 1}-09-30` }];
  }

  // Amount detection
  const milMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:million|\bm\b)/);
  const bilMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:billion|\bb\b)/);
  if (milMatch) {
    const amt = parseFloat(milMatch[1]) * 1_000_000;
    filters.award_amounts = [{ lower_bound: amt * 0.5, upper_bound: amt * 2 }];
  } else if (bilMatch) {
    const amt = parseFloat(bilMatch[1]) * 1_000_000_000;
    filters.award_amounts = [{ lower_bound: amt * 0.5, upper_bound: amt * 2 }];
  }

  // Keyword extraction (remove stopwords)
  const stopwords = new Set(["show", "me", "find", "list", "what", "are", "the", "all", "for", "in", "of", "to", "a", "an", "with", "by", "from", "that", "have", "has", "how", "much", "many", "top", "biggest", "largest", "federal", "government", "spending", "spent", "awarded", "awards", "contracts", "grants"]);
  const keywords = query.split(/\s+/).map(w => w.replace(/[^a-z0-9]/gi, "").toLowerCase()).filter(w => w.length > 2 && !stopwords.has(w));
  if (keywords.length > 0) filters.keywords = keywords.slice(0, 5);

  // Endpoint override
  if (lower.includes("agency") || lower.includes("agencies")) endpoint = "spending_by_agency";
  if (lower.includes("breakdown") || lower.includes("category") || lower.includes("categories")) endpoint = "spending_by_category";
  if (lower.includes("recipient") || lower.includes("company") || lower.includes("vendor")) endpoint = "recipient";

  return {
    endpoint,
    filters,
    summary: `Searching USASpending.gov for: ${query}`,
    keywords: (filters.keywords as string[]) || [],
  };
}

// ─── Execute the USASpending API call ────────────────────────────────────────

async function executeUSASpendingQuery(intent: ParsedIntent): Promise<{
  results: unknown[];
  total: number;
  raw: unknown;
  endpoint: string;
}> {
  const headers = { "Content-Type": "application/json" };

  try {
    if (intent.endpoint === "awards") {
      const body = {
        filters: intent.filters,
        fields: [
          "Award ID", "Recipient Name", "Award Amount", "Total Outlays",
          "Description", "Award Type", "Awarding Agency", "Awarding Sub Agency",
          "Start Date", "End Date", "recipient_id", "generated_internal_id",
        ],
        page: 1,
        limit: 25,
        sort: "Award Amount",
        order: "desc",
        subawards: false,
      };

      const res = await fetch(`${USA_BASE}/search/spending_by_award/`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`USASpending awards API error ${res.status}: ${text.substring(0, 300)}`);
      }

      const data = await res.json();
      return {
        results: data.results || [],
        total: data.page_metadata?.total || 0,
        raw: data,
        endpoint: "spending_by_award",
      };
    }

    if (intent.endpoint === "spending_by_agency") {
      const res = await fetch(`${USA_BASE}/spending_explorer/spending/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: "agency",
          filters: { fy: String(new Date().getFullYear()), quarter: "4", ...intent.filters },
        }),
      });

      const data = res.ok ? await res.json() : {};
      return {
        results: data.results || [],
        total: data.page_metadata?.total || 0,
        raw: data,
        endpoint: "spending_by_agency",
      };
    }

    if (intent.endpoint === "spending_by_category") {
      const body = {
        filters: intent.filters,
        category: "recipient",
        limit: 25,
        page: 1,
        subawards: false,
      };

      const res = await fetch(`${USA_BASE}/search/spending_by_category/recipient/`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = res.ok ? await res.json() : {};
      return {
        results: data.results || [],
        total: data.page_metadata?.total || 0,
        raw: data,
        endpoint: "spending_by_category",
      };
    }

    // Default: awards endpoint
    const body = {
      filters: { keywords: intent.keywords.length ? intent.keywords : ["services"] },
      fields: ["Award ID", "Recipient Name", "Award Amount", "Description", "Award Type", "Awarding Agency", "Start Date"],
      page: 1,
      limit: 25,
      sort: "Award Amount",
      order: "desc",
      subawards: false,
    };

    const res = await fetch(`${USA_BASE}/search/spending_by_award/`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = res.ok ? await res.json() : {};
    return {
      results: data.results || [],
      total: data.page_metadata?.total || 0,
      raw: data,
      endpoint: "spending_by_award",
    };
  } catch (err) {
    console.error("[USASpending] Query execution error:", err);
    throw err;
  }
}

// ─── Summarize results with AI ────────────────────────────────────────────────

async function summarizeResults(
  query: string,
  intent: ParsedIntent,
  results: unknown[],
  total: number,
  history: { role: string; content: string }[]
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  const resultsText = JSON.stringify(results.slice(0, 15), null, 2);

  if (apiKey) {
    try {
      const systemPrompt = `You are a federal spending analyst assistant. The user asked a plain-language question about USASpending.gov data. You have fetched real results from the USASpending API and must now summarize them clearly.

Guidelines:
- Lead with the most important finding (total count, top recipients, total amount, etc.)
- Use **bold** for key numbers and names
- Use bullet points or a short table for top results
- Keep it concise but informative — 150-300 words
- Mention the total number of matching records
- Include a direct link to USASpending.gov for users who want more detail
- If results are empty, explain what was searched and suggest a refinement

Direct USASpending.gov search URL: https://www.usaspending.gov/search`;

      const userMessage = `User question: "${query}"

Search intent: ${intent.summary}
Endpoint searched: ${intent.endpoint}
Total matching records: ${total}
Top ${results.length} results:
${resultsText}`;

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
            ...history.slice(-4),
            { role: "user", content: userMessage },
          ],
          temperature: 0.5,
          max_tokens: 800,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content || "";
      }
    } catch (err) {
      console.error("[USASpending] Summary AI error:", err);
    }
  }

  // Rule-based fallback summary
  if (results.length === 0) {
    return `No results found for your query. The search looked for **${intent.summary}**.\n\nTry refining your search — for example, use more specific agency names, date ranges, or dollar amounts.\n\n[Search directly on USASpending.gov →](https://www.usaspending.gov/search)`;
  }

  const topResult = (results[0] as Record<string, unknown>);
  const topName = topResult["Recipient Name"] || topResult["name"] || "Unknown";
  const topAmt = topResult["Award Amount"] || topResult["amount"] || 0;
  const fmtAmt = typeof topAmt === "number" ? `$${topAmt.toLocaleString()}` : String(topAmt);

  return `Found **${total.toLocaleString()}** matching records on USASpending.gov.\n\n**Top result:** ${topName} — ${fmtAmt}\n\nShowing the top ${results.length} results sorted by award amount.\n\n[View full results on USASpending.gov →](https://www.usaspending.gov/search)`;
}

// ─── PUT handler: structured form proxy (no AI, no API key needed) ───────────
//
// Used by the USASpending search form page so the browser never calls
// api.usaspending.gov directly (avoids CORS issues on public access versions).
// Accepts the same body shape the form currently builds and forwards it
// server-side to USASpending, then returns results + page_metadata.

export async function PUT(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const upstream = await fetch("https://api.usaspending.gov/api/v2/search/spending_by_award/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // Next.js server-side fetch — no CORS restrictions
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json(
        { error: `USASpending API error ${upstream.status}`, detail: text.substring(0, 400) },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[USASpending proxy] PUT error:", error);
    return NextResponse.json(
      { error: "Proxy request failed", detail: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

// ─── Main POST handler ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: USASpendingSearchRequest = await request.json();
    const { query, conversationHistory = [] } = body;

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const history = conversationHistory.map((m) => ({ role: m.role, content: m.content }));

    // Step 1: Parse query into structured intent
    const intent = await parseQueryWithAI(query, history);

    // Step 2: Execute USASpending API call
    let results: unknown[] = [];
    let total = 0;
    let apiEndpoint: string = intent.endpoint;
    let fetchError: string | null = null;

    try {
      const queryResult = await executeUSASpendingQuery(intent);
      results = queryResult.results;
      total = queryResult.total;
      apiEndpoint = queryResult.endpoint;
    } catch (err) {
      fetchError = err instanceof Error ? err.message : "Failed to fetch from USASpending.gov";
      console.error("[USASpending] Fetch error:", fetchError);
    }

    // Step 3: Summarize results
    const summary = await summarizeResults(query, intent, results, total, history);

    return NextResponse.json({
      success: true,
      summary,
      intent,
      results,
      total,
      apiEndpoint,
      fetchError,
      usaSpendingUrl: `https://www.usaspending.gov/search`,
    });
  } catch (error) {
    console.error("[USASpending] Handler error:", error);
    return NextResponse.json(
      { error: "Failed to process query", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
