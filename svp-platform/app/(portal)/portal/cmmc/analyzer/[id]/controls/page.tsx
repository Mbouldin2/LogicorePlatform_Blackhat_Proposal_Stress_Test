"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Edit,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ControlAssessment, ControlStatus } from "@/lib/types/cmmc";
import { NISTControl } from "@/lib/types/cmmc";

interface ControlAssessmentWithDef extends ControlAssessment {
  controlDefinition?: NISTControl;
}

type SortField = "controlId" | "status" | "family";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | ControlStatus;

export default function AssessmentControlsPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [assessmentName, setAssessmentName] = useState("");
  const [controls, setControls] = useState<ControlAssessmentWithDef[]>([]);

  // Search / sort / filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("controlId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, cRes] = await Promise.all([
          fetch(`/api/cmmc/assessments?id=${assessmentId}`),
          fetch(`/api/cmmc/controls?assessmentId=${assessmentId}`),
        ]);
        if (aRes.ok) {
          const d = await aRes.json();
          setAssessmentName(d.name || "Assessment");
        }
        if (cRes.ok) {
          const d = await cRes.json();
          setControls(d.controlAssessments || []);
        }
      } catch (err) {
        console.error("Error loading controls:", err);
        toast.error("Failed to load controls");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assessmentId]);

  // Stats
  const applicable = useMemo(() => controls.filter(c => c.isApplicable), [controls]);
  const implemented = useMemo(() => applicable.filter(c => c.status === "implemented").length, [applicable]);
  const partial = useMemo(() => applicable.filter(c => c.status === "partially_implemented").length, [applicable]);
  const notImplemented = useMemo(() => applicable.filter(c => c.status === "not_implemented").length, [applicable]);
  const notTested = useMemo(() => applicable.filter(c => c.status === "not_tested").length, [applicable]);
  const score = applicable.length > 0 ? Math.round((implemented / applicable.length) * 100) : 0;

  // Filtered + sorted
  const displayed = useMemo(() => {
    let result = [...controls];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        c =>
          c.controlId.toLowerCase().includes(q) ||
          (c.controlDefinition?.title ?? "").toLowerCase().includes(q) ||
          (c.controlDefinition?.description ?? "").toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(c => c.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "controlId") cmp = a.controlId.localeCompare(b.controlId);
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      else if (sortField === "family") {
        const fa = a.controlId.split(".")[0];
        const fb = b.controlId.split(".")[0];
        cmp = fa.localeCompare(fb);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [controls, search, statusFilter, sortField, sortDir]);

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all" || sortField !== "controlId" || sortDir !== "asc";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortField("controlId");
    setSortDir("asc");
  };

  const getStatusBadge = (status: ControlStatus) => {
    switch (status) {
      case "implemented":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex-shrink-0"><CheckCircle className="h-3 w-3 mr-1" />Implemented</Badge>;
      case "partially_implemented":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex-shrink-0"><Clock className="h-3 w-3 mr-1" />Partial</Badge>;
      case "not_implemented":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 flex-shrink-0"><XCircle className="h-3 w-3 mr-1" />Not Implemented</Badge>;
      case "not_applicable":
        return <Badge variant="outline" className="flex-shrink-0">N/A</Badge>;
      default:
        return <Badge variant="outline" className="flex-shrink-0"><Clock className="h-3 w-3 mr-1" />Not Tested</Badge>;
    }
  };

  const getLevelBadge = (level?: number) => {
    switch (level) {
      case 1: return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">L1</Badge>;
      case 2: return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">L2</Badge>;
      case 3: return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs">L3</Badge>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8A951]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}`)}
          className="mb-2 -ml-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessment
        </Button>
        <h1 className="text-3xl font-bold text-[#1e3a5f]">Review Controls</h1>
        <p className="text-muted-foreground mt-1">{assessmentName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: controls.length, color: "text-[#1e3a5f]", filter: "all" as StatusFilter },
          { label: "Implemented", value: implemented, color: "text-green-600", filter: "implemented" as StatusFilter },
          { label: "Partial", value: partial, color: "text-amber-600", filter: "partially_implemented" as StatusFilter },
          { label: "Not Impl.", value: notImplemented, color: "text-red-600", filter: "not_implemented" as StatusFilter },
          { label: "Not Tested", value: notTested, color: "text-gray-500", filter: "not_tested" as StatusFilter },
        ].map(({ label, value, color, filter }) => (
          <Card
            key={label}
            className={`cursor-pointer transition-all ${statusFilter === filter ? "ring-2 ring-[#C8A951]" : ""}`}
            onClick={() => setStatusFilter(statusFilter === filter ? "all" : filter)}
          >
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score bar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Compliance Score</span>
            <span className={`text-sm font-bold ${score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-600"}`}>
              {score}%
            </span>
          </div>
          <Progress value={score} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {implemented} of {applicable.length} applicable controls implemented
          </p>
        </CardContent>
      </Card>

      {/* Controls list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#C8A951]" />
                Control Assessments
              </CardTitle>
              <CardDescription>
                Review and update the implementation status of each control
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by control ID or title…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                  <SelectItem value="partially_implemented">Partial</SelectItem>
                  <SelectItem value="not_implemented">Not Implemented</SelectItem>
                  <SelectItem value="not_tested">Not Tested</SelectItem>
                  <SelectItem value="not_applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              {sortDir === "asc"
                ? <SortAsc className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                : <SortDesc className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              }
              <Select
                value={`${sortField}-${sortDir}`}
                onValueChange={v => {
                  const [field, dir] = v.split("-") as [SortField, SortDir];
                  setSortField(field);
                  setSortDir(dir);
                }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Sort by…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="controlId-asc">Control ID (A → Z)</SelectItem>
                  <SelectItem value="controlId-desc">Control ID (Z → A)</SelectItem>
                  <SelectItem value="family-asc">Family (A → Z)</SelectItem>
                  <SelectItem value="family-desc">Family (Z → A)</SelectItem>
                  <SelectItem value="status-asc">Status (A → Z)</SelectItem>
                  <SelectItem value="status-desc">Status (Z → A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            Showing <span className="font-semibold text-foreground">{displayed.length}</span> of {controls.length} controls
          </p>
        </CardHeader>

        <CardContent>
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Search className="h-10 w-10 opacity-30" />
              <p className="text-lg font-medium">No controls match your search</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {displayed.map(control => (
                <div
                  key={control.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-3"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-[#1e3a5f]">
                        {control.controlId}
                      </span>
                      {getLevelBadge(control.controlDefinition?.cmmcLevel)}
                      {getStatusBadge(control.status)}
                      {!control.isApplicable && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Not Applicable</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">
                      {control.controlDefinition?.title || "Unknown Control"}
                    </p>
                    {control.implementationDescription && (
                      <p className="text-xs text-muted-foreground truncate">
                        {control.implementationDescription}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}/controls/${control.id}`)}
                    className="flex-shrink-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
