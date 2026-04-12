import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * SAM.gov public web API endpoint (no API key required)
 * Uses the /sgs/v1/search/ endpoint with index=opp (opportunities)
 * Then extracts unique organizations/companies from award data
 */
const SAM_SEARCH_URL = "https://sam.gov/api/prod/sgs/v1/search/";

const SAM_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Content-Type": "application/json",
  "User-Agent": "SamGovApiServer/1.0.0",
};

export interface CompanySearchParams {
  keyword?: string;
  state?: string;        // legacy single
  states?: string[];     // multi-select
  naicsCode?: string;    // legacy single
  naicsCodes?: string[]; // multi-select
  entityTypes?: string[];
  businessTypes?: string[];
  registrationStatus?: "active" | "inactive" | "all";
  limit?: number;
  page?: number;
}

export interface SamCompany {
  ueiSAM: string;
  legalBusinessName: string;
  dbaName?: string;
  registrationStatus?: string;
  registrationExpirationDate?: string;
  activationDate?: string;
  lastUpdateDate?: string;
  ueiStatus?: string;
  entityStructure?: string;
  entityType?: string;
  organizationType?: string;
  businessTypes?: string[];
  naicsCode?: string;
  naicsCodes?: string[];
  primaryNaics?: string;
  physicalAddress?: {
    addressLine1?: string;
    city?: string;
    stateOrProvinceCode?: string;
    zipCode?: string;
    countryCode?: string;
  };
  mailingAddress?: {
    addressLine1?: string;
    city?: string;
    stateOrProvinceCode?: string;
    zipCode?: string;
    countryCode?: string;
  };
  pointOfContact?: {
    firstName?: string;
    lastName?: string;
    title?: string;
    email?: string;
    phone?: string;
  };
  cageCode?: string;
  dodaac?: string;
  samUrl?: string;
  samSearchUrl?: string;
  hasRealUei?: boolean;
  // Certifications / set-asides
  sbaBusinessTypes?: string[];
  isSmallBusiness?: boolean;
  isWomanOwned?: boolean;
  isVeteranOwned?: boolean;
  isServiceDisabledVeteranOwned?: boolean;
  isHubZone?: boolean;
  is8aProgram?: boolean;
  // Related contracts (from opportunity search)
  relatedOpportunities?: Array<{
    noticeId: string;
    title: string;
    type?: string;
    postedDate?: string;
    naicsCode?: string;
    awardAmount?: number;
    awardDate?: string;
    department?: string;
    uiLink: string;
  }>;
}

