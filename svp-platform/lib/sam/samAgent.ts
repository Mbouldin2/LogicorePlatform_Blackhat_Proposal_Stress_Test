/**
 * SAM Agent - AI-powered natural language search for SAM.gov opportunities
 * 
 * This agent uses OpenAI/Anthropic LLM to parse natural language queries
 * into structured search parameters for the SAM.gov API.
 */

import OpenAI from "openai";
import {
  getOpenAIApiKey,
  createOpenAIClient,
} from "@/lib/openai-config";
import {
  searchOpportunities,
  fetchOpportunityDetails,
  SamSearchParams,
  SamOpportunity,
  SamSearchResponse,
  parseNaturalLanguageQuery,
} from "./samApiClient";

// Initialize OpenAI client lazily using SVP LLM settings
let openai: OpenAI | null = null;

async function getOpenAIClientInstance(): Promise<OpenAI | null> {
  if (!openai) {
    openai = await createOpenAIClient();
  }
  return openai;
}

export interface SamAgentState {
  query: string;
  originalFilters: Partial<SamSearchParams>;
  parsedParams: SamSearchParams;
  searchResults: SamOpportunity[];
  recommendation?: string;
  error?: string;
}

export interface SamAgentResult {
  searchResults: SamOpportunity[];
  parsedParams: SamSearchParams;
  recommendation?: string;
  total: number;
  error?: string;
}

/**
 * Main entry point - Run the SAM Agent
 * 
 * Parses natural language query using LLM and searches SAM.gov
 */
