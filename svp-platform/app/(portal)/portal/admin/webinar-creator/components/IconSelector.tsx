"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileCheck,
  Users,
  Award,
  ArrowRight,
  Calendar,
  Target,
  Zap,
  Lock,
  Star,
  Building2,
  Briefcase,
  FileText,
  Heart,
  TrendingUp,
  DollarSign,
  Globe,
  Phone,
  Mail,
  MapPin,
  Settings,
  Lightbulb,
  Rocket,
  Flag,
  Trophy,
  ThumbsUp,
  Eye,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileCheck,
  Users,
  Award,
  ArrowRight,
  Calendar,
  Target,
  Zap,
  Lock,
  Star,
  Building2,
  Briefcase,
  FileText,
  Heart,
  TrendingUp,
  DollarSign,
  Globe,
  Phone,
  Mail,
  MapPin,
  Settings,
  Lightbulb,
  Rocket,
  Flag,
  Trophy,
  ThumbsUp,
  Eye,
};

interface IconSelectorProps {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
}

export function IconSelector({ value, onChange, label }: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = Object.keys(ICON_MAP).filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = value ? ICON_MAP[value] : null;

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2"
          >
            {SelectedIcon ? (
              <>
                <SelectedIcon className="h-4 w-4" />
                <span>{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Select an icon...</span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Icon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-5 gap-2">
                {filteredIcons.map((iconName) => {
                  const Icon = ICON_MAP[iconName];
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => {
                        onChange(iconName);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-lg border transition-colors",
                        value === iconName
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-[10px] text-center truncate w-full">
                        {iconName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function getIconComponent(iconName: string): LucideIcon | null {
  return ICON_MAP[iconName] || null;
}

export { ICON_MAP };
