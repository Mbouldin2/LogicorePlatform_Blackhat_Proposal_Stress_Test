"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Loader2,
  ExternalLink,
  DollarSign,
  ChevronDown,
  ChevronRight,
  X,
  RotateCcw,
  Download,
  Building2,
  FileText,
  TrendingUp,
  Hash,
  Filter,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
// ─── Constants ────────────────────────────────────────────────────────────────

const FISCAL_YEARS = ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

const AWARD_TYPE_GROUPS = [
  {
    group: "Contracts",
    types: [
      { code: "A", label: "BPA Call" },
      { code: "B", label: "Purchase Order" },
      { code: "C", label: "Delivery Order" },
      { code: "D", label: "Definitive Contract" },
    ],
  },
  {
    group: "Grants",
    types: [
      { code: "02", label: "Block Grant" },
      { code: "03", label: "Formula Grant" },
      { code: "04", label: "Project Grant" },
      { code: "05", label: "Cooperative Agreement" },
    ],
  },
  {
    group: "Loans",
    types: [
      { code: "06", label: "Direct Loan" },
      { code: "07", label: "Guaranteed / Insured Loan" },
      { code: "10", label: "Loan" },
    ],
  },
  {
    group: "Other Financial",
    types: [
      { code: "08", label: "Insurance" },
      { code: "09", label: "Direct Payment" },
      { code: "11", label: "Other Financial Assistance" },
    ],
  },
];

