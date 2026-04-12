"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  Search, 
  Loader2, 
  ExternalLink, 
  FileSpreadsheet,
  Building,
  Calendar,
  MapPin,
  Tag,
  Info,
  Brain,
  BarChart3,
  Bookmark,
  BookmarkCheck,
  Clock,
  Users
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySearchTab } from "@/components/sam/CompanySearchTab";

interface SamOpportunity {
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
  pointOfContact?: Array<{ name: string; email?: string; phone?: string; title?: string }>;
  resourceLinks?: Array<{ url: string; description?: string; name?: string; downloadUrl?: string }>;
  uiLink?: string;
  award?: {
    date?: string;
    amount?: number;
    awardee?: string;
  };
  // Additional fields from detailed view
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
  // More fields from SAM.gov
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

interface SearchFilters {
  naics?: string;
  psc?: string;
  set_aside?: string;
  notice_type?: string;
  pop_state?: string;
  is_active?: string;
  response_date_from?: string;
  response_date_to?: string;
  posted_date_from?: string;
  posted_date_to?: string;
  [key: string]: string | undefined;
}

export default function SamGovSearchPage() {
  const { profile } = useUserProfile();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    is_active: "true"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SamOpportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<SamOpportunity | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalResults, setTotalResults] = useState(0);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [usedAgent, setUsedAgent] = useState(false);
  const [exportedFileName, setExportedFileName] = useState<string | null>(null);
  // Save/Tag state
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [saveTarget, setSaveTarget] = useState<SamOpportunity | null>(null);
  const [saveTags, setSaveTags] = useState("");
  const [saveNotes, setSaveNotes] = useState("");
  const [saveAssignee, setSaveAssignee] = useState("");
  const [saving, setSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; email: string }>>([]);

