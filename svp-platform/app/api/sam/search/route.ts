import { NextRequest, NextResponse } from "next/server";
import { runSamAgent } from "@/lib/sam/samAgent";
import { searchOpportunities } from "@/lib/sam/samApiClient";
import { getOpenAIApiKey } from "@/lib/openai-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters } = body;
    
    console.log("[SAM Search] Received request:", { query, filters });

    // Check if LLM-enhanced search is enabled (uses SVP built-in LLM settings)
    const openaiApiKey = await getOpenAIApiKey();
    const useAgent = !!openaiApiKey && query && query.trim().length > 0;
    console.log("[SAM Search] Using LLM Agent:", useAgent, "(SVP LLM configured:", !!openaiApiKey, ")");

    let result;

    if (useAgent) {
      // Use SAM Agent for natural language parsing and search
      console.log("[SAM Search] Calling runSamAgent...");
      result = await runSamAgent(query, filters || {});
      console.log("[SAM Search] runSamAgent result:", { 
        total: result.total, 
        hasError: !!result.error,
        error: result.error 
      });
      
      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
    } else {
      // Use direct API search without LLM parsing
      console.log("[SAM Search] Calling searchOpportunities directly...");
      const searchResult = await searchOpportunities(
        {
          q: query,
          ...filters,
          limit: filters?.limit || 100,
          offset: filters?.offset || 0,
        }
      );
      console.log("[SAM Search] searchOpportunities result:", { 
        total: searchResult.total,
        opportunitiesCount: searchResult.opportunities.length 
      });

      result = {
        searchResults: searchResult.opportunities,
        parsedParams: searchResult.filters || {},
        total: searchResult.total,
      };
    }

    return NextResponse.json({
      opportunities: result.searchResults,
      total: result.total,
      query,
      filters: result.parsedParams,
      recommendation: result.recommendation,
      usedAgent: useAgent,
    });
  } catch (error) {
    console.error("[SAM Search] Unhandled error:", error);
    console.error("[SAM Search] Error stack:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