const TOP_AGENCIES = [
  "Department of Defense",
  "Department of Health and Human Services",
  "Department of Veterans Affairs",
  "Department of Homeland Security",
  "Department of Transportation",
  "Department of Energy",
  "National Aeronautics and Space Administration",
  "Small Business Administration",
  "Department of Agriculture",
  "Department of State",
  "Department of Justice",
  "Department of Education",
  "Department of Housing and Urban Development",
  "Department of the Interior",
  "Environmental Protection Agency",
  "General Services Administration",
  "Department of Commerce",
  "Department of Labor",
  "Department of the Treasury",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  "DC","PR","GU","VI",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchFilters {
  keywords: string;
  awardTypes: string[];
  fiscalYears: string[];
  awardingAgency: string;
  fundingAgency: string;
  recipientName: string;
  recipientState: string;
  naicsCode: string;
  pscCode: string;
  awardAmountMin: string;
  awardAmountMax: string;
  awardIdSearch: string;
}

interface AwardResult {
  "Award ID"?: string;
  "Recipient Name"?: string;
  "Award Amount"?: number;
  "Total Outlays"?: number;
  "Description"?: string;
  "Award Type"?: string;
  "Awarding Agency"?: string;
  "Awarding Sub Agency"?: string;
  "Start Date"?: string;
  "End Date"?: string;
  generated_internal_id?: string;
  [key: string]: unknown;
}

const EMPTY_FILTERS: SearchFilters = {
  keywords: "",
  awardTypes: [],
  fiscalYears: [],
  awardingAgency: "",
  fundingAgency: "",
  recipientName: "",
  recipientState: "",
  naicsCode: "",
  pscCode: "",
  awardAmountMin: "",
  awardAmountMax: "",
  awardIdSearch: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(val: unknown): string {
  if (val == null) return "—";
  const num = typeof val === "number" ? val : parseFloat(String(val));
  if (isNaN(num)) return "—";
  if (Math.abs(num) >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (Math.abs(num) >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (Math.abs(num) >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toLocaleString()}`;
}

function awardPermalink(result: AwardResult): string {
  const id = result.generated_internal_id || result["Award ID"];
  if (!id) return "https://www.usaspending.gov/search";
  return `https://www.usaspending.gov/award/${encodeURIComponent(String(id))}`;
}

function exportCsv(results: AwardResult[]) {
  const headers = ["Recipient Name", "Award Amount", "Award Type", "Awarding Agency", "Start Date", "End Date", "Award ID", "Description"];
  const rows = results.map((r) => headers.map((h) => {
    const val = r[h];
    const s = val == null ? "" : String(val);
    return `"${s.replace(/"/g, "'")}"` ;
  }).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `usaspending-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── FilterSection wrapper ────────────────────────────────────────────────────

function FilterSection({
  title, icon: Icon, children, defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2.5 text-sm font-medium hover:text-primary transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pb-3 pt-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── FilterChip helper ────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1 font-normal">
      {label}
      <button onClick={onRemove} className="hover:text-destructive transition-colors ml-0.5 rounded-full">
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function USASpendingSearchPage() {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [naicsInput, setNaicsInput] = useState("");
  const [pscInput, setPscInput] = useState("");
  const [results, setResults] = useState<AwardResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [sortField, setSortField] = useState("Award Amount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const resultsRef = useRef<HTMLDivElement>(null);

  const setFilter = <K extends keyof SearchFilters>(key: K, val: SearchFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  const toggleAwardType = (code: string) =>
    setFilter("awardTypes", filters.awardTypes.includes(code)
      ? filters.awardTypes.filter((c) => c !== code)
      : [...filters.awardTypes, code]);

  const toggleFiscalYear = (yr: string) =>
    setFilter("fiscalYears", filters.fiscalYears.includes(yr)
      ? filters.fiscalYears.filter((y) => y !== yr)
      : [...filters.fiscalYears, yr]);

  const activeFilterCount = [
    filters.keywords, filters.awardingAgency, filters.fundingAgency,
    filters.recipientName, filters.recipientState, filters.naicsCode,
    filters.pscCode, filters.awardAmountMin, filters.awardAmountMax, filters.awardIdSearch,
  ].filter(Boolean).length + filters.awardTypes.length + filters.fiscalYears.length;

  const handleSearch = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const apiFilters: Record<string, unknown> = {};

      if (filters.keywords) apiFilters.keywords = [filters.keywords];
      if (filters.awardTypes.length) apiFilters.award_type_codes = filters.awardTypes;
      if (filters.recipientName) apiFilters.recipient_search_text = [filters.recipientName];
      if (filters.recipientState) apiFilters.recipient_locations = [{ country: "USA", state: filters.recipientState }];
      if (filters.naicsCode) apiFilters.naics_codes = { require: [filters.naicsCode] };
      if (filters.pscCode) apiFilters.psc_codes = { require: [filters.pscCode] };

      if (filters.awardingAgency) {
        apiFilters.agencies = [{ type: "awarding", tier: "toptier", name: filters.awardingAgency }];
      } else if (filters.fundingAgency) {
        apiFilters.agencies = [{ type: "funding", tier: "toptier", name: filters.fundingAgency }];
      }

      if (filters.fiscalYears.length) {
        apiFilters.time_period = filters.fiscalYears.map((fy) => ({
          start_date: `${parseInt(fy) - 1}-10-01`,
          end_date: `${fy}-09-30`,
        }));
      }

      const amtMin = filters.awardAmountMin ? parseFloat(filters.awardAmountMin.replace(/[^0-9.]/g, "")) : null;
      const amtMax = filters.awardAmountMax ? parseFloat(filters.awardAmountMax.replace(/[^0-9.]/g, "")) : null;
      if (amtMin != null || amtMax != null) {
        apiFilters.award_amounts = [{ lower_bound: amtMin ?? 0, upper_bound: amtMax ?? 9_999_999_999_999 }];
      }

      const body = {
        filters: Object.keys(apiFilters).length ? apiFilters : { keywords: ["services"] },
        fields: [
          "Award ID", "Recipient Name", "Award Amount", "Total Outlays",
          "Description", "Award Type", "Awarding Agency", "Awarding Sub Agency",
          "Start Date", "End Date", "generated_internal_id",
        ],
        page: 1,
        limit: 50,
        sort: sortField,
        order: sortDir,
        subawards: false,
      };

      const res = await fetch("/api/usaspending/search", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error
            ? `${errData.error}${errData.detail ? ` — ${errData.detail}` : ""}`
            : `Search failed (${res.status})`
        );
      }

      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.page_metadata?.total || 0);
      setHasSearched(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Search failed";
      setFetchError(msg);
      toast.error("Search failed — see error below");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setNaicsInput("");
    setPscInput("");
    setResults([]);
    setTotal(0);
    setHasSearched(false);
    setFetchError(null);
  };

  // ── Advanced filters panel toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="min-h-screen bg-[#f2f1ec] p-6 space-y-4">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Federal Award Search</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Search USASpending.gov for contracts, grants, loans &amp; financial assistance
          </p>
        </div>
        <Button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-[#e8c84a] hover:bg-[#d4b53a] text-gray-900 font-semibold gap-1.5 shadow-none"
        >
          {isLoading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Search className="h-4 w-4" />}
          {isLoading ? "Searching…" : "Search Awards"}
        </Button>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Results", value: hasSearched ? total.toLocaleString() : "—", sub: hasSearched ? `${results.length} shown` : "Run a search" },
          { label: "Fiscal Years", value: filters.fiscalYears.length ? filters.fiscalYears.join(", ") : "All years", sub: "Selected period" },
          { label: "Award Types", value: filters.awardTypes.length || "All", sub: filters.awardTypes.length ? "Types selected" : "No filter applied" },
          { label: "Active Filters", value: activeFilterCount || 0, sub: activeFilterCount > 0 ? "Filters applied" : "No filters set" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
            <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        {/* Primary row: keyword + key dropdowns + search button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search keywords, recipient, description..."
              value={filters.keywords}
              onChange={(e) => setFilter("keywords", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 h-9 bg-gray-50 border-gray-200 text-sm focus-visible:ring-1"
            />
          </div>
          <Select value={filters.awardingAgency} onValueChange={(v) => setFilter("awardingAgency", v === "__all__" ? "" : v)}>
            <SelectTrigger className="h-9 text-sm w-full sm:w-[200px] bg-gray-50 border-gray-200">
              <SelectValue placeholder="All Agencies" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="__all__">All Agencies</SelectItem>
              {TOP_AGENCIES.map((a) => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={filters.awardTypes.length === 1 ? filters.awardTypes[0] : filters.awardTypes.length > 1 ? "__multi__" : "__all__"}
            onValueChange={(v) => {
              if (v === "__all__") setFilter("awardTypes", []);
              else if (v !== "__multi__") setFilter("awardTypes", [v]);
            }}
          >
            <SelectTrigger className="h-9 text-sm w-full sm:w-[160px] bg-gray-50 border-gray-200">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              {filters.awardTypes.length > 1 && <SelectItem value="__multi__">{filters.awardTypes.length} types</SelectItem>}
              {AWARD_TYPE_GROUPS.flatMap(g => g.types).map(({ code, label }) => (
                <SelectItem key={code} value={code} className="text-xs">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.fiscalYears.length === 1 ? filters.fiscalYears[0] : filters.fiscalYears.length > 1 ? "__multi__" : "__all__"}
            onValueChange={(v) => {
              if (v === "__all__") setFilter("fiscalYears", []);
              else if (v !== "__multi__") setFilter("fiscalYears", [v]);
            }}
          >
            <SelectTrigger className="h-9 text-sm w-full sm:w-[130px] bg-gray-50 border-gray-200">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Years</SelectItem>
              {filters.fiscalYears.length > 1 && <SelectItem value="__multi__">{filters.fiscalYears.length} years</SelectItem>}
              {FISCAL_YEARS.map((yr) => <SelectItem key={yr} value={yr}>{yr}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-xs text-gray-500 hover:text-gray-900 whitespace-nowrap"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            {showAdvanced ? "Less" : "More filters"}
            {activeFilterCount > 0 && <span className="ml-1.5 bg-[#e8c84a] text-gray-900 rounded-full px-1.5 py-0.5 text-[10px] font-bold">{activeFilterCount}</span>}
          </Button>
        </div>

        {/* Advanced filters panel */}
        {showAdvanced && (
          <div className="border-t border-gray-100 pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Recipient */}
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Recipient Name</Label>
              <Input placeholder="Company or org name..." value={filters.recipientName}
                onChange={(e) => setFilter("recipientName", e.target.value)}
                className="h-8 text-sm bg-gray-50 border-gray-200" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Recipient State</Label>
              <Select value={filters.recipientState} onValueChange={(v) => setFilter("recipientState", v === "__all__" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs bg-gray-50 border-gray-200"><SelectValue placeholder="Any state" /></SelectTrigger>
                <SelectContent className="max-h-48">
                  <SelectItem value="__all__">Any State</SelectItem>
                  {US_STATES.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Funding Agency</Label>
              <Select value={filters.fundingAgency} onValueChange={(v) => setFilter("fundingAgency", v === "__all__" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs bg-gray-50 border-gray-200"><SelectValue placeholder="Any agency" /></SelectTrigger>
                <SelectContent className="max-h-48">
                  <SelectItem value="__all__">Any Agency</SelectItem>
                  {TOP_AGENCIES.map((a) => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Min Amount ($)</Label>
              <Input placeholder="e.g. 100000" value={filters.awardAmountMin} type="number" min={0}
                onChange={(e) => setFilter("awardAmountMin", e.target.value)}
                className="h-8 text-sm bg-gray-50 border-gray-200" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Max Amount ($)</Label>
              <Input placeholder="e.g. 10000000" value={filters.awardAmountMax} type="number" min={0}
                onChange={(e) => setFilter("awardAmountMax", e.target.value)}
                className="h-8 text-sm bg-gray-50 border-gray-200" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">NAICS Code</Label>
              <div className="flex gap-1.5">
                <Input placeholder="e.g. 541512" value={naicsInput} maxLength={6}
                  onChange={(e) => setNaicsInput(e.target.value.replace(/\D/g, ""))}
                  className="h-8 text-sm bg-gray-50 border-gray-200" />
                <Button type="button" size="sm" variant="outline" className="h-8 px-2.5 text-xs flex-shrink-0"
                  onClick={() => { if (naicsInput) setFilter("naicsCode", naicsInput); }}>Set</Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">PSC Code</Label>
              <div className="flex gap-1.5">
                <Input placeholder="e.g. D302" value={pscInput} maxLength={4}
                  onChange={(e) => setPscInput(e.target.value.toUpperCase())}
                  className="h-8 text-sm bg-gray-50 border-gray-200" />
                <Button type="button" size="sm" variant="outline" className="h-8 px-2.5 text-xs flex-shrink-0"
                  onClick={() => { if (pscInput) setFilter("pscCode", pscInput); }}>Set</Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Award ID</Label>
              <Input placeholder="e.g. CONT_AWD_..." value={filters.awardIdSearch}
                onChange={(e) => setFilter("awardIdSearch", e.target.value)}
                className="h-8 text-sm bg-gray-50 border-gray-200" />
            </div>
            <div className="flex items-end">
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleReset}
                  className="h-8 text-xs text-gray-400 hover:text-red-500 gap-1">
                  <RotateCcw className="h-3 w-3" /> Clear all filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {filters.keywords && <FilterChip label={`"${filters.keywords}"`} onRemove={() => setFilter("keywords", "")} />}
            {filters.fiscalYears.map((yr) => <FilterChip key={yr} label={`FY ${yr}`} onRemove={() => toggleFiscalYear(yr)} />)}
            {filters.awardTypes.map((code) => {
              const lbl = AWARD_TYPE_GROUPS.flatMap((g) => g.types).find((t) => t.code === code)?.label || code;
              return <FilterChip key={code} label={lbl} onRemove={() => toggleAwardType(code)} />;
            })}
            {filters.awardingAgency && <FilterChip label={filters.awardingAgency.replace("Department of ", "Dept. ")} onRemove={() => setFilter("awardingAgency", "")} />}
            {filters.fundingAgency && <FilterChip label={`Funding: ${filters.fundingAgency.replace("Department of ", "Dept. ")}`} onRemove={() => setFilter("fundingAgency", "")} />}
            {filters.recipientName && <FilterChip label={`Recipient: ${filters.recipientName}`} onRemove={() => setFilter("recipientName", "")} />}
            {filters.recipientState && <FilterChip label={`State: ${filters.recipientState}`} onRemove={() => setFilter("recipientState", "")} />}
            {filters.naicsCode && <FilterChip label={`NAICS: ${filters.naicsCode}`} onRemove={() => { setFilter("naicsCode", ""); setNaicsInput(""); }} />}
            {filters.pscCode && <FilterChip label={`PSC: ${filters.pscCode}`} onRemove={() => { setFilter("pscCode", ""); setPscInput(""); }} />}
            {filters.awardAmountMin && <FilterChip label={`≥ $${Number(filters.awardAmountMin).toLocaleString()}`} onRemove={() => setFilter("awardAmountMin", "")} />}
            {filters.awardAmountMax && <FilterChip label={`≤ $${Number(filters.awardAmountMax).toLocaleString()}`} onRemove={() => setFilter("awardAmountMax", "")} />}
          </div>
        )}
      </div>

      {/* ── Results Table Card ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" ref={resultsRef}>

        {/* Table toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">
            {isLoading ? "Searching…" : hasSearched
              ? <><span className="font-semibold text-gray-900">{total.toLocaleString()}</span> awards found · showing {results.length}</>
              : "Use the search bar above to find federal awards"}
          </p>
          <div className="flex items-center gap-2">
            {hasSearched && (
              <>
                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger className="h-7 text-xs w-[150px] border-gray-200 bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Award Amount", "Start Date", "End Date", "Recipient Name"].map((f) => (
                      <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-gray-200"
                  onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}>
                  <ArrowUpDown className="h-3 w-3" />
                  {sortDir === "desc" ? "Desc" : "Asc"}
                </Button>
              </>
            )}
            {results.length > 0 && (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-gray-200"
                onClick={() => exportCsv(results)}>
                <Download className="h-3 w-3" /> Export CSV
              </Button>
            )}
            <a href="https://www.usaspending.gov/search" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-gray-400 hover:text-gray-700">
                USASpending.gov <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Search error: </span>
              <span className="text-xs">{fetchError}</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-gray-300" />
          </div>
        )}

        {/* Table */}
        {!isLoading && results.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recipient</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Award Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Awarding Agency</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Description</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Start Date</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, i) => {
                  const name = String(r["Recipient Name"] || "—");
                  const amount = r["Award Amount"];
                  const type = r["Award Type"] || "";
                  const agency = String(r["Awarding Agency"] || "—");
                  const desc = String(r["Description"] || "—");
                  const startDate = r["Start Date"] ? new Date(r["Start Date"]).toLocaleDateString() : "—";
                  const link = awardPermalink(r);
                  return (
                    <TableRow key={i} className="hover:bg-gray-50 border-gray-100">
                      <TableCell className="font-medium text-gray-900 max-w-[200px]">
                        <span className="block truncate text-sm" title={name}>{name}</span>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 whitespace-nowrap text-sm">
                        {formatCurrency(amount)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {type ? <Badge variant="outline" className="text-xs font-normal border-gray-200 text-gray-600 whitespace-nowrap">{type}</Badge> : "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[180px]">
                        <span className="block truncate text-xs text-gray-500" title={agency}>{agency}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-[220px]">
                        <span className="block truncate text-xs text-gray-400" title={desc}>{desc}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-gray-400 whitespace-nowrap">
                        {startDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <a href={link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#c8a000] hover:text-[#a07800] hover:underline whitespace-nowrap font-medium">
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Empty — initial state */}
        {!isLoading && !hasSearched && !fetchError && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="h-12 w-12 rounded-full border-2 border-gray-200 flex items-center justify-center mb-4">
              <div className="h-6 w-6 rounded-full border-2 border-gray-200 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-gray-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-4">No awards yet</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: "+ Defense contracts 2024", action: () => { setFilter("awardTypes", ["A","B","C","D"]); setFilter("fiscalYears",["2024"]); setFilter("awardingAgency","Department of Defense"); } },
                { label: "+ HHS grants 2024", action: () => { setFilter("awardTypes", ["02","03","04","05"]); setFilter("fiscalYears",["2024"]); setFilter("awardingAgency","Department of Health and Human Services"); } },
                { label: "+ NASA contracts", action: () => { setFilter("awardTypes", ["A","B","C","D"]); setFilter("fiscalYears",["2024"]); setFilter("awardingAgency","National Aeronautics and Space Administration"); } },
                { label: "+ VA IT contracts", action: () => { setFilter("awardTypes", ["A","B","C","D"]); setFilter("naicsCode","541512"); setNaicsInput("541512"); setFilter("awardingAgency","Department of Veterans Affairs"); } },
              ].map(({ label, action }) => (
                <button key={label} onClick={() => { action(); setTimeout(handleSearch, 100); }}
                  className="text-xs px-4 py-2 rounded-full bg-[#e8c84a] hover:bg-[#d4b53a] text-gray-900 font-semibold transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty — no results after search */}
        {!isLoading && hasSearched && results.length === 0 && !fetchError && (
          <div className="flex flex-col items-center justify-center py-16">
            <Search className="h-8 w-8 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">No awards found</p>
            <p className="text-xs text-gray-400 mt-1">Try removing some filters or broadening the fiscal year range</p>
          </div>
        )}
      </div>
    </div>
  );
}