function transformEntityResult(raw: any): SamCompany {
  const entity = raw.entity || raw;
  const regInfo = entity.registrationDetails || entity.registration || entity;
  const coreData = entity.coreData || entity;
  const assertions = entity.assertions || entity;

  const physAddr =
    coreData.physicalAddress ||
    regInfo.physicalAddress ||
    entity.physicalAddress ||
    raw.physicalAddress;

  const mailingAddr =
    coreData.mailingAddress ||
    regInfo.mailingAddress ||
    entity.mailingAddress;

  // NAICS codes
  const naicsArr: any[] = coreData.naicsCode || regInfo.naicsCode || entity.naicsCodes || [];
  const primaryNaics =
    (Array.isArray(naicsArr) ? naicsArr.find((n: any) => n.isPrimary || n.primary)?.naicsCode || naicsArr[0]?.naicsCode || naicsArr[0] : naicsArr) ||
    raw.naicsCode ||
    "";

  // Business / entity type
  const entityStructure =
    coreData.entityStructure?.description ||
    coreData.entityStructure ||
    regInfo.entityStructure ||
    raw.entityStructure ||
    "";

  const businessTypes: string[] = [];
  const rawBiz: any[] = assertions.goodsAndServices?.businessTypeList || coreData.businessTypeList || regInfo.businessTypes || [];
  rawBiz.forEach((b: any) => {
    const desc = b.businessTypeDescription || b.description || b;
    if (desc) businessTypes.push(String(desc));
  });

  // SBA certifications
  const certList: any[] = assertions.certifications?.sbaBusinessProgramsList || [];
  const certNames = certList.map((c: any) => c.sbaBusinessProgramDescription || c.description || "");
  const isSmallBusiness = certNames.some((c) => /small business/i.test(c)) || businessTypes.some((b) => /small business/i.test(b));
  const isWomanOwned = certNames.some((c) => /wosb|woman/i.test(c)) || businessTypes.some((b) => /wosb|woman/i.test(b));
  const isVeteranOwned = certNames.some((c) => /veteran/i.test(c)) || businessTypes.some((b) => /veteran/i.test(b));
  const isServiceDisabledVeteranOwned = certNames.some((c) => /service.disabled/i.test(c)) || businessTypes.some((b) => /service.disabled/i.test(b));
  const isHubZone = certNames.some((c) => /hubzone/i.test(c));
  const is8aProgram = certNames.some((c) => /8\(a\)|8a/i.test(c));

  const ueiSAM =
    raw.ueiSAM || raw._id || entity.ueiSAM || regInfo.ueiSAM || coreData.ueiSAM || "";

  return {
    ueiSAM,
    legalBusinessName:
      raw.legalBusinessName ||
      coreData.legalBusinessName ||
      regInfo.legalBusinessName ||
      entity.legalBusinessName ||
      "Unknown",
    dbaName:
      raw.dbaName || coreData.dbaName || regInfo.dbaName || undefined,
    registrationStatus:
      raw.registrationStatus ||
      regInfo.registrationStatus ||
      entity.registrationStatus ||
      undefined,
    registrationExpirationDate:
      regInfo.registrationExpirationDate ||
      entity.registrationExpirationDate ||
      undefined,
    activationDate: regInfo.activationDate || entity.activationDate || undefined,
    lastUpdateDate: raw.lastModifiedDate || regInfo.lastUpdateDate || undefined,
    entityStructure: String(entityStructure),
    businessTypes,
    naicsCode: String(primaryNaics) || undefined,
    naicsCodes: Array.isArray(naicsArr)
      ? naicsArr.map((n: any) => n.naicsCode || n).filter(Boolean).map(String)
      : [],
    primaryNaics: String(primaryNaics) || undefined,
    physicalAddress: physAddr
      ? {
          addressLine1: physAddr.addressLine1 || physAddr.streetAddress || undefined,
          city: physAddr.city?.name || physAddr.city || undefined,
          stateOrProvinceCode:
            physAddr.stateOrProvinceCode ||
            physAddr.state?.code ||
            physAddr.state ||
            undefined,
          zipCode: physAddr.zipCode || physAddr.zip || undefined,
          countryCode:
            physAddr.countryCode ||
            physAddr.country?.code ||
            physAddr.country ||
            undefined,
        }
      : undefined,
    mailingAddress: mailingAddr
      ? {
          addressLine1: mailingAddr.addressLine1 || undefined,
          city: mailingAddr.city?.name || mailingAddr.city || undefined,
          stateOrProvinceCode:
            mailingAddr.stateOrProvinceCode ||
            mailingAddr.state?.code ||
            mailingAddr.state ||
            undefined,
          zipCode: mailingAddr.zipCode || mailingAddr.zip || undefined,
        }
      : undefined,
    cageCode: raw.cageCode || regInfo.cageCode || undefined,
    samUrl: `https://sam.gov/entity/${ueiSAM}/core-data`,
    sbaBusinessTypes: certNames.filter(Boolean),
    isSmallBusiness,
    isWomanOwned,
    isVeteranOwned,
    isServiceDisabledVeteranOwned,
    isHubZone,
    is8aProgram,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CompanySearchParams = await request.json();
    const {
      keyword = "",
      state,
      states: statesParam,
      naicsCode,
      naicsCodes: naicsCodesParam,
      entityTypes = [],
      businessTypes = [],
      registrationStatus = "active",
      limit = 100,
      page = 0,
    } = body;

    // Normalise to a single array of uppercase 2-letter codes
    const stateList: string[] = (
      statesParam && statesParam.length > 0 ? statesParam
      : state ? [state]
      : []
    ).map((s) => s.trim().toUpperCase().substring(0, 2));

    // Normalise to a single array (support both legacy single and new multi)
    const naicsCodeList: string[] = naicsCodesParam && naicsCodesParam.length > 0
      ? naicsCodesParam
      : naicsCode ? [naicsCode] : [];

    // SAM.gov entity search (index=ent) requires an API key — not available here.
    // Strategy: fan out across many keywords × multiple pages in parallel.
    // 30 keywords × 3 pages × 100 results × ~30% awardee fill ≈ 2,700 unique companies.
    const trimmedKeyword = keyword.trim();

    // 30 broad gov-contracting terms — each reliably returns award-heavy results
    const DEFAULT_KEYWORDS = [
      "construction", "services", "support", "systems", "technology",
      "engineering", "solutions", "management", "logistics", "maintenance",
      "consulting", "security", "information", "supply", "defense",
      "communications", "training", "research", "medical", "facilities",
      "aviation", "software", "hardware", "infrastructure", "environmental",
      "transportation", "manufacturing", "staffing", "intelligence", "cyber",
    ];

    // How many SAM pages to fetch per keyword (100 results each)
    const PAGES_PER_KEYWORD = 3;  // 30 kw × 3 pages = 90 requests = 9,000 opportunities
    const PAGES_FOR_USER_KW  = 10; // user keyword: 10 pages = 1,000 results

    // Build one fetch URL
    const buildUrl = (q: string, samPage = 0) => {
      const p: Record<string, string> = {
        index: "opp",
        limit: "100",
        page: String(samPage),
        sort: "-modifiedDate",
        q,
      };
      // NOTE: pop_state filters place-of-performance (contract work location), NOT company address.
      // State filtering is applied client-side below on the company's physicalAddress.
      if (naicsCodeList.length === 1) p.naics = naicsCodeList[0];
      let u = SAM_SEARCH_URL + "?";
      Object.keys(p).forEach((k) => { u += `${k}=${encodeURIComponent(p[k])}&`; });
      return u.slice(0, -1);
    };

    const fetchOne = (q: string, pg: number): Promise<any[]> =>
      fetch(buildUrl(q, pg), { method: "GET", headers: SAM_HEADERS })
        .then((r) => r.ok ? r.json() : { _embedded: { results: [] } })
        .then((d: any) => (d._embedded?.results || []) as any[]);

    // Build all fetch tasks
    const fetchTasks: Promise<any[]>[] = [];

    if (trimmedKeyword) {
      // User typed a keyword: fetch 10 pages of that single keyword
      for (let pg = 0; pg < PAGES_FOR_USER_KW; pg++) {
        fetchTasks.push(fetchOne(trimmedKeyword, pg));
      }
    } else {
      // Blank search: 30 keywords × 3 pages each = 90 parallel requests
      for (const kw of DEFAULT_KEYWORDS) {
        for (let pg = 0; pg < PAGES_PER_KEYWORD; pg++) {
          fetchTasks.push(fetchOne(kw, pg));
        }
      }
    }

    // Fire everything in parallel
    const batchResults = await Promise.all(fetchTasks);
    const opportunities: any[] = batchResults.flat();
    console.log(`[Company Search] Fetched ${opportunities.length} opps via ${fetchTasks.length} parallel requests`);

    type RelatedOpp = NonNullable<SamCompany["relatedOpportunities"]>[number];

    // Helper to add or update a company in the map
    const upsertCompany = (
      mapKey: string,
      company: SamCompany,
      relatedOpp: RelatedOpp | undefined
    ) => {
      if (!companyMap.has(mapKey)) {
        companyMap.set(mapKey, {
          ...company,
          relatedOpportunities: relatedOpp ? [relatedOpp] : [],
        });
      } else {
        const existing = companyMap.get(mapKey)!;
        if (relatedOpp?.noticeId && !existing.relatedOpportunities?.find(r => r.noticeId === relatedOpp.noticeId)) {
          existing.relatedOpportunities = [...(existing.relatedOpportunities || []), relatedOpp];
        }
      }
    };

    // Extract unique companies from opportunity data
    const companyMap = new Map<string, SamCompany>();

    for (const opp of opportunities) {
      const noticeId = opp.noticeId || opp.id || opp._id || "";
      const naicsCode = extractNaicsFromOpp(opp);

      // Build org hierarchy label
      const orgArray: any[] = Array.isArray(opp.organizationHierarchy) ? opp.organizationHierarchy : [];
      const department = orgArray.find((h: any) => h.level === 1)?.name || orgArray[0]?.name || "";

      // Type label
      const typeObj = opp.type;
      const typeLabel = typeof typeObj === "object" ? (typeObj?.value || typeObj?.code) : typeObj;

      const relatedOpp = {
        noticeId,
        title: opp.title || "Untitled",
        type: typeLabel,
        postedDate: opp.postedDate || opp.publishDate,
        naicsCode,
        awardAmount: opp.award?.amount ? Number(opp.award.amount) : undefined,
        awardDate: opp.award?.date,
        department,
        uiLink: opp.uiLink || (noticeId ? `https://sam.gov/opp/${noticeId}/view` : ""),
      };

      // Helper to build a SamCompany from an awardee-like object
      const makeCompany = (awardee: any, nameOverride?: string): SamCompany => {
        const realUei = awardee?.ueiSAM || awardee?.uei || "";
        const name = nameOverride || awardee?.name || awardee?.legalBusinessName || "";
        const loc = awardee?.location || awardee?.address || awardee?.physicalAddress;
        return {
          ueiSAM: realUei,
          legalBusinessName: name,
          hasRealUei: !!realUei,
          samUrl: realUei
            ? `https://sam.gov/search?index=ent&q=${encodeURIComponent(realUei)}`
            : `https://sam.gov/search?index=ent&q=${encodeURIComponent(name)}`,
          samSearchUrl: `https://sam.gov/search?index=ent&q=${encodeURIComponent(name)}`,
          registrationStatus: "Active",
          naicsCode,
          cageCode: awardee?.cageCode || undefined,
          physicalAddress: loc ? (() => {
            const rawCity = loc.city?.name || loc.city || "";
            // SAM sometimes stores a zip code (numeric) in the city field — discard it
            const cityVal = rawCity && /^\d+$/.test(String(rawCity).trim()) ? "" : rawCity;
            const rawState = loc.state?.code || loc.state?.name || loc.state || "";
            // SAM sometimes stores full state name in state field — normalise to 2-letter code
            const stateVal = typeof rawState === "string" && rawState.length > 2
              ? rawState.substring(0, 2).toUpperCase()
              : rawState;
            return {
              addressLine1: loc.streetAddress || loc.street || loc.addressLine1,
              city: cityVal || undefined,
              stateOrProvinceCode: stateVal || undefined,
              zipCode: loc.zip || loc.zipCode || loc.postalCode || undefined,
              countryCode: loc.country?.code || loc.country || undefined,
            };
          })() : undefined,
        };
      };

      // Extract from award.awardee — only if name is actually populated (not null)
      const award = opp.award || opp.data2?.award;
      const awardee = award?.awardee;
      const awardeeName = awardee?.name || awardee?.legalBusinessName || "";
      const awardeeUei = awardee?.ueiSAM || awardee?.uei || "";

      if (awardeeName || awardeeUei) {
        const mapKey = awardeeUei || awardeeName;
        upsertCompany(mapKey, makeCompany(awardee), relatedOpp);
      }

      // award.awardees array (multi-award contracts)
      const awardees: any[] = award?.awardees || [];
      for (const ae of awardees) {
        const aeName = ae.name || ae.legalBusinessName || "";
        const aeUei = ae.ueiSAM || ae.uei || "";
        if (aeName || aeUei) {
          upsertCompany(aeUei || aeName, makeCompany(ae), relatedOpp);
        }
      }
    }

    console.log(`[Company Search] Unique companies extracted: ${companyMap.size}`);
    if (companyMap.size === 0 && opportunities.length > 0) {
      // Log the raw keys of a few opportunities so we can see the real structure
      const sample = opportunities.slice(0, 3);
      console.log("[Company Search] No companies found. Sample keys:", sample.map(o => Object.keys(o).join(",")));
    }

    // Convert map to array and apply additional filters
    let companies = Array.from(companyMap.values());

    // Filter by company physical address state — exact 2-letter code match.
    // SAM.gov rarely returns location data for awardees in the public API.
    // Only exclude companies whose state is KNOWN and does NOT match any selected state.
    if (stateList.length > 0) {
      companies = companies.filter((c) => {
        const rawState = c.physicalAddress?.stateOrProvinceCode || "";
        // Normalise: trim, uppercase, take first 2 chars
        const knownState = rawState.trim().toUpperCase().substring(0, 2);
        if (!knownState) return true; // no address data — keep it
        return stateList.includes(knownState);
      });
    }

    // Filter by NAICS codes when multiple are selected (single code already filtered by SAM.gov)
    if (naicsCodeList.length > 1) {
      companies = companies.filter((c) =>
        naicsCodeList.some((nc) =>
          c.naicsCode === nc ||
          (c.naicsCodes || []).includes(nc) ||
          c.relatedOpportunities?.some((o) => o.naicsCode === nc)
        )
      );
    }

    // Filter by business type keywords if specified
    if (businessTypes.length > 0) {
      const typeKeywords = businessTypes.flatMap((code) => {
        const keywords: Record<string, string[]> = {
          A2: ["small business", "small"],
          A5: ["woman", "women", "wosb"],
          QF: ["veteran", "vet"],
          A6: ["service disabled", "sdvosb"],
          XX: ["hubzone", "hub zone"],
          "27": ["8a", "8(a)"],
        };
        return keywords[code] || [];
      });
      
      companies = companies.filter((c) =>
        typeKeywords.some((kw) =>
          c.legalBusinessName.toLowerCase().includes(kw) ||
          (c.entityStructure?.toLowerCase() || "").includes(kw)
        )
      );
    }

    // Sort by company name
    companies.sort((a, b) => a.legalBusinessName.localeCompare(b.legalBusinessName));

    // Apply pagination
    const total = companies.length;
    const start = page * limit;
    const paginated = companies.slice(start, start + limit);

    return NextResponse.json({
      companies: paginated,
      total,
      page,
      query: { keyword, state, naicsCodes: naicsCodeList, entityTypes, businessTypes, registrationStatus },
      _note: "Results extracted from opportunity award data. For full SAM.gov entity search, an API key is required.",
    });
  } catch (error) {
    console.error("[Company Search] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

// Helper to extract NAICS from opportunity data
function extractNaicsFromOpp(opp: any): string | undefined {
  const naicsArr: any[] = Array.isArray(opp.naics) ? opp.naics
    : Array.isArray(opp.naicsCode) ? opp.naicsCode
    : Array.isArray(opp.naicsCodes) ? opp.naicsCodes : [];
  return naicsArr[0]?.code || (typeof opp.naicsCode === "string" ? opp.naicsCode : undefined);
}
