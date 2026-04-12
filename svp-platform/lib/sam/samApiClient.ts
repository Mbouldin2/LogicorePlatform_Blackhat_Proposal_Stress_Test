/**
 * SAM.gov API Client - Using Public Web API Endpoints
 * 
 * These endpoints are used by the SAM.gov website itself and don't require an API key.
 */

// SAM.gov public web API endpoints - no API key required (Cgray method)
// The /sgs/v1/search/ endpoint is used by the SAM.gov website itself
const SAM_SEARCH_URL = "https://sam.gov/api/prod/sgs/v1/search/";
const SAM_OPP_DETAIL_URL = "https://sam.gov/api/prod/opps/v2/opportunities";
const SAM_RESOURCES_API_BASE_URL = "https://sam.gov/api/prod/opps/v3/opportunities";

export interface SamSearchParams {
  q?: string;
  naics_code?: string;
  psc_code?: string;
  set_aside?: string;
  notice_type?: string;
  pop_state?: string;
  is_active?: string;
  response_date_from?: string;
  response_date_to?: string;
  posted_from?: string;
  posted_to?: string;
  limit?: number;
  offset?: number;
}

export interface SamOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  active?: string;
  type?: string;
  organizationHierarchy?: string;
  postedDate?: string;
  responseDeadLine?: string;
  naicsCode?: string;
  classificationCode?: string;
  typeOfSetAside?: string;
  description?: string;
  pointOfContact?: Array<{
    name: string;
    email?: string;
    phone?: string;
  }>;
  resourceLinks?: Array<{
    url: string;
    description?: string;
    name?: string;
    downloadUrl?: string;
  }>;
  uiLink?: string;
  award?: {
    date?: string;
    amount?: number;
    awardee?: string;
  };
  placeOfPerformance?: {
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  additionalInfo?: string;
  awardDate?: string;
  awardNumber?: string;
  solicitationMethods?: string;
  contractingOffice?: string;
  fundingAgency?: string;
  archiveDate?: string;
  lastModifiedDate?: string;
  department?: string;
  subTier?: string;
  office?: string;
  publishDate?: string;
  fiscalYear?: string;
  estimatedContractValue?: string;
  contractAwardValue?: string;
  totalContractValue?: string;
  estimatedTotalContractValue?: string;
  contractBaseAndAllOptionsValue?: string;
}

export interface SamSearchResponse {
  opportunities: SamOpportunity[];
  total: number;
  totalRecords: number;
  query?: string;
  filters?: SamSearchParams;
}

// Default headers matching the SAM.gov website (Cgray method)
const SAM_HEADERS = {
  "Accept": "application/json, text/plain, */*",
  "Content-Type": "application/json",
  "User-Agent": "SamGovApiServer/1.0.0",
};

/**
 * Search SAM.gov opportunities using the public web API (no API key required)
 * Uses /sgs/v1/search/ with index=opp to filter to contract opportunities only
 * Based on the working Cgray implementation
 */
