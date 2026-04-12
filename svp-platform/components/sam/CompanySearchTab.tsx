"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, ExternalLink, Factory, MapPin, X, CheckSquare, Square, FileText, DollarSign, Building2, Calendar, Download, ListChecks, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";

interface RelatedOpportunity {
  noticeId: string;
  title: string;
  type?: string;
  postedDate?: string;
  naicsCode?: string;
  awardAmount?: number;
  awardDate?: string;
  department?: string;
  uiLink: string;
}

interface SamCompany {
  ueiSAM: string;
  legalBusinessName: string;
  dbaName?: string;
  registrationStatus?: string;
  registrationExpirationDate?: string;
  entityStructure?: string;
  businessTypes?: string[];
  naicsCode?: string;
  naicsCodes?: string[];
  physicalAddress?: { addressLine1?: string; city?: string; stateOrProvinceCode?: string; zipCode?: string; countryCode?: string; };
  cageCode?: string;
  samUrl?: string;
  samSearchUrl?: string;
  hasRealUei?: boolean;
  sbaBusinessTypes?: string[];
  isSmallBusiness?: boolean;
  isWomanOwned?: boolean;
  isVeteranOwned?: boolean;
  isServiceDisabledVeteranOwned?: boolean;
  isHubZone?: boolean;
  is8aProgram?: boolean;
  relatedOpportunities?: RelatedOpportunity[];
}

const ENTITY_TYPE_OPTIONS = [
  { value: "2L", label: "Corporate Entity, Not Tax Exempt" },
  { value: "8H", label: "Limited Liability Company" },
  { value: "2J", label: "Subchapter S Corporation" },
  { value: "MF", label: "Manufacturer of Goods" },
  { value: "2A", label: "For Profit Entity" },
  { value: "2I", label: "Partnership or Limited Liability Partnership" },
  { value: "2S", label: "Sole Proprietorship" },
  { value: "8W", label: "Business or Organization" },
];

const BUSINESS_TYPE_OPTIONS = [
  { value: "A2", label: "Small Business" },
  { value: "A5", label: "Woman-Owned Small Business (WOSB)" },
  { value: "QF", label: "Veteran-Owned Small Business" },
  { value: "A6", label: "Service-Disabled Veteran-Owned (SDVOSB)" },
  { value: "XX", label: "HUBZone Firm" },
  { value: "27", label: "8(a) Program Participant" },
];

const SUGGESTED_NAICS = [
  { code: "336411", label: "Aircraft Manufacturing" },
  { code: "336412", label: "Aircraft Engine & Parts" },
  { code: "336413", label: "Other Aircraft Parts" },
  { code: "541715", label: "R&D Defense" },
  { code: "541330", label: "Engineering Services" },
  { code: "334511", label: "Navigation/Guidance Instruments" },
  { code: "541512", label: "Computer Systems Design" },
  { code: "541519", label: "Other IT Services" },
  { code: "541611", label: "Management Consulting" },
  { code: "561210", label: "Facilities Support" },
  { code: "237310", label: "Highway/Street Construction" },
  { code: "332710", label: "Machine Shops" },
];

const US_STATES = [
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" }, { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" }, { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" }, { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" }, { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" }, { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" }, { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" }, { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" }, { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
];

