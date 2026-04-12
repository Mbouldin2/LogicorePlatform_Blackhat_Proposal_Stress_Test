"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  ClipboardCheck,
  Save,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  SYSTEM_DISCOVERY_QUESTIONS,
  ACCESS_CONTROL_QUESTIONS,
  AUTHENTICATION_QUESTIONS,
  COMPLETE_QUESTIONNAIRE,
} from "@/lib/data/cmmc-questionnaire";
import { AssessmentQuestion } from "@/lib/types/cmmc";

type Answer = string | string[] | boolean;

const SECTIONS: { label: string; questions: AssessmentQuestion[] }[] = [
  { label: "System Discovery", questions: SYSTEM_DISCOVERY_QUESTIONS },
  { label: "Access Control", questions: ACCESS_CONTROL_QUESTIONS },
  { label: "Authentication", questions: AUTHENTICATION_QUESTIONS },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessmentName, setAssessmentName] = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load assessment name
        const res = await fetch(`/api/cmmc/assessments?id=${assessmentId}`);
        if (res.ok) {
          const data = await res.json();
          setAssessmentName(data.name || "Assessment");
        }

        // Load existing questionnaire responses
        const qRes = await fetch(`/api/cmmc/questionnaire?assessmentId=${assessmentId}`);
        if (qRes.ok) {
          const qData = await qRes.json();
          const existing: Record<string, Answer> = {};
          (qData.responses || []).forEach((r: { questionId: string; answer: Answer }) => {
            existing[r.questionId] = r.answer;
          });
          setAnswers(existing);
        }
      } catch (err) {
        console.error("Error loading questionnaire:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [assessmentId]);

  const currentQuestions = SECTIONS[currentSection]?.questions ?? [];

  const answeredInSection = useMemo(
    () => currentQuestions.filter(q => answers[q.id] !== undefined).length,
    [currentQuestions, answers]
  );

  const totalAnswered = useMemo(
    () => SECTIONS.flatMap(s => s.questions).filter(q => answers[q.id] !== undefined).length,
    [answers]
  );

  const totalQuestions = SECTIONS.reduce((acc, s) => acc + s.questions.length, 0);
  const progressPct = Math.round((totalAnswered / totalQuestions) * 100);

  const setAnswer = (questionId: string, value: Answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const toggleMultiSelect = (questionId: string, option: string) => {
    const current = (answers[questionId] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter(v => v !== option)
      : [...current, option];
    setAnswer(questionId, updated);
  };

  const saveResponses = async () => {
    setSaving(true);
    try {
      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      const res = await fetch(`/api/cmmc/questionnaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, responses }),
      });
      if (res.ok) {
        toast.success("Responses saved successfully");
      } else {
        toast.error("Failed to save responses");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    await saveResponses();
    router.push(`/portal/cmmc/analyzer/${assessmentId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8A951]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#1e3a5f]">CMMC Questionnaire</h1>
            <p className="text-muted-foreground mt-1">{assessmentName}</p>
          </div>
          <Button
            variant="outline"
            onClick={saveResponses}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Progress
          </Button>
        </div>
      </div>

      {/* Overall progress */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{totalAnswered} / {totalQuestions} answered</span>
          </div>
          <Progress value={progressPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{progressPct}% complete</p>
        </CardContent>
      </Card>

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map((section, idx) => {
          const sectionAnswered = section.questions.filter(q => answers[q.id] !== undefined).length;
          const isComplete = sectionAnswered === section.questions.length;
          return (
            <button
              key={idx}
              onClick={() => setCurrentSection(idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                currentSection === idx
                  ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                  : "bg-white text-[#1e3a5f] border-gray-200 hover:border-[#1e3a5f]"
              }`}
            >
              {isComplete && <CheckCircle className="h-4 w-4 text-green-500" />}
              {section.label}
              <Badge variant="outline" className={`text-xs ${currentSection === idx ? "border-white text-white" : ""}`}>
                {sectionAnswered}/{section.questions.length}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-[#C8A951]" />
            {SECTIONS[currentSection]?.label}
          </CardTitle>
          <CardDescription>
            {answeredInSection} of {currentQuestions.length} questions answered in this section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {currentQuestions.map((q, qIdx) => (
            <div key={q.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center font-bold mt-0.5">
                  {qIdx + 1}
                </span>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm leading-snug">{q.question}</p>
                  {q.helpText && (
                    <p className="text-xs text-muted-foreground">{q.helpText}</p>
                  )}
                  {answers[q.id] !== undefined && (
                    <CheckCircle className="h-4 w-4 text-green-500 inline-block ml-1" />
                  )}
                </div>
              </div>

              <div className="ml-10">
                {/* Boolean */}
                {q.questionType === "boolean" && (
                  <RadioGroup
                    value={answers[q.id] === true ? "yes" : answers[q.id] === false ? "no" : ""}
                    onValueChange={v => setAnswer(q.id, v === "yes")}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                      <Label htmlFor={`${q.id}-yes`}>Yes</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id={`${q.id}-no`} />
                      <Label htmlFor={`${q.id}-no`}>No</Label>
                    </div>
                  </RadioGroup>
                )}

                {/* Multiple choice */}
                {q.questionType === "multiple_choice" && q.options && (
                  <RadioGroup
                    value={(answers[q.id] as string) || ""}
                    onValueChange={v => setAnswer(q.id, v)}
                    className="space-y-2"
                  >
                    {q.options.map(opt => (
                      <div key={opt} className="flex items-center gap-2">
                        <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                        <Label htmlFor={`${q.id}-${opt}`} className="text-sm font-normal cursor-pointer">
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Multi-select */}
                {q.questionType === "multi_select" && q.options && (
                  <div className="space-y-2">
                    {q.options.map(opt => {
                      const selected = ((answers[q.id] as string[]) || []).includes(opt);
                      return (
                        <div key={opt} className="flex items-center gap-2">
                          <Checkbox
                            id={`${q.id}-${opt}`}
                            checked={selected}
                            onCheckedChange={() => toggleMultiSelect(q.id, opt)}
                          />
                          <Label htmlFor={`${q.id}-${opt}`} className="text-sm font-normal cursor-pointer">
                            {opt}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Text */}
                {q.questionType === "text" && (
                  <Input
                    placeholder="Enter your answer…"
                    value={(answers[q.id] as string) || ""}
                    onChange={e => setAnswer(q.id, e.target.value)}
                    className="max-w-md"
                  />
                )}
              </div>

              {/* Related controls */}
              {q.applicableControls.length > 0 && (
                <div className="ml-10 flex flex-wrap gap-1">
                  {q.applicableControls.slice(0, 4).map(ctrl => (
                    <Badge key={ctrl} variant="outline" className="text-xs text-muted-foreground">
                      {ctrl}
                    </Badge>
                  ))}
                  {q.applicableControls.length > 4 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{q.applicableControls.length - 4} more
                    </Badge>
                  )}
                </div>
              )}

              {qIdx < currentQuestions.length - 1 && (
                <hr className="mt-4 border-gray-100" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentSection(s => Math.max(0, s - 1))}
          disabled={currentSection === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous Section
        </Button>

        {currentSection < SECTIONS.length - 1 ? (
          <Button
            onClick={async () => {
              await saveResponses();
              setCurrentSection(s => s + 1);
            }}
            className="bg-[#C8A951] hover:bg-[#b89a42] text-[#1e3a5f]"
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Next Section
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleFinish}
            className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Finish Questionnaire
          </Button>
        )}
      </div>
    </div>
  );
}
