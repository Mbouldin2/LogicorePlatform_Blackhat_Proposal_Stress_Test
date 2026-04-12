"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS, ContactFormSubmissionDoc } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Building, Calendar, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type SubmissionStatus = "new" | "contacted" | "qualified" | "converted" | "closed";

interface Submission extends Omit<ContactFormSubmissionDoc, "submittedAt" | "createdAt" | "updatedAt" | "emailSentAt"> {
  id: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  emailSentAt?: Date;
}

const statusColors: Record<SubmissionStatus, string> = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  qualified: "bg-purple-500",
  converted: "bg-green-500",
  closed: "bg-gray-500",
};

const statusLabels: Record<SubmissionStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  closed: "Closed",
};

export default function FormSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | "all">("all");
  const [filterType, setFilterType] = useState<"all" | "assessment_request" | "book_call">("all");

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, COLLECTIONS.CONTACT_FORM_SUBMISSIONS), orderBy("submittedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Submission[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          formType: d.formType,
          status: d.status,
          firstName: d.firstName,
          lastName: d.lastName,
          email: d.email,
          phone: d.phone,
          company: d.company,
          jobTitle: d.jobTitle,
          companySize: d.companySize,
          industry: d.industry,
          serviceOfInterest: d.serviceOfInterest,
          message: d.message,
          preferredDate: d.preferredDate,
          preferredTime: d.preferredTime,
          source: d.source,
          pageUrl: d.pageUrl,
          emailSent: d.emailSent,
          emailError: d.emailError,
          assignedTo: d.assignedTo,
          adminNotes: d.adminNotes,
          submittedAt: d.submittedAt?.toDate() || new Date(),
          createdAt: d.createdAt?.toDate() || new Date(),
          updatedAt: d.updatedAt?.toDate() || new Date(),
          emailSentAt: d.emailSentAt?.toDate(),
        };
      });
      setSubmissions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: SubmissionStatus) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, COLLECTIONS.CONTACT_FORM_SUBMISSIONS, id), {
        status,
        updatedAt: Timestamp.now(),
      });
      toast.success(`Status updated to ${statusLabels[status]}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, COLLECTIONS.CONTACT_FORM_SUBMISSIONS, id), {
        adminNotes: notes,
        updatedAt: Timestamp.now(),
      });
      toast.success("Notes saved");
    } catch (error) {
      toast.error("Failed to save notes");
    }
  };

  const filtered = submissions.filter((s) => {
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (filterType !== "all" && s.formType !== filterType) return false;
    return true;
  });

  const newCount = submissions.filter((s) => s.status === "new").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Form Submissions</h1>
          <p className="text-muted-foreground">Manage contact form submissions from the website</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">{newCount} New</Badge>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="assessment_request">Assessment</SelectItem>
              <SelectItem value="book_call">Book Call</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as SubmissionStatus | "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No submissions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelected(s); setDetailsOpen(true); }}>
                    <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                    <TableCell>
                      <Badge variant={s.formType === "book_call" ? "default" : "secondary"}>
                        {s.formType === "book_call" ? "Book Call" : "Assessment"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{s.email}</span>
                        {s.phone && <span className="text-xs text-muted-foreground">{s.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell>{s.company || "-"}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[s.status as SubmissionStatus]}>{statusLabels[s.status as SubmissionStatus]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{format(s.submittedAt, "MMM d, yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Submission Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact Info</h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-lg">{selected.firstName} {selected.lastName}</p>
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{selected.email}</p>
                    {selected.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{selected.phone}</p>}
                    {selected.company && <p className="flex items-center gap-2"><Building className="h-4 w-4" />{selected.company}</p>}
                    {selected.jobTitle && <p className="text-muted-foreground">{selected.jobTitle}</p>}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>Type: <Badge variant={selected.formType === "book_call" ? "default" : "secondary"}>{selected.formType === "book_call" ? "Book Call" : "Assessment"}</Badge></p>
                    {selected.serviceOfInterest && <p>Service: {selected.serviceOfInterest}</p>}
                    {selected.companySize && <p>Size: {selected.companySize}</p>}
                    {selected.industry && <p>Industry: {selected.industry}</p>}
                    {selected.preferredDate && <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{selected.preferredDate}</p>}
                    {selected.preferredTime && <p className="capitalize">{selected.preferredTime}</p>}
                  </div>
                </div>
              </div>

              {selected.message && (
                <div>
                  <h4 className="font-semibold mb-1">Message</h4>
                  <p className="text-sm bg-muted p-3 rounded-md">{selected.message}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Update Status</h4>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(statusLabels) as SubmissionStatus[]).map((status) => (
                    <Button key={status} variant={selected.status === status ? "default" : "outline"} size="sm" onClick={() => updateStatus(selected.id, status)}>
                      {statusLabels[status]}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Admin Notes</h4>
                <Textarea defaultValue={selected.adminNotes || ""} onBlur={(e) => updateNotes(selected.id, e.target.value)} placeholder="Add notes..." rows={3} />
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p>Submitted: {format(selected.submittedAt, "PPpp")}</p>
                <p>Email sent: {selected.emailSent ? "Yes" : "No"}{selected.emailError && ` (Error: ${selected.emailError})`}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