export async function searchOpportunities(
  params: SamSearchParams
): Promise<SamSearchResponse> {
  try {
    console.log("[SAM API Client] Searching with params:", { q: params.q, naics: params.naics_code });

    const requestedLimit = params.limit || 100;
    const MAX_RESULTS = Math.min(requestedLimit, 1000);
    const PAGE_SIZE = 10;
    const allOpportunities: SamOpportunity[] = [];
    let totalRecords = 0;
    // SAM.gov /sgs/v1/search uses 'page' (0-based), NOT 'offset'
    let currentPage = Math.floor((params.offset || 0) / PAGE_SIZE);
    let pageCount = 0;
    const MAX_PAGES = Math.ceil(MAX_RESULTS / PAGE_SIZE);

    while (pageCount < MAX_PAGES) {
      // Build params matching the SAM.gov website search exactly
      // Mirrors: https://sam.gov/search/?index=opp&sort=-modifiedDate&sfm[status][is_active]=true
      const urlParams: Record<string, string> = {
        index: "opp",              // contracting opportunities only
        limit: String(PAGE_SIZE),
        page: String(currentPage), // SAM.gov uses page not offset
        sort: "-modifiedDate",     // newest first, matches SAM.gov default
        random: String(Date.now() + pageCount),
      };

      // Active status filter (default true)
      const isActive = params.is_active ?? "true";
      if (isActive === "true") urlParams.is_active = "true";
      else if (isActive === "false") urlParams.is_active = "false";

      // Keyword: wrap in quotes for exact phrase matching when multi-word
      if (params.q) {
        const kw = params.q.trim();
        urlParams.q = kw.includes(" ") ? `"${kw}"` : kw;
      }

      if (params.naics_code) urlParams.naics = params.naics_code;
      if (params.psc_code) urlParams.psc = params.psc_code;
      if (params.set_aside) urlParams.set_aside = params.set_aside.toUpperCase();
      if (params.notice_type) urlParams.notice_type = params.notice_type;
      if (params.pop_state) urlParams.pop_state = params.pop_state.toUpperCase();
      if (params.posted_from) urlParams["modified_date.from"] = params.posted_from;
      if (params.posted_to) urlParams["modified_date.to"] = params.posted_to;
      if (params.response_date_from) urlParams["response_date.from"] = params.response_date_from;
      if (params.response_date_to) urlParams["response_date.to"] = params.response_date_to;

      let url = SAM_SEARCH_URL + "?";
      Object.keys(urlParams).forEach(key => {
        url += `${key}=${encodeURIComponent(urlParams[key])}&`;
      });
      url = url.slice(0, -1);

      console.log(`[SAM API Client] Fetching page ${pageCount + 1} (api page: ${currentPage})`);

      const response = await fetch(url, { method: "GET", headers: SAM_HEADERS });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[SAM API Client] SAM.gov API error:", response.status, errorText.substring(0, 200));
        throw new Error(`SAM.gov API error: ${response.status}`);
      }

      const data = await response.json();

      if (pageCount === 0) {
        totalRecords = data.page?.totalElements || 0;
        console.log(`[SAM API Client] Total records available: ${totalRecords}`);
        if (data._embedded?.results?.[0]) {
          const first = data._embedded.results[0];
          console.log("[SAM API Client] First result type:", first._samdotgovType, "id:", first._id);
        }
      }

      const results: any[] = data._embedded?.results || [];
      console.log(`[SAM API Client] Page ${pageCount + 1} returned ${results.length} results`);

      if (results.length === 0) break;

      const transformed = transformSamResponse(results);
      transformed.forEach((opp: SamOpportunity) => {
        if (!allOpportunities.find(e => e.noticeId === opp.noticeId)) {
          allOpportunities.push(opp);
        }
      });

      console.log(`[SAM API Client] Total so far: ${allOpportunities.length}`);

      if (allOpportunities.length >= MAX_RESULTS) break;
      if (results.length === 0) break;

      currentPage++;
      pageCount++;
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    console.log(`[SAM API Client] Total opportunities fetched: ${allOpportunities.length}`);

    return {
      opportunities: allOpportunities,
      total: totalRecords,
      totalRecords,
      query: params.q,
      filters: params,
    };
  } catch (error) {
    console.error("[SAM API Client] Error in searchOpportunities:", error);
    throw error;
  }
}

/**
 * Fetch detailed opportunity information
 */