  // Load team members for assignment
  useEffect(() => {
    fetch("/api/team-members?status=active")
      .then((r) => r.ok ? r.json() : { teamMembers: [] })
      .then((data) => {
        const members = (data.teamMembers || []).map((m: any) => ({
          id: m.id || m.firebaseUid,
          name: `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.emailPrimary || m.email,
          email: m.emailPrimary || m.email || "",
        })).filter((m: any) => m.id);
        setTeamMembers(members);
      })
      .catch(() => {});
  }, []);

  const openDetail = async (opp: SamOpportunity) => {
    // Show immediately with search data, then enrich with attachments
    setSelectedOpportunity(opp);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/sam/opportunity/${opp.noticeId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.opportunity) {
          setSelectedOpportunity(data.opportunity);
        }
      }
    } catch {
      // Keep the search result data if detail fetch fails
    } finally {
      setLoadingDetail(false);
    }
  };

  const openSaveDialog = (opp: SamOpportunity) => {
    setSaveTarget(opp);
    setSaveTags("");
    setSaveNotes("");
    setSaveAssignee("");
  };

  const handleSaveOpportunity = async () => {
    if (!saveTarget || !profile?.id) return;
    setSaving(true);
    try {
      const assignee = teamMembers.find((m) => m.id === saveAssignee);
      const res = await fetch("/api/sam/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticeId: saveTarget.noticeId,
          title: saveTarget.title,
          solicitationNumber: saveTarget.solicitationNumber,
          type: saveTarget.type,
          postedDate: saveTarget.postedDate,
          responseDeadLine: saveTarget.responseDeadLine,
          department: saveTarget.department,
          organizationHierarchy: saveTarget.organizationHierarchy,
          naicsCode: saveTarget.naicsCode,
          classificationCode: saveTarget.classificationCode,
          typeOfSetAside: saveTarget.typeOfSetAside,
          description: saveTarget.description,
          uiLink: saveTarget.uiLink,
          placeOfPerformance: saveTarget.placeOfPerformance,
          tags: saveTags.split(",").map((t) => t.trim()).filter(Boolean),
          notes: saveNotes,
          assignedToUserId: assignee?.id || null,
          assignedToName: assignee?.name || null,
          status: "new",
          savedByUserId: profile.id,
          savedByName: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
        }),
      });
      if (res.status === 409) {
        toast.info("Already saved");
      } else if (res.ok) {
        setSavedIds((prev) => new Set([...prev, saveTarget.noticeId]));
        toast.success("Opportunity saved");
      } else {
        toast.error("Failed to save");
      }
      setSaveTarget(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setLoading(true);
    setResults([]);
    setCurrentPage(1);

    try {
      const response = await fetch("/api/sam/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          filters: Object.entries(filters).reduce((acc, [key, value]) => {
            if (value) acc[key] = value;
            return acc;
          }, {} as SearchFilters)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.missingApiKey) {
          toast.error("SAM.gov API key not configured. Add SAM_GOV_API_KEY to .env.local — get a free key at sam.gov → Account Details → Public API Key", { duration: 10000 });
        } else {
          toast.error(data.error || "Search failed");
        }
        return;
      }

      setResults(data.opportunities || []);
      setTotalResults(data.total || 0);
      setRecommendation(data.recommendation || null);
      setUsedAgent(data.usedAgent || false);
      
      if (data.opportunities?.length > 0) {
        toast.success(`Found ${data.total.toLocaleString()} opportunities (showing ${data.opportunities.length})`);
      } else {
        toast.info("No opportunities found for this search");
      }
    } catch (error) {
      toast.error("Failed to search SAM.gov");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (results.length === 0) {
      toast.error("No results to export");
      return;
    }

    try {
      const response = await fetch("/api/sam/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunities: results })
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = `sam-opportunities-${new Date().toISOString().split("T")[0]}.xlsx`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportedFileName(fileName);
      toast.success("Excel file downloaded");
    } catch (error) {
      toast.error("Failed to export results");
      console.error(error);
    }
  };

  const getSetAsideLabel = (code?: string) => {
    const labels: Record<string, string> = {
      "NONE": "None",
      "SBA": "Small Business Set-Aside",
      "WOSB": "Women-Owned Small Business",
      "SDVOSB": "Service-Disabled Veteran-Owned",
      "8A": "8(a) Business Development",
      "HUBZone": "HUBZone Small Business",
      "EDWOSB": "Economically Disadvantaged WOSB"
    };
    return labels[code || ""] || code;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const paginatedResults = results.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(results.length / pageSize);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f]">SAM.gov Search</h1>
          <p className="text-muted-foreground mt-1">
            Search federal contract opportunities and registered companies on SAM.gov
          </p>
        </div>
        <Building className="h-8 w-8 text-[#C8A951]" />
      </div>

      <Tabs defaultValue="opportunities" className="space-y-5">
        <TabsList>
          <TabsTrigger value="opportunities">Opportunity Search</TabsTrigger>
          <TabsTrigger value="companies">Company Search</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="mt-0">
          <CompanySearchTab />
        </TabsContent>

        <TabsContent value="opportunities" className="mt-0 space-y-5">

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Opportunities</CardTitle>
          <CardDescription>
            Enter a natural language query like "Find software development opportunities with NAICS code 541511"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Find IT services contracts in California..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>

          {/* Advanced Filters */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex justify-between">
                <span>Advanced Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">NAICS Code</label>
                  <Input
                    placeholder="e.g., 541511"
                    value={filters.naics || ""}
                    onChange={(e) => setFilters({ ...filters, naics: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">PSC Code</label>
                  <Input
                    placeholder="e.g., D301"
                    value={filters.psc || ""}
                    onChange={(e) => setFilters({ ...filters, psc: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Set-Aside Type</label>
                  <Select
                    value={filters.set_aside}
                    onValueChange={(value) => setFilters({ ...filters, set_aside: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select set-aside" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="SBA">Small Business</SelectItem>
                      <SelectItem value="WOSB">Women-Owned</SelectItem>
                      <SelectItem value="SDVOSB">Veteran-Owned</SelectItem>
                      <SelectItem value="8A">8(a) Program</SelectItem>
                      <SelectItem value="HUBZone">HUBZone</SelectItem>
                      <SelectItem value="NONE">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Notice Type</label>
                  <Select
                    value={filters.notice_type}
                    onValueChange={(value) => setFilters({ ...filters, notice_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="o">Solicitation</SelectItem>
                      <SelectItem value="p">Presolicitation</SelectItem>
                      <SelectItem value="a">Award Notice</SelectItem>
                      <SelectItem value="r">Sources Sought</SelectItem>
                      <SelectItem value="s">Special Notice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">State (Place of Performance)</label>
                  <Input
                    placeholder="e.g., CA"
                    value={filters.pop_state || ""}
                    onChange={(e) => setFilters({ ...filters, pop_state: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select
                    value={filters.is_active}
                    onValueChange={(value) => setFilters({ ...filters, is_active: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                      <SelectItem value="all">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Response Date From</label>
                  <Input
                    type="date"
                    value={filters.response_date_from || ""}
                    onChange={(e) => setFilters({ ...filters, response_date_from: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Response Date To</label>
                  <Input
                    type="date"
                    value={filters.response_date_to || ""}
                    onChange={(e) => setFilters({ ...filters, response_date_to: e.target.value })}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* AI Recommendation */}
      {recommendation && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Analysis & Recommendations
              {usedAgent && (
                <Badge variant="outline" className="text-xs">Powered by GPT-4</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">{recommendation}</p>
          </CardContent>
        </Card>
      )}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Summary Section */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-lg">Summary</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Query</div>
                  <div className="font-medium text-sm">{query || "All Opportunities"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Total Found</div>
                  <div className="font-bold text-2xl">{totalResults.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Retrieved</div>
                  <div className="font-bold text-2xl">{results.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Exported</div>
                  <div className="text-sm text-green-600">{exportedFileName || "Not exported"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Opportunities</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(parseInt(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            {paginatedResults.map((opp, index) => (
              <Card key={opp.noticeId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400 font-medium min-w-[24px]">{((currentPage - 1) * pageSize) + index + 1}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#1e3a5f] text-base leading-tight mb-2 line-clamp-2">
                            {opp.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <Badge variant="secondary" className="font-mono text-xs">
                              {opp.noticeId}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {opp.department || opp.organizationHierarchy?.split(".")[0] || "Unknown Agency"}
                            </Badge>
                            <span className="text-green-600 text-xs">
                              Posted: {formatDate(opp.postedDate)}
                            </span>
                            <span className={`text-xs ${opp.responseDeadLine && new Date(opp.responseDeadLine) < new Date() ? 'text-red-600' : 'text-amber-600'}`}>
                              Due: {formatDate(opp.responseDeadLine) || "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSaveDialog(opp)}
                        className={savedIds.has(opp.noticeId) ? "text-green-600 border-green-300" : ""}
                        title={savedIds.has(opp.noticeId) ? "Saved" : "Save & Tag"}
                      >
                        {savedIds.has(opp.noticeId)
                          ? <BookmarkCheck className="h-4 w-4" />
                          : <Bookmark className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDetail(opp)}
                      >
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && (
                <Button variant="outline" size="sm" disabled>...</Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Showing text */}
          <div className="text-center text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, results.length)} of {results.length} results
          </div>
        </div>
      )}

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOpportunity(null)}>
          <Card className="max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-[#1e3a5f]">{selectedOpportunity.title}</CardTitle>
                  <CardDescription className="mt-1">
                    Notice ID: {selectedOpportunity.noticeId}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => window.open(selectedOpportunity.uiLink, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on SAM.gov
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedOpportunity(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Badge */}
              <div className="flex gap-2">
                {selectedOpportunity.active && (
                  <Badge className={selectedOpportunity.active === "Yes" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {selectedOpportunity.active === "Yes" ? "Active" : "Inactive"}
                  </Badge>
                )}
                {selectedOpportunity.type && (
                  <Badge variant="outline">{selectedOpportunity.type}</Badge>
                )}
              </div>

              {/* Basic Information Section */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Basic Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Notice ID</div>
                    <p className="font-medium text-sm">{selectedOpportunity.noticeId}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Solicitation Number</div>
                    <p className="font-medium text-sm">{selectedOpportunity.solicitationNumber || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Department/Agency</div>
                    <p className="font-medium text-sm">{selectedOpportunity.department || selectedOpportunity.organizationHierarchy?.split(".")[0] || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Sub-tier</div>
                    <p className="font-medium text-sm">{selectedOpportunity.subTier || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Office</div>
                    <p className="font-medium text-sm">{selectedOpportunity.office || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Set-Aside</div>
                    <p className="font-medium text-sm">{getSetAsideLabel(selectedOpportunity.typeOfSetAside) || "None"}</p>
                  </div>
                </div>
              </div>

              {/* Important Dates Section */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Important Dates</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Posted Date</div>
                    <p className="font-medium text-sm">{formatDate(selectedOpportunity.postedDate)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Response Deadline</div>
                    <p className="font-medium text-sm">{formatDate(selectedOpportunity.responseDeadLine)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Archive Date</div>
                    <p className="font-medium text-sm">{formatDate(selectedOpportunity.archiveDate)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Last Modified</div>
                    <p className="font-medium text-sm">{formatDate(selectedOpportunity.lastModifiedDate)}</p>
                  </div>
                </div>
              </div>

              {/* Classification Codes Section */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Classification Codes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">NAICS Code</div>
                    <p className="font-medium text-sm font-mono">{selectedOpportunity.naicsCode || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">PSC Code</div>
                    <p className="font-medium text-sm font-mono">{selectedOpportunity.classificationCode || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Fiscal Year</div>
                    <p className="font-medium text-sm">{selectedOpportunity.fiscalYear || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Solicitation Methods</div>
                    <p className="font-medium text-sm">{selectedOpportunity.solicitationMethods || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Place of Performance Section */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Place of Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">City</div>
                    <p className="font-medium text-sm">{selectedOpportunity.placeOfPerformance?.city || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">State</div>
                    <p className="font-medium text-sm">{selectedOpportunity.placeOfPerformance?.state || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">ZIP Code</div>
                    <p className="font-medium text-sm">{selectedOpportunity.placeOfPerformance?.zip || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Country</div>
                    <p className="font-medium text-sm">{selectedOpportunity.placeOfPerformance?.country || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Contract Information */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Contract Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Contracting Office</div>
                    <p className="font-medium text-sm">{selectedOpportunity.contractingOffice || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Funding Agency</div>
                    <p className="font-medium text-sm">{selectedOpportunity.fundingAgency || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Award Number</div>
                    <p className="font-medium text-sm">{selectedOpportunity.awardNumber || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Contract Values */}
              {(selectedOpportunity.estimatedContractValue || selectedOpportunity.contractAwardValue || selectedOpportunity.totalContractValue) && (
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Contract Values</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedOpportunity.estimatedContractValue && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Estimated Value</div>
                        <p className="font-medium text-sm">{selectedOpportunity.estimatedContractValue}</p>
                      </div>
                    )}
                    {selectedOpportunity.contractAwardValue && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Award Value</div>
                        <p className="font-medium text-sm">{selectedOpportunity.contractAwardValue}</p>
                      </div>
                    )}
                    {selectedOpportunity.totalContractValue && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Total Value</div>
                        <p className="font-medium text-sm">{selectedOpportunity.totalContractValue}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedOpportunity.description && (
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Description</h3>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {selectedOpportunity.description}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {selectedOpportunity.additionalInfo && (
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Additional Information</h3>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {selectedOpportunity.additionalInfo}
                  </div>
                </div>
              )}

              {/* Attachments */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Attachments & Documents</h3>
                {loadingDetail ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg">
                    <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Loading attachments...
                  </div>
                ) : selectedOpportunity.resourceLinks && selectedOpportunity.resourceLinks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOpportunity.resourceLinks.map((link, idx) => {
                      const isFile = (link as any).type === "file";
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <ExternalLink className="h-4 w-4 text-blue-600 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-sm font-medium truncate block">{link.name || link.description || `Document ${idx + 1}`}</span>
                              {isFile && (
                                <span className="text-xs text-muted-foreground">Opens on SAM.gov — sign in to download</span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="shrink-0"
                            onClick={() => window.open((link.url || (link as any).downloadUrl), "_blank")}
                          >
                            {isFile ? "View on SAM.gov" : "Open"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg">No attachments available for this opportunity.</p>
                )}
              </div>

              {/* Points of Contact */}
              {selectedOpportunity.pointOfContact && selectedOpportunity.pointOfContact.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Points of Contact</h3>
                  <div className="space-y-2">
                    {selectedOpportunity.pointOfContact.map((contact, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{contact.name}</p>
                        {contact.title && <p className="text-sm text-muted-foreground">{contact.title}</p>}
                        {contact.email && <p className="text-sm text-muted-foreground">{contact.email}</p>}
                        {contact.phone && <p className="text-sm text-muted-foreground">{contact.phone}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Award Information */}
              {selectedOpportunity.award && (
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Award Information</h3>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Awardee</div>
                        <p className="font-medium">{selectedOpportunity.award.awardee || "N/A"}</p>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Award Date</div>
                        <p className="font-medium">{formatDate(selectedOpportunity.award.date)}</p>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Award Amount</div>
                        <p className="font-medium">{selectedOpportunity.award.amount ? `$${selectedOpportunity.award.amount.toLocaleString()}` : "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

        </TabsContent>
      </Tabs>

      {/* Save & Tag Dialog */}
      <Dialog open={!!saveTarget} onOpenChange={(o) => !o && setSaveTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-[#1e3a5f]" />
              Save Opportunity
            </DialogTitle>
            <p className="text-sm text-muted-foreground">Add tags, notes, and assign this opportunity to a team member.</p>
          </DialogHeader>
          {saveTarget && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm text-[#1e3a5f] line-clamp-2">{saveTarget.title}</p>
                <p className="text-xs text-gray-500 mt-1">{saveTarget.noticeId}</p>
              </div>
              <div>
                <Label>Tags <span className="text-gray-400 font-normal">(comma-separated)</span></Label>
                <Input
                  className="mt-1"
                  value={saveTags}
                  onChange={(e) => setSaveTags(e.target.value)}
                  placeholder="e.g. IT Services, Priority, NAICS 541511"
                />
              </div>
              <div>
                <Label>Assign To <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Select value={saveAssignee} onValueChange={setSaveAssignee}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select team member..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__unassigned__">— Unassigned —</SelectItem>
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({m.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Textarea
                  className="mt-1"
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes about this opportunity..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveTarget(null)}>Cancel</Button>
            <Button
              onClick={handleSaveOpportunity}
              disabled={saving}
              className="bg-[#1e3a5f] hover:bg-[#152d4a]"
            >
              {saving ? "Saving..." : "Save Opportunity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