export async function runSamAgent(
  query: string,
  userFilters: Partial<SamSearchParams> = {}
): Promise<SamAgentResult> {
  const state: SamAgentState = {
    query,
    originalFilters: userFilters,
    parsedParams: {},
    searchResults: [],
  };

  try {
    // Step 1: Parse user input using LLM
    const parsedState = await parseUserInputNode(state);

    // Step 2: Search opportunities
    const searchState = await searchOpportunitiesNode(parsedState);

    // Step 3: Analyze results and generate recommendations
    const finalState = await analyzeResultsNode(searchState);

    return {
      searchResults: finalState.searchResults,
      parsedParams: finalState.parsedParams,
      recommendation: finalState.recommendation,
      total: finalState.searchResults.length,
    };
  } catch (error) {
    console.error("SAM Agent error:", error);
    return {
      searchResults: [],
      parsedParams: {},
      total: 0,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Parse user input node - Uses LLM to extract search parameters from natural language
 */
async function parseUserInputNode(
  state: SamAgentState,
  apiKey?: string
): Promise<SamAgentState> {
  // Check if LLM is available using SVP settings
  const openaiApiKey = await getOpenAIApiKey();
  
  // If no OpenAI key from SVP settings, use simple regex parsing
  if (!openaiApiKey) {
    console.log("[SAM Agent] No LLM configured in SVP settings, using regex fallback");
    const { keywords, extractedFilters } = parseNaturalLanguageQuery(state.query);
    
    return {
      ...state,
      parsedParams: {
        q: keywords,
        ...extractedFilters,
        ...state.originalFilters,
        limit: state.originalFilters.limit || 100,
        offset: state.originalFilters.offset || 0,
      },
    };
  }

  const openai = await getOpenAIClientInstance();
  if (!openai) {
    console.log("[SAM Agent] OpenAI client not available, using regex fallback");
    const { keywords, extractedFilters } = parseNaturalLanguageQuery(state.query);
    
    return {
      ...state,
      parsedParams: {
        q: keywords,
        ...extractedFilters,
        ...state.originalFilters,
        limit: state.originalFilters.limit || 100,
        offset: state.originalFilters.offset || 0,
      },
    };
  }

  try {
    const prompt = buildParsingPrompt(state.query, state.originalFilters);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for cost efficiency
      messages: [
        {
          role: "system",
          content:
            "You are a specialized parser for SAM.gov (System for Award Management) federal contract opportunity searches. Extract structured search parameters from natural language queries. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    const parsed = JSON.parse(content);

    return {
      ...state,
      parsedParams: {
        q: parsed.keywords || "",
        naics_code: parsed.naics_code,
        psc_code: parsed.psc_code,
        set_aside: parsed.set_aside,
        notice_type: parsed.notice_type,
        pop_state: parsed.pop_state,
        is_active: parsed.is_active ?? "true",
        response_date_from: parsed.response_date_from,
        response_date_to: parsed.response_date_to,
        posted_from: parsed.posted_from,
        posted_to: parsed.posted_to,
        limit: state.originalFilters.limit || 100,
        offset: state.originalFilters.offset || 0,
        ...state.originalFilters, // User filters override parsed
      },
    };
  } catch (error) {
    console.error("LLM parsing failed, falling back to regex:", error);
    
    // Fallback to simple parsing
    const { keywords, extractedFilters } = parseNaturalLanguageQuery(state.query);
    
    return {
      ...state,
      parsedParams: {
        q: keywords,
        ...extractedFilters,
        ...state.originalFilters,
        limit: state.originalFilters.limit || 100,
        offset: state.originalFilters.offset || 0,
      },
    };
  }
}

/**
 * Search opportunities node - Execute SAM.gov API search
 */
async function searchOpportunitiesNode(
  state: SamAgentState
): Promise<SamAgentState> {
  try {
    const response = await searchOpportunities(state.parsedParams);

    return {
      ...state,
      searchResults: response.opportunities,
    };
  } catch (error) {
    console.error("Search failed:", error);
    return {
      ...state,
      searchResults: [],
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}

/**
 * Analyze results node - Generate AI recommendations based on search results
 */
async function analyzeResultsNode(
  state: SamAgentState
): Promise<SamAgentState> {
  // Check if LLM is available using SVP settings
  const openaiApiKey = await getOpenAIApiKey();
  
  // Skip analysis if no results or no LLM configured
  if (state.searchResults.length === 0 || !openaiApiKey) {
    return state;
  }

  const openai = await getOpenAIClientInstance();
  if (!openai) {
    console.log("[SAM Agent] OpenAI client not available, skipping analysis");
    return state;
  }

  try {
    const prompt = buildAnalysisPrompt(state.query, state.searchResults);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a federal contracting advisor. Analyze SAM.gov search results and provide brief, actionable recommendations. Be concise and highlight the most relevant opportunities.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const recommendation = response.choices[0]?.message?.content || undefined;

    return {
      ...state,
      recommendation,
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    return state; // Don't fail the entire search if analysis fails
  }
}

/**
 * Build the parsing prompt for the LLM
 */
function buildParsingPrompt(
  query: string,
  existingFilters: Partial<SamSearchParams>
): string {
  return `Parse the following natural language query for SAM.gov federal contract opportunity search and extract structured parameters.

Query: "${query}"

Extract the following fields (return null if not present):
- keywords: The main search terms (cleaned up, without filter values)
- naics_code: 6-digit NAICS code if mentioned (e.g., "541511")
- psc_code: PSC/FSC code if mentioned (e.g., "D301")
- set_aside: Set-aside type if mentioned. Valid values: "NONE", "SBA" (Small Business), "WOSB" (Women-Owned), "SDVOSB" (Service-Disabled Veteran-Owned), "8A" (8(a) Program), "HUBZone", "EDWOSB" (Economically Disadvantaged WOSB)
- notice_type: Contract notice type. Valid values: "o" (Solicitation), "p" (Presolicitation), "a" (Award Notice), "r" (Sources Sought), "s" (Special Notice), "g" (Sale of Surplus Property)
- pop_state: State code for place of performance (e.g., "CA", "TX")
- is_active: "true" or "false" for active/inactive opportunities (default to "true" if not specified)
- response_date_from: Response deadline from date (YYYY-MM-DD format)
- response_date_to: Response deadline to date (YYYY-MM-DD format)
- posted_from: Posted date from (YYYY-MM-DD format)
- posted_to: Posted date to (YYYY-MM-DD format)

User-provided filters (override these if explicitly mentioned in query):
${JSON.stringify(existingFilters, null, 2)}

Return ONLY a JSON object with this exact structure:
{
  "keywords": "string",
  "naics_code": "string or null",
  "psc_code": "string or null",
  "set_aside": "string or null",
  "notice_type": "string or null",
  "pop_state": "string or null",
  "is_active": "string or null",
  "response_date_from": "string or null",
  "response_date_to": "string or null",
  "posted_from": "string or null",
  "posted_to": "string or null"
}`;
}

/**
 * Build the analysis prompt for the LLM
 */
function buildAnalysisPrompt(
  query: string,
  results: SamOpportunity[]
): string {
  const resultsSummary = results
    .slice(0, 5)
    .map(
      (opp, i) =>
        `${i + 1}. ${opp.title}\n   Agency: ${opp.organizationHierarchy?.split(".")[0]}\n   NAICS: ${opp.naicsCode}\n   Deadline: ${opp.responseDeadLine || "N/A"}\n   Set-Aside: ${opp.typeOfSetAside || "None"}`
    )
    .join("\n\n");

  return `Based on the search query "${query}", analyze these top SAM.gov opportunities:

${resultsSummary}

Provide a brief analysis (2-3 sentences) highlighting:
1. The most relevant opportunities for the query
2. Any notable patterns (e.g., common agencies, set-asides, deadlines)
3. Recommended next steps

Keep your response concise and actionable.`;
}

/**
 * Fetch detailed opportunity information with resources
 */
export async function fetchFullOpportunityDetails(
  noticeId: string
): Promise<SamOpportunity | null> {
  const opportunity = await fetchOpportunityDetails(noticeId);
  
  if (!opportunity) {
    return null;
  }

  // Could fetch additional resources here if needed
  // const resources = await fetchResourceLinks(noticeId, apiKey);
  // opportunity.resourceLinks = resources;

  return opportunity;
}

/**
 * Quick search - Simple keyword search without LLM parsing
 */
export async function quickSearch(
  keywords: string,
  limit: number = 25
): Promise<SamSearchResponse> {
  return searchOpportunities(
    {
      q: keywords,
      is_active: "true",
      limit,
      offset: 0,
    }
  );
}