export async function fetchOpportunityDetails(
  noticeId: string
): Promise<SamOpportunity | null> {
  // Use the direct opportunity detail endpoint (Cgray method)
  const url = `${SAM_OPP_DETAIL_URL}/${noticeId}?random=${Date.now()}`;

  const response = await fetch(url, { method: "GET", headers: SAM_HEADERS });

  if (!response.ok) {
    console.warn(`[SAM API Client] fetchOpportunityDetails ${noticeId}: ${response.status}`);
    return null;
  }

  const raw = await response.json();

  // v2 detail API wraps most fields inside data2
  const data2 = raw.data2 || {};
  const resolvedNoticeId = raw.opportunityId || raw.id || noticeId;

  // naics: v2 returns [{code: ["541715"], type: "primary"}] — extract first code string
  const naicsRaw: any[] = data2.naics || [];
  const naicsCode: string | undefined = naicsRaw[0]?.code?.[0] || naicsRaw[0]?.code || undefined;

  // type: v2 returns short code "o","k","s" etc — map to readable label
  const typeCodeMap: Record<string, string> = {
    o: "Solicitation", k: "Combined Synopsis/Solicitation", p: "Presolicitation",
    r: "Sources Sought", g: "Sale of Surplus Property", s: "Special Notice",
    i: "Intent to Bundle", a: "Award Notice", u: "Justification",
    j: "Justification and Approval", m: "Modification/Amendment",
  };
  const typeCode = data2.type || "";
  const typeLabel = typeCodeMap[typeCode] || typeCode;

  // setAside: v2 returns plain string "NONE", "SBA", etc — pass through as-is
  const typeOfSetAside = data2.solicitation?.setAside || undefined;

  // contacts: v2 uses fullName not name
  const rawContacts: any[] = data2.pointOfContact || [];
  const contacts = rawContacts.map((c: any) => ({
    name: c.fullName || c.name || "",
    email: c.email || "",
    phone: c.phone || "",
    title: c.title || "",
    type: c.type || "",
  }));

  // description: top-level array [{body: "<html>..."}]
  const descArr: any[] = Array.isArray(raw.description) ? raw.description : [];
  const description = descArr[0]?.body || descArr[0]?.content || "";

  // placeOfPerformance: v2 returns object directly (not array)
  const pop = data2.placeOfPerformance || {};
  const placeOfPerformance = pop ? {
    city: pop.city?.name || pop.city || undefined,
    state: pop.state?.code || pop.state?.name || pop.state || undefined,
    zip: pop.zip || pop.zipCode || undefined,
    country: pop.country?.code || pop.country?.name || pop.country || undefined,
  } : undefined;

  // Build a fully normalized object — bypass transformSamResponse for v2 detail
  const opportunity: SamOpportunity = {
    noticeId: resolvedNoticeId,
    title: data2.title || "Untitled",
    solicitationNumber: data2.solicitationNumber || undefined,
    type: typeLabel,
    active: raw.archived === false && raw.cancelled === false ? "Yes" : "No",
    postedDate: raw.postedDate,
    responseDeadLine: data2.solicitation?.deadlines?.response || undefined,
    archiveDate: data2.archive?.date || undefined,
    lastModifiedDate: raw.modifiedDate || raw.lastModifiedDate || undefined,
    naicsCode,
    classificationCode: typeof data2.classificationCode === "string" ? data2.classificationCode : undefined,
    typeOfSetAside,
    description,
    pointOfContact: contacts,
    resourceLinks: [],
    uiLink: `https://sam.gov/opp/${resolvedNoticeId}/view`,
    placeOfPerformance,
    organizationHierarchy: undefined,
    department: undefined,
    subTier: undefined,
    office: undefined,
  };

  return opportunity;
}

/**
 * Fetch resource links/attachments for an opportunity.
 * SAM.gov v3 resources API returns:
 *   _embedded.opportunityAttachmentList[].attachments[]
 * Each attachment has: type ("link"|"file"), uri, description, resourceId, attachmentId
 */
