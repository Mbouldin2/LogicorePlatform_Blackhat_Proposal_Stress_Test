"use client";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import { PenLine, ImageIcon, FileText, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/widgets";
import { MOCK_USAGE, MOCK_USAGE_SERIES, MOCK_FEATURE_USAGE } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

const COLORS = ["#4a43e0", "#9333ea", "#0F766E", "#e3a833", "#2563EB"];

export default function AnalyticsPage() {
  const u = MOCK_USAGE;
  return (
    <>
      <PageHeader title="Usage Analytics" description="Track AI consumption, output, and feature adoption across your team." />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Words generated" value={formatNumber(u.wordsUsed)} sub="this billing cycle" icon={PenLine} />
          <StatCard label="Visuals created" value={`${u.imagesUsed}`} sub="carousels, cards, ads" icon={ImageIcon} tone="gold" />
          <StatCard label="Documents" value={`${u.documents}`} sub="across all projects" icon={FileText} tone="violet" />
          <StatCard label="Active seats" value={`${u.seatsUsed}/${u.seatsLimit}`} sub="Professional plan" icon={Sparkles} tone="success" />
        </div>

        <Card>
          <CardHeader><CardTitle>AI word usage — last 14 days</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_USAGE_SERIES} margin={{ left: -16, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4a43e0" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#4a43e0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0f6" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#5d6480" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#5d6480" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e7f1", fontSize: 13 }} />
                  <Area type="monotone" dataKey="words" stroke="#4a43e0" strokeWidth={2.5} fill="url(#g)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Usage by feature</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={MOCK_FEATURE_USAGE} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={3}>
                      {MOCK_FEATURE_USAGE.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e7f1", fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Visuals generated — daily</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_USAGE_SERIES} margin={{ left: -16, right: 8, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef0f6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#5d6480" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#5d6480" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e7f1", fontSize: 13 }} cursor={{ fill: "#f1f3f9" }} />
                    <Bar dataKey="images" fill="#e3a833" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