/** Build and trigger a CSV download from an array of companies */
function exportToCSV(companies: SamCompany[]) {
  const headers = [
    "Company Name", "DBA Name", "UEI SAM", "CAGE Code",
    "Registration Status", "NAICS Code", "Entity Structure",
    "Address", "City", "State", "Zip", "Country",
    "Small Business", "WOSB", "Veteran-Owned", "SDVOSB", "HUBZone", "8(a)",
    "Related Contracts", "SAM.gov Link",
  ];

  const escape = (v: string | undefined) => {
    const s = (v ?? "").replace(/"/g, '""');
    return s.includes(",") || s.includes("\"") || s.includes("\n") ? `"${s}"` : s;
  };

  const rows = companies.map((c) => [
    escape(c.legalBusinessName),
    escape(c.dbaName),
    escape(c.ueiSAM),
    escape(c.cageCode),
    escape(c.registrationStatus === "A" ? "Active" : c.registrationStatus),
    escape(c.naicsCode),
    escape(c.entityStructure),
    escape(c.physicalAddress?.addressLine1),
    escape(c.physicalAddress?.city),
    escape(c.physicalAddress?.stateOrProvinceCode),
    escape(c.physicalAddress?.zipCode),
    escape(c.physicalAddress?.countryCode),
    c.isSmallBusiness ? "Yes" : "No",
    c.isWomanOwned ? "Yes" : "No",
    c.isVeteranOwned ? "Yes" : "No",
    c.isServiceDisabledVeteranOwned ? "Yes" : "No",
    c.isHubZone ? "Yes" : "No",
    c.is8aProgram ? "Yes" : "No",
    escape(String(c.relatedOpportunities?.length ?? 0)),
    escape(c.samUrl),
  ].join(","));

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sam-companies-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function CompanySearchTab() {
  const [keyword, setKeyword] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [stateSearchInput, setStateSearchInput] = useState("");
  const [naicsCodes, setNaicsCodes] = useState<string[]>([]);
  const [naicsInput, setNaicsInput] = useState("");
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>(["2L", "8H", "2J", "MF", "2A", "2I"]);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>(["A2"]);
  const [regStatus, setRegStatus] = useState<"active" | "inactive" | "all">("active");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SamCompany[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<SamCompany | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());

  const getKey = (c: SamCompany) => c.ueiSAM || c.legalBusinessName;

  const toggleCheck = (c: SamCompany, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = getKey(c);
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const selectAll = () => setCheckedKeys(new Set(results.map(getKey)));
  const clearAll = () => setCheckedKeys(new Set());

  const checkedCompanies = results.filter((c) => checkedKeys.has(getKey(c)));

  const toggleNaics = (code: string) =>
    setNaicsCodes((p) => p.includes(code) ? p.filter((x) => x !== code) : [...p, code]);

  const addNaicsManual = () => {
    const code = naicsInput.trim().replace(/\D/g, "");
    if (code && !naicsCodes.includes(code)) {
      setNaicsCodes((p) => [...p, code]);
    }
    setNaicsInput("");
  };

  const toggleState = (v: string) =>
    setSelectedStates((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);

  const toggleEntityType = (v: string) =>
    setSelectedEntityTypes((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);

  const toggleBusinessType = (v: string) =>
    setSelectedBusinessTypes((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);

  const PAGE_SIZE = 25;

  const doSearch = async (pageNum = 0) => {
    setLoading(true);
    setResults([]);
    setCheckedKeys(new Set());
    try {
      const res = await fetch("/api/sam/company-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Send a space when empty so SAM.gov still returns results
          keyword: keyword.trim() || " ",
          states: selectedStates.length > 0 ? selectedStates : undefined,
          naicsCodes: naicsCodes.length > 0 ? naicsCodes : undefined,
          entityTypes: selectedEntityTypes,
          businessTypes: selectedBusinessTypes,
          registrationStatus: regStatus,
          limit: PAGE_SIZE,
          page: pageNum,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Company search failed");
        return;
      }
      const incoming: SamCompany[] = data.companies || [];
      setResults(incoming);
      setTotal(data.total || 0);
      setPage(pageNum);
      if (incoming.length > 0) {
        toast.success(`Page ${pageNum + 1} — ${incoming.length} companies`);
      } else {
        toast.info("No companies found. Try broadening your filters.");
      }
    } catch { toast.error("Failed to search SAM.gov companies"); }
    finally { setLoading(false); }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleReset = () => {
    setKeyword(""); setSelectedStates([]); setStateSearchInput("");
    setSelectedEntityTypes(["2L", "8H", "2J", "MF", "2A", "2I"]);
    setSelectedBusinessTypes(["A2"]); setRegStatus("active");
    setNaicsCodes([]); setNaicsInput("");
    setResults([]); setTotal(0); setPage(0); setCheckedKeys(new Set());
  };

  return (
    <div className="space-y-5">
      {/* ── Search Form ── */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
          <CardTitle className="text-base font-semibold text-[#1e3a5f] flex items-center gap-2">
            <Factory className="h-4 w-4 text-[#C8A951]" />
            Find Registered Companies on SAM.gov
          </CardTitle>
          <CardDescription className="text-sm">
            Search SAM.gov registered entities using the same criteria as the official SAM.gov company search — aligned with the SVP prospecting SOP.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-6">

          {/* Keyword + State + NAICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Company Name / Keyword</Label>
              <Input placeholder="e.g., Lockheed, manufacturer..." value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                className="border-slate-300 focus-visible:ring-[#C8A951] focus-visible:border-[#C8A951]" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">Step 2 — Physical Address State</Label>
                {selectedStates.length > 0 && (
                  <button type="button" onClick={() => setSelectedStates([])} className="text-xs text-slate-400 hover:text-red-500 transition-colors">Clear all</button>
                )}
              </div>
              {/* Selected state tags */}
              {selectedStates.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedStates.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#1e3a5f] text-white">
                      {s}
                      <button type="button" onClick={() => toggleState(s)} className="hover:text-red-300 transition-colors"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              {/* Searchable dropdown */}
              <div className="relative">
                <Input
                  placeholder="Search & select states..."
                  value={stateSearchInput}
                  onChange={(e) => setStateSearchInput(e.target.value)}
                  className="border-slate-300 focus-visible:ring-[#C8A951] focus-visible:border-[#C8A951] text-sm"
                />
                {stateSearchInput && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                    {US_STATES.filter((s) =>
                      s.label.toLowerCase().includes(stateSearchInput.toLowerCase()) ||
                      s.value.toLowerCase().includes(stateSearchInput.toLowerCase())
                    ).map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => { toggleState(s.value); setStateSearchInput(""); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between ${
                          selectedStates.includes(s.value) ? "bg-blue-50 text-[#1e3a5f] font-semibold" : "text-slate-700"
                        }`}
                      >
                        <span>{s.label} ({s.value})</span>
                        {selectedStates.includes(s.value) && <CheckSquare className="h-3.5 w-3.5 text-[#1e3a5f]" />}
                      </button>
                    ))}
                    {US_STATES.filter((s) =>
                      s.label.toLowerCase().includes(stateSearchInput.toLowerCase()) ||
                      s.value.toLowerCase().includes(stateSearchInput.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-sm text-slate-400">No states found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">Step 4 — NAICS Codes</Label>
                {naicsCodes.length > 0 && (
                  <button type="button" onClick={() => setNaicsCodes([])} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                    Clear all
                  </button>
                )}
              </div>
              {/* Selected tags */}
              {naicsCodes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {naicsCodes.map((code) => (
                    <span key={code} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-[#1e3a5f] text-white">
                      {code}
                      <button type="button" onClick={() => toggleNaics(code)} className="hover:text-red-300 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* Manual entry */}
              <div className="flex gap-1.5">
                <Input
                  placeholder="Type a code e.g. 336411"
                  value={naicsInput}
                  onChange={(e) => setNaicsInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNaicsManual(); } }}
                  className="font-mono border-slate-300 focus-visible:ring-[#C8A951] focus-visible:border-[#C8A951] text-sm"
                  maxLength={6}
                />
                <Button type="button" variant="outline" size="sm" onClick={addNaicsManual} disabled={!naicsInput.trim()} className="shrink-0">
                  Add
                </Button>
              </div>
              {/* Quick-pick chips */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {SUGGESTED_NAICS.map((n) => (
                  <button key={n.code} type="button" onClick={() => toggleNaics(n.code)} title={n.label}
                    className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                      naicsCodes.includes(n.code)
                        ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                        : "bg-white text-slate-500 border-slate-200 hover:border-[#1e3a5f]/40 hover:text-[#1e3a5f]"
                    }`}>
                    {n.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 1: Entity Type */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold text-slate-700">Step 1 — Entity Type</Label>
              <Badge variant="outline" className="text-xs text-[#1e3a5f] border-[#1e3a5f]/30">Select all that apply</Badge>
            </div>
            <p className="text-xs text-slate-400">Exclude: U.S. Federal/State/Local Gov, Education, Foundation, Hospital, Non-Profit, Foreign Gov.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ENTITY_TYPE_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => toggleEntityType(opt.value)}
                  className={`flex items-center gap-2 p-2.5 rounded-md border text-left transition-colors ${selectedEntityTypes.includes(opt.value) ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-white text-slate-600 border-slate-200 hover:border-[#1e3a5f]/50"}`}>
                  {selectedEntityTypes.includes(opt.value) ? <CheckSquare className="h-3.5 w-3.5 shrink-0" /> : <Square className="h-3.5 w-3.5 shrink-0" />}
                  <span className="text-xs leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Entity Status */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Step 3 — Entity Status</Label>
            <div className="flex gap-3 flex-wrap">
              {(["active", "inactive", "all"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setRegStatus(s)}
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${regStatus === s ? (s === "active" ? "bg-green-600 text-white border-green-600" : "bg-slate-600 text-white border-slate-600") : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                  {s === "active" ? "✓ Active Registration Only" : s === "inactive" ? "Inactive" : "Any Status"}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">Always use <strong>Active Registration only</strong> — Inactive = not currently eligible to bid.</p>
          </div>

          {/* Step 5: Business Type / Set-Aside */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold text-slate-700">Step 5 — Business Type / Set-Aside</Label>
              <Badge variant="outline" className="text-xs text-slate-500">Optional but Recommended</Badge>
            </div>
            <p className="text-xs text-slate-400">Focus on SB, WOSB, Veteran-Owned, SDVOSB — businesses that need your help most and can afford your services.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {BUSINESS_TYPE_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => toggleBusinessType(opt.value)}
                  className={`flex items-center gap-2 p-2.5 rounded-md border text-left transition-colors ${selectedBusinessTypes.includes(opt.value) ? "bg-[#C8A951]/20 text-[#1e3a5f] border-[#C8A951]" : "bg-white text-slate-600 border-slate-200 hover:border-[#C8A951]/50"}`}>
                  {selectedBusinessTypes.includes(opt.value) ? <CheckSquare className="h-3.5 w-3.5 shrink-0 text-[#C8A951]" /> : <Square className="h-3.5 w-3.5 shrink-0" />}
                  <span className="text-xs leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-slate-100">
            <Button onClick={() => doSearch(0)} disabled={loading} className="bg-[#1e3a5f] hover:bg-[#152d4a]" size="lg">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search Companies
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={loading} className="border-slate-700 text-slate-700 hover:bg-slate-700 hover:text-white font-semibold" size="lg">
              <X className="h-4 w-4 mr-1" />Reset
            </Button>
            {results.length > 0 && (
              <span className="text-sm text-slate-500 ml-auto">{total.toLocaleString()} total &bull; {results.length} loaded</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Selection Toolbar ── */}
      {results.length > 0 && (
        <div className="sticky top-0 z-20 flex items-center gap-3 flex-wrap px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <button
            type="button"
            onClick={checkedKeys.size === results.length ? clearAll : selectAll}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#1e3a5f] transition-colors"
          >
            {checkedKeys.size === results.length
              ? <CheckSquare className="h-4 w-4 text-[#1e3a5f]" />
              : <Square className="h-4 w-4" />}
            {checkedKeys.size === results.length ? "Deselect All" : "Select All"}
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-500">
            <strong className="text-[#1e3a5f]">{checkedKeys.size}</strong> of {results.length} selected
          </span>
          {checkedKeys.size > 0 && (
            <>
              <Button
                size="sm"
                className="bg-[#C8A951] hover:bg-[#b8983f] text-white ml-auto"
                onClick={() => {
                  exportToCSV(checkedCompanies);
                  toast.success(`Exported ${checkedCompanies.length} companies to CSV`);
                }}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export {checkedKeys.size} to CSV
              </Button>
              <Button size="sm" variant="outline" onClick={clearAll}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />Clear
              </Button>
            </>
          )}
          {checkedKeys.size === 0 && (
            <span className="text-xs text-slate-400 ml-auto">Click checkboxes or cards to select companies</span>
          )}
        </div>
      )}

      {/* ── Results ── */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((company) => {
            const key = getKey(company);
            const isChecked = checkedKeys.has(key);
            return (
              <Card
                key={key}
                className={`hover:shadow-md transition-all cursor-pointer border ${
                  isChecked ? "border-[#1e3a5f] bg-[#1e3a5f]/[0.03] shadow-sm" : "border-slate-200"
                }`}
                onClick={() => setSelectedCompany(company)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-[#1e3a5f] transition-colors"
                      onClick={(e) => toggleCheck(company, e)}
                      aria-label={isChecked ? "Deselect" : "Select"}
                    >
                      {isChecked
                        ? <CheckSquare className="h-5 w-5 text-[#1e3a5f]" />
                        : <Square className="h-5 w-5" />}
                    </button>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className="font-semibold text-[#1e3a5f] text-base">{company.legalBusinessName}</h3>
                        {company.dbaName && <span className="text-xs text-slate-400">dba {company.dbaName}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {company.ueiSAM && <Badge variant="secondary" className="font-mono text-xs">{company.ueiSAM}</Badge>}
                        {company.cageCode && <Badge variant="outline" className="font-mono text-xs">CAGE: {company.cageCode}</Badge>}
                        {company.physicalAddress?.stateOrProvinceCode && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-2.5 w-2.5 mr-0.5" />
                            {company.physicalAddress.city ? `${company.physicalAddress.city}, ` : ""}{company.physicalAddress.stateOrProvinceCode}
                          </Badge>
                        )}
                        {company.naicsCode && <Badge variant="outline" className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-200">NAICS {company.naicsCode}</Badge>}
                        {company.registrationStatus && (
                          <Badge className={company.registrationStatus === "Active" || company.registrationStatus === "A" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                            {company.registrationStatus === "A" ? "Active" : company.registrationStatus}
                          </Badge>
                        )}
                        {company.isSmallBusiness && <Badge className="bg-amber-100 text-amber-700 text-xs">SB</Badge>}
                        {company.isWomanOwned && <Badge className="bg-purple-100 text-purple-700 text-xs">WOSB</Badge>}
                        {company.isVeteranOwned && <Badge className="bg-blue-100 text-blue-700 text-xs">VOB</Badge>}
                        {company.isServiceDisabledVeteranOwned && <Badge className="bg-red-100 text-red-700 text-xs">SDVOSB</Badge>}
                        {company.isHubZone && <Badge className="bg-green-100 text-green-700 text-xs">HUBZone</Badge>}
                        {company.is8aProgram && <Badge className="bg-indigo-100 text-indigo-700 text-xs">8(a)</Badge>}
                        {(company.relatedOpportunities?.length ?? 0) > 0 && (
                          <Badge variant="outline" className="text-xs text-slate-500">
                            <FileText className="h-2.5 w-2.5 mr-0.5" />
                            {company.relatedOpportunities!.length} contract{company.relatedOpportunities!.length !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      {company.entityStructure && <p className="text-xs text-slate-400 mt-1">{company.entityStructure}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); window.open(company.samUrl, "_blank"); }}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />SAM.gov
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-sm text-slate-500">
                Page <strong className="text-[#1e3a5f]">{page + 1}</strong> of <strong className="text-[#1e3a5f]">{totalPages}</strong>
                <span className="ml-2 text-slate-400">({total.toLocaleString()} total)</span>
              </span>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" disabled={page === 0 || loading} onClick={() => doSearch(0)} title="First page">
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={page === 0 || loading} onClick={() => doSearch(page - 1)} title="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {/* Page number pills */}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 7) {
                    p = i;
                  } else if (page < 4) {
                    p = i;
                  } else if (page > totalPages - 5) {
                    p = totalPages - 7 + i;
                  } else {
                    p = page - 3 + i;
                  }
                  return (
                    <Button
                      key={p}
                      size="sm"
                      variant={p === page ? "default" : "outline"}
                      className={p === page ? "bg-[#1e3a5f] text-white hover:bg-[#152d4a] min-w-[2rem]" : "min-w-[2rem]"}
                      disabled={loading}
                      onClick={() => p !== page && doSearch(p)}
                    >
                      {p + 1}
                    </Button>
                  );
                })}
                <Button size="sm" variant="outline" disabled={page >= totalPages - 1 || loading} onClick={() => doSearch(page + 1)} title="Next page">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages - 1 || loading} onClick={() => doSearch(totalPages - 1)} title="Last page">
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Company Detail Modal ── */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedCompany(null)}>
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-xl text-[#1e3a5f]">{selectedCompany.legalBusinessName}</CardTitle>
                  {selectedCompany.dbaName && <p className="text-sm text-slate-400 mt-0.5">dba {selectedCompany.dbaName}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152d4a]" onClick={() => window.open(selectedCompany.samUrl, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-1" />View on SAM.gov
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedCompany(null)}>Close</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">

              {/* IDs & Status */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">UEI SAM</div>
                  <p className="font-mono font-medium text-sm">{selectedCompany.ueiSAM || "—"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">CAGE Code</div>
                  <p className="font-mono font-medium text-sm">{selectedCompany.cageCode || "—"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">Registration</div>
                  <p className="font-medium text-sm">{selectedCompany.registrationStatus === "A" ? "Active" : selectedCompany.registrationStatus || "—"}</p>
                </div>
                {selectedCompany.naicsCode && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-400 mb-1">Primary NAICS</div>
                    <p className="font-mono font-medium text-sm text-blue-700">{selectedCompany.naicsCode}</p>
                  </div>
                )}
                {selectedCompany.entityStructure && (
                  <div className="p-3 bg-slate-50 rounded-lg col-span-2">
                    <div className="text-xs text-slate-400 mb-1">Entity Structure</div>
                    <p className="font-medium text-sm">{selectedCompany.entityStructure}</p>
                  </div>
                )}
              </div>

              {/* Physical Address */}
              {selectedCompany.physicalAddress && Object.values(selectedCompany.physicalAddress).some(Boolean) && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-slate-700 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />Physical Address
                  </h3>
                  <div className="p-3 bg-slate-50 rounded-lg text-sm space-y-0.5">
                    {selectedCompany.physicalAddress.addressLine1 && <p>{selectedCompany.physicalAddress.addressLine1}</p>}
                    <p>{[selectedCompany.physicalAddress.city, selectedCompany.physicalAddress.stateOrProvinceCode, selectedCompany.physicalAddress.zipCode].filter(Boolean).join(", ")}</p>
                    {selectedCompany.physicalAddress.countryCode && <p className="text-slate-400">{selectedCompany.physicalAddress.countryCode}</p>}
                  </div>
                </div>
              )}

              {/* Certifications badges */}
              {(selectedCompany.isSmallBusiness || selectedCompany.isWomanOwned || selectedCompany.isVeteranOwned || selectedCompany.isServiceDisabledVeteranOwned || selectedCompany.isHubZone || selectedCompany.is8aProgram) && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-slate-700">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.isSmallBusiness && <Badge className="bg-amber-100 text-amber-700">Small Business</Badge>}
                    {selectedCompany.isWomanOwned && <Badge className="bg-purple-100 text-purple-700">WOSB</Badge>}
                    {selectedCompany.isVeteranOwned && <Badge className="bg-blue-100 text-blue-700">Veteran-Owned</Badge>}
                    {selectedCompany.isServiceDisabledVeteranOwned && <Badge className="bg-red-100 text-red-700">SDVOSB</Badge>}
                    {selectedCompany.isHubZone && <Badge className="bg-green-100 text-green-700">HUBZone</Badge>}
                    {selectedCompany.is8aProgram && <Badge className="bg-indigo-100 text-indigo-700">8(a)</Badge>}
                  </div>
                </div>
              )}

              {/* Related Contracts / Opportunities */}
              {selectedCompany.relatedOpportunities && selectedCompany.relatedOpportunities.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-slate-700 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    Related Federal Contracts ({selectedCompany.relatedOpportunities.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedCompany.relatedOpportunities.map((opp) => (
                      <div key={opp.noticeId} className="p-3 border border-slate-200 rounded-lg bg-white hover:border-[#1e3a5f]/30 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-800 leading-tight">{opp.title}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {opp.type && (
                                <Badge variant="outline" className="text-xs">{opp.type}</Badge>
                              )}
                              {opp.naicsCode && (
                                <Badge variant="outline" className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-200">{opp.naicsCode}</Badge>
                              )}
                              {opp.awardAmount != null && (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  <DollarSign className="h-3 w-3 mr-0.5" />
                                  {opp.awardAmount.toLocaleString()}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-3 mt-1 text-xs text-slate-400">
                              {opp.department && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />{opp.department}
                                </span>
                              )}
                              {(opp.awardDate || opp.postedDate) && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {opp.awardDate
                                    ? `Awarded ${new Date(opp.awardDate).toLocaleDateString()}`
                                    : `Posted ${new Date(opp.postedDate!).toLocaleDateString()}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="shrink-0 text-xs" onClick={() => window.open(opp.uiLink, "_blank")}>
                            <ExternalLink className="h-3 w-3 mr-1" />View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No contracts found notice */}
              {(!selectedCompany.relatedOpportunities || selectedCompany.relatedOpportunities.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-2">No related contract records found for this company in the current search results.</p>
              )}

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