export async function fetchResourceLinks(
  noticeId: string
): Promise<Array<{ url: string; description?: string; name?: string; type?: string }>> {
  try {
    const url = `${SAM_RESOURCES_API_BASE_URL}/${noticeId}/resources?random=${Date.now()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: SAM_HEADERS,
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Correct structure: _embedded.opportunityAttachmentList[].attachments[]
    const attachmentList: any[] = data._embedded?.opportunityAttachmentList || [];
    const results: Array<{ url: string; description?: string; name?: string; type?: string }> = [];

    for (const entry of attachmentList) {
      for (const att of entry.attachments || []) {
        if (att.deletedFlag === "1" || att.accessLevel === "private") continue;

        let resolvedUrl = "";
        if (att.type === "link") {
          // External URL stored in uri field
          resolvedUrl = att.uri || "";
        } else {
          // SAM.gov file downloads require authentication — link to the opportunity
          // page on SAM.gov where the user can download files directly
          resolvedUrl = `https://sam.gov/opp/${noticeId}/view`;
        }

        if (!resolvedUrl) continue;

        results.push({
          url: resolvedUrl,
          description: att.description || att.name || "",
          name: att.name || att.description || `Attachment ${att.attachmentOrder || ""}`,
          type: att.type || "file",
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching resource links:", error);
    return [];
  }
}

/**
 * Transform SAM.gov /sgs/v1/search/ response items to standardized SamOpportunity format.
 * Handles the actual field structure returned by the search endpoint.
 */
export function transformSamResponse(opportunitiesData: any[]): SamOpportunity[] {
  return opportunitiesData
    .filter((opp: any) => {
      const t = opp._samdotgovType || opp._type || "";
      return t === "opportunity" || t === "" || (!opp.programNumber && !opp.legalBusinessName);
    })
    .map((opp: any) => {
      // ID: search results use _id, detail endpoint uses noticeId
      const noticeId = opp.noticeId || opp._id || opp.notice_id || "";

      // --- Organization hierarchy (array of objects) ---
      const orgArray: any[] = Array.isArray(opp.organizationHierarchy) ? opp.organizationHierarchy : [];
      const orgHierarchy = orgArray.length > 0
        ? orgArray.map((h: any) => h.name || "").filter(Boolean).join(".")
        : (typeof opp.organizationHierarchy === "string" ? opp.organizationHierarchy : undefined);
      const department = orgArray.find((h: any) => h.level === 1)?.name
        || orgArray[0]?.name
        || opp.department;
      const subTier = orgArray.find((h: any) => h.level === 2)?.name || opp.subTier;
      const office = orgArray.find((h: any) => h.level === 3)?.name || opp.office;

      // --- NAICS: array of {code, value} objects ---
      const naicsArr: any[] = Array.isArray(opp.naics) ? opp.naics
        : Array.isArray(opp.naicsCode) ? opp.naicsCode
        : Array.isArray(opp.naicsCodes) ? opp.naicsCodes : [];
      const naicsCode: string | undefined = naicsArr[0]?.code
        || (typeof opp.naicsCode === "string" ? opp.naicsCode : undefined);

      // --- PSC: array of {code, value} objects ---
      const pscArr: any[] = Array.isArray(opp.psc) ? opp.psc
        : Array.isArray(opp.classificationCode) ? opp.classificationCode
        : Array.isArray(opp.pscCodes) ? opp.pscCodes : [];
      const pscCode: string | undefined = pscArr[0]?.code
        || (typeof opp.classificationCode === "string" ? opp.classificationCode : undefined)
        || (typeof opp.pscCode === "string" ? opp.pscCode : undefined);

      // --- Place of performance: array of objects ---
      const popArr: any[] = Array.isArray(opp.placeOfPerformance) ? opp.placeOfPerformance : [];
      const popObj = popArr[0] || (typeof opp.placeOfPerformance === "object" && !Array.isArray(opp.placeOfPerformance) ? opp.placeOfPerformance : null);
      const placeOfPerformance = popObj ? {
        city: popObj.city?.name || (typeof popObj.city === "string" ? popObj.city : undefined),
        state: popObj.state?.code || popObj.state?.name || (typeof popObj.state === "string" ? popObj.state : undefined),
        zip: popObj.zip || popObj.zipCode,
        country: popObj.country?.code || popObj.country?.name || (typeof popObj.country === "string" ? popObj.country : undefined),
      } : undefined;

      // --- Type: object {code, value} ---
      const type = typeof opp.type === "object" ? opp.type?.value || opp.type?.code : opp.type;

      // --- Set-aside: solicitation.setAside is {code, value} ---
      const setAsideObj = opp.solicitation?.setAside || opp.typeOfSetAside;
      const typeOfSetAside = typeof setAsideObj === "object"
        ? setAsideObj?.value || setAsideObj?.code
        : setAsideObj;

      // --- Contacts: search uses pointOfContacts (plural) ---
      const contacts: any[] = opp.pointOfContacts || opp.pointOfContact || opp.contacts || [];

      // --- Dates ---
      const postedDate = opp.postedDate || opp.publishDate || opp.indexedDate;
      const responseDeadLine = opp.responseDeadLine
        || opp.solicitation?.deadlines?.response
        || opp.responseDate;
      const lastModifiedDate = opp.lastModifiedDate || opp.modifiedDate;

      // --- Active status ---
      const active = opp.active !== undefined ? String(opp.active)
        : opp.isActive !== undefined ? (opp.isActive ? "Yes" : "No")
        : "Yes";

      // --- Description: array of {content} objects ---
      const descArr: any[] = Array.isArray(opp.descriptions) ? opp.descriptions : [];
      const description = descArr[0]?.content
        || (typeof opp.description === "string" ? opp.description : undefined)
        || opp.objective;

      // --- Solicitation number ---
      const solicitationNumber = opp.solicitationNumber || opp.cleanSolicitationNumber
        || opp.fundingOpportunityNumber || opp.programNumber;

      // --- Contracting office from org hierarchy level 3 ---
      const contractingOffice = office
        || (typeof opp.contractingOffice === "string" ? opp.contractingOffice : undefined);

      // --- Award ---
      let award: SamOpportunity["award"] | undefined;
      if (opp.award && (opp.award.date || opp.award.amount || opp.award.awardee?.name)) {
        award = {
          date: opp.award.date,
          amount: opp.award.amount ? Number(opp.award.amount) : undefined,
          awardee: opp.award.awardee?.name || opp.award.awardee?.ueiSAM || undefined,
        };
      }

      return {
        noticeId,
        title: opp.title || "Untitled",
        solicitationNumber,
        active,
        type,
        organizationHierarchy: orgHierarchy,
        postedDate,
        responseDeadLine,
        naicsCode,
        classificationCode: pscCode,
        typeOfSetAside,
        description,
        pointOfContact: normalizeContacts(contacts),
        resourceLinks: opp.resourceLinks || [],
        uiLink: opp.uiLink || `https://sam.gov/opp/${noticeId}/view`,
        award,
        placeOfPerformance,
        archiveDate: opp.archiveDate,
        lastModifiedDate,
        department,
        subTier,
        office,
        publishDate: opp.publishDate,
        fiscalYear: opp.fiscalYear || opp.fiscalYearByAward || opp.fiscalYearByModification,
        contractingOffice,
        fundingAgency: opp.fundingAgency || (typeof opp.fundingOffice === "object" ? opp.fundingOffice?.name : opp.fundingOffice),
        estimatedContractValue: opp.estimatedContractValue,
        contractAwardValue: opp.contractAwardValue,
        totalContractValue: opp.totalContractValue,
        estimatedTotalContractValue: opp.estimatedTotalContractValue,
        contractBaseAndAllOptionsValue: opp.contractBaseAndAllOptionsValue,
      };
    });
}

/**
 * Extract NAICS code from various formats
 */
function extractNaicsCode(naicsData: any): string | undefined {
  if (!naicsData) return undefined;
  if (typeof naicsData === "string") return naicsData;
  if (Array.isArray(naicsData) && naicsData.length > 0) {
    return naicsData[0].code || naicsData[0];
  }
  return naicsData.code;
}

/**
 * Extract organization hierarchy from various formats
 */
function extractOrganizationHierarchy(hierarchyData: any): string | undefined {
  if (!hierarchyData) return undefined;
  if (typeof hierarchyData === "string") return hierarchyData;
  if (Array.isArray(hierarchyData) && hierarchyData.length > 0) {
    // Join hierarchy levels with dots
    return hierarchyData.map((h: any) => h.name || h.organizationId || h).join(".");
  }
  return hierarchyData.name || hierarchyData.organizationId;
}
function extractClassificationCode(classificationData: any): string | undefined {
  if (!classificationData) return undefined;
  if (typeof classificationData === "string") return classificationData;
  if (Array.isArray(classificationData) && classificationData.length > 0) {
    return classificationData[0].code || classificationData[0];
  }
  return classificationData.code;
}

/**
 * Normalize contact information
 */
function normalizeContacts(contacts: any[]): SamOpportunity["pointOfContact"] {
  if (!contacts || !Array.isArray(contacts)) return [];

  return contacts.map((contact) => ({
    name: contact.name || contact.fullName || "Unknown",
    email: contact.email || contact.emailAddress,
    phone: contact.phone || contact.phoneNumber || contact.fax,
    title: contact.title || contact.position,
    type: contact.type,
  }));
}

/**
 * Generate SAM.gov UI link for an opportunity
 */
export function generateSamLink(noticeId: string): string {
  return `https://sam.gov/opp/${noticeId}/view`;
}

/**
 * Parse natural language query to extract structured filters
 * This is a simple implementation - the SAM Agent will use LLM for better parsing
 */
export function parseNaturalLanguageQuery(query: string): {
  keywords: string;
  extractedFilters: Partial<SamSearchParams>;
} {
  const extractedFilters: Partial<SamSearchParams> = {};
  let cleanedQuery = query.toLowerCase();

  // Extract NAICS code
  const naicsMatch = query.match(/naics\s*(?:code)?\s*:?\s*(\d{6})/i);
  if (naicsMatch) {
    extractedFilters.naics_code = naicsMatch[1];
    cleanedQuery = cleanedQuery.replace(naicsMatch[0], "");
  }

  // Extract PSC code
  const pscMatch = query.match(/psc\s*(?:code)?\s*:?\s*([A-Z]\d{3,4})/i);
  if (pscMatch) {
    extractedFilters.psc_code = pscMatch[1].toUpperCase();
    cleanedQuery = cleanedQuery.replace(pscMatch[0], "");
  }

  // Extract state
  const stateMatch = query.match(/\b(in|at|for)\s+([A-Z]{2})\b/i);
  if (stateMatch) {
    extractedFilters.pop_state = stateMatch[2].toUpperCase();
    cleanedQuery = cleanedQuery.replace(stateMatch[0], "");
  }

  // Extract set-aside types
  const setAsides: Record<string, string> = {
    "small business": "SBA",
    "woman owned": "WOSB",
    "women owned": "WOSB",
    "veteran owned": "SDVOSB",
    "service disabled": "SDVOSB",
    "8a": "8A",
    "hubzone": "HUBZone",
    "hub zone": "HUBZone",
  };

  for (const [key, value] of Object.entries(setAsides)) {
    if (cleanedQuery.includes(key)) {
      extractedFilters.set_aside = value;
      cleanedQuery = cleanedQuery.replace(key, "");
      break;
    }
  }

  // Only strip navigation words, not content words - preserve the original query intent
  const navigationWords = new Set([
    "find", "search", "show", "get", "list", "looking", "for", "me",
    "opportunities", "contracts", "contract", "opportunity", "federal", "government"
  ]);

  const words = cleanedQuery
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0 && !navigationWords.has(word));

  // If stripping leaves nothing or very little, use the original query
  const keywords = words.length > 0 ? words.join(" ") : query.trim();

  return {
    keywords: keywords.trim() || query.trim(),
    extractedFilters,
  };
}
