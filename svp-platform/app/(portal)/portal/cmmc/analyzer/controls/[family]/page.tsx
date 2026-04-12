"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ChevronRight,
  Loader2,
  BookOpen,
  Search,
  SortAsc,
  SortDesc,
  Filter,
  X,
} from "lucide-react";
import { NIST_CONTROLS, CONTROL_FAMILIES } from "@/lib/data/nist-controls";
import { NISTControl } from "@/lib/types/cmmc";

type SortField = "number" | "title" | "level";
type SortDir = "asc" | "desc";
type LevelFilter = "all" | "1" | "2" | "3";

export default function ControlFamilyPage() {
  const router = useRouter();
  const params = useParams();
  const familyCode = (params.family as string).toUpperCase();

  const [controls, setControls] = useState<NISTControl[]>([]);
  const [loading, setLoading] = useState(true);

  // Search / sort / filter state
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [sortField, setSortField] = useState<SortField>("number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    const familyControls = NIST_CONTROLS.filter(c => c.family === familyCode);
    setControls(familyControls);
    setLoading(false);
  }, [familyCode]);

  const familyName = CONTROL_FAMILIES[familyCode as keyof typeof CONTROL_FAMILIES] || familyCode;

  // Derived counts (exact per level, not cumulative)
  const level1Count = useMemo(() => controls.filter(c => c.cmmcLevel === 1).length, [controls]);
  const level2Count = useMemo(() => controls.filter(c => c.cmmcLevel === 2).length, [controls]);
  const level3Count = useMemo(() => controls.filter(c => c.cmmcLevel === 3).length, [controls]);

  // Filtered + sorted list
  const displayedControls = useMemo(() => {
    let result = [...controls];

    // Search: match on number, title, description
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        c =>
          c.number.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    // Level filter
    if (levelFilter !== "all") {
      const lvl = parseInt(levelFilter) as 1 | 2 | 3;
      result = result.filter(c => c.cmmcLevel === lvl);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "number") {
        cmp = a.number.localeCompare(b.number, undefined, { numeric: true });
      } else if (sortField === "title") {
        cmp = a.title.localeCompare(b.title);
      } else if (sortField === "level") {
        cmp = a.cmmcLevel - b.cmmcLevel;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [controls, search, levelFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setLevelFilter("all");
    setSortField("number");
    setSortDir("asc");
  };

  const hasActiveFilters = search.trim() !== "" || levelFilter !== "all" || sortField !== "number" || sortDir !== "asc";

  const getLevelBadge = (level: number) => {
    switch (level) {
      case 1:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Level 1</Badge>;
      case 2:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Level 2</Badge>;
      case 3:
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Level 3</Badge>;
      default:
        return <Badge variant="outline">Level {level}</Badge>;
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
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/portal/cmmc/analyzer")}
            className="mb-2 -ml-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analyzer
          </Button>
          <h1 className="text-3xl font-bold text-[#1e3a5f]">{familyCode} - {familyName}</h1>
          <p className="text-muted-foreground mt-1">
            {controls.length} NIST 800-171 controls in this family
          </p>
        </div>
      </div>

      {/* Stats — exact counts per level */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all ${levelFilter === "all" ? "ring-2 ring-[#C8A951]" : ""}`}
          onClick={() => setLevelFilter("all")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1e3a5f]">{controls.length}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${levelFilter === "1" ? "ring-2 ring-green-500" : ""}`}
          onClick={() => setLevelFilter(levelFilter === "1" ? "all" : "1")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CMMC Level 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{level1Count}</div>
            <p className="text-xs text-muted-foreground mt-1">Basic Safeguarding</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${levelFilter === "2" ? "ring-2 ring-blue-500" : ""}`}
          onClick={() => setLevelFilter(levelFilter === "2" ? "all" : "2")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CMMC Level 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{level2Count}</div>
            <p className="text-xs text-muted-foreground mt-1">Advanced Practices</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${levelFilter === "3" ? "ring-2 ring-purple-500" : ""}`}
          onClick={() => setLevelFilter(levelFilter === "3" ? "all" : "3")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CMMC Level 3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{level3Count}</div>
            <p className="text-xs text-muted-foreground mt-1">Expert Practices</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Control Details</CardTitle>
              <CardDescription>
                Detailed information for each control in the {familyCode} family
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Search / Sort / Filter toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by number, title, or description…"
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

            {/* Level filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Select value={levelFilter} onValueChange={v => setLevelFilter(v as LevelFilter)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="1">Level 1 Only</SelectItem>
                  <SelectItem value="2">Level 2 Only</SelectItem>
                  <SelectItem value="3">Level 3 Only</SelectItem>
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
                  <SelectItem value="number-asc">Number (A → Z)</SelectItem>
                  <SelectItem value="number-desc">Number (Z → A)</SelectItem>
                  <SelectItem value="title-asc">Title (A → Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z → A)</SelectItem>
                  <SelectItem value="level-asc">Level (Low → High)</SelectItem>
                  <SelectItem value="level-desc">Level (High → Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Result count */}
          <p className="text-sm text-muted-foreground mt-2">
            Showing <span className="font-semibold text-foreground">{displayedControls.length}</span> of {controls.length} controls
            {levelFilter !== "all" && (
              <span> · Level {levelFilter} filter active</span>
            )}
          </p>
        </CardHeader>

        <CardContent>
          {displayedControls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Search className="h-10 w-10 opacity-30" />
              <p className="text-lg font-medium">No controls match your search</p>
              <p className="text-sm">Try adjusting your search term or filters.</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedControls.map((control) => (
                <Card
                  key={control.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-[#C8A951]"
                  onClick={() => router.push(`/portal/cmmc/analyzer/controls/${familyCode.toLowerCase()}/${control.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-sm font-semibold text-[#1e3a5f]">
                            {control.number}
                          </span>
                          {getLevelBadge(control.cmmcLevel)}
                        </div>
                        <h3 className="text-lg font-semibold">{control.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {control.description}
                        </p>

                        {/* Quick Info */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {control.commonArtifacts.length} artifacts
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {control.testMethods.length} test methods
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {control.potentialAssessors.length} assessors
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
