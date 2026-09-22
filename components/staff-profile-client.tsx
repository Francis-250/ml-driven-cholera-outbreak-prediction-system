"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Edit2, Lock, Save, X } from "lucide-react";
import {
  revokeStaffSession,
  updateStaffAccount,
  updateStaffProfessional,
} from "@/actions/staff/profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

type Props = {
  user: {
    name: string;
    email: string;
    phoneNumber: string | null;
    displayUsername: string | null;
    twoFactorEnabled: boolean;
  };
  profile: {
    specialization: string | null;
    hospitalName: string | null;
    licenseNumber: string | null;
    isVerified: boolean;
  };
  sessions: {
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    updatedAt: string;
    current: boolean;
  }[];
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function device(userAgent: string | null) {
  if (!userAgent) return "Unknown device";
  const browser = userAgent.includes("Firefox") ? "Firefox" : userAgent.includes("Chrome") ? "Chrome" : userAgent.includes("Safari") ? "Safari" : "Browser";
  const os = userAgent.includes("Windows") ? "Windows" : userAgent.includes("Mac") ? "macOS" : userAgent.includes("Android") ? "Android" : "device";
  return `${browser} on ${os}`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{children}</p>;
}

export function StaffProfileClient({ user, profile, sessions }: Props) {
  const [editingAccount, setEditingAccount] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(false);
  const [account, setAccount] = useState({
    name: user.name,
    phoneNumber: user.phoneNumber ?? "",
    displayUsername: user.displayUsername ?? "",
  });
  const [professional, setProfessional] = useState({
    specialization: profile.specialization ?? "",
    hospitalName: profile.hospitalName ?? "",
    licenseNumber: profile.licenseNumber ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<void>, onSuccess?: () => void) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await action();
        setSuccess("Changes saved successfully.");
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
          {initials(user.name)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <Badge variant="outline" className="text-xs">
              Public Health Staff
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      {success && <p className="text-xs text-emerald-600 dark:text-emerald-400">{success}</p>}

      {/* Account Info */}
      <div className="rounded-xl border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <SectionTitle>Account Information</SectionTitle>
          {!editingAccount ? (
            <Button variant="ghost" size="sm" onClick={() => setEditingAccount(true)} className="text-xs gap-1.5">
              <Edit2 size={13} /> Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingAccount(false)} className="text-xs gap-1">
                <X size={13} /> Cancel
              </Button>
              <Button
                size="sm"
                disabled={pending}
                onClick={() => run(() => updateStaffAccount(account), () => setEditingAccount(false))}
                className="text-xs gap-1"
              >
                <Save size={13} /> Save
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <Label className="text-muted-foreground">Full Name</Label>
            {editingAccount ? (
              <Input
                value={account.name}
                onChange={(e) => setAccount({ ...account, name: e.target.value })}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 font-medium">{user.name}</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Display Name / Alias</Label>
            {editingAccount ? (
              <Input
                value={account.displayUsername}
                onChange={(e) => setAccount({ ...account, displayUsername: e.target.value })}
                placeholder="Optional display name"
                className="mt-1"
              />
            ) : (
              <p className="mt-1 font-medium">{user.displayUsername || "Not set"}</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <p className="mt-1 font-medium">{user.email}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Phone Number</Label>
            {editingAccount ? (
              <Input
                value={account.phoneNumber}
                onChange={(e) => setAccount({ ...account, phoneNumber: e.target.value })}
                placeholder="+250 788 000 000"
                className="mt-1"
              />
            ) : (
              <p className="mt-1 font-medium">{user.phoneNumber || "Not set"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Professional Surveillance Affiliation */}
      <div className="rounded-xl border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <SectionTitle>Surveillance Center & Affiliation</SectionTitle>
          {!editingProfessional ? (
            <Button variant="ghost" size="sm" onClick={() => setEditingProfessional(true)} className="text-xs gap-1.5">
              <Edit2 size={13} /> Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingProfessional(false)} className="text-xs gap-1">
                <X size={13} /> Cancel
              </Button>
              <Button
                size="sm"
                disabled={pending}
                onClick={() => run(() => updateStaffProfessional(professional), () => setEditingProfessional(false))}
                className="text-xs gap-1"
              >
                <Save size={13} /> Save
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <Label className="text-muted-foreground">Surveillance Specialization</Label>
            {editingProfessional ? (
              <Input
                value={professional.specialization}
                onChange={(e) => setProfessional({ ...professional, specialization: e.target.value })}
                placeholder="e.g. Field Epidemiology"
                className="mt-1"
              />
            ) : (
              <p className="mt-1 font-medium">{profile.specialization || "Public Health Officer"}</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Surveillance Facility / Hospital</Label>
            {editingProfessional ? (
              <Input
                value={professional.hospitalName}
                onChange={(e) => setProfessional({ ...professional, hospitalName: e.target.value })}
                placeholder="e.g. National Epidemic Response Center"
                className="mt-1"
              />
            ) : (
              <p className="mt-1 font-medium">{profile.hospitalName || "Not set"}</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Staff / License ID</Label>
            {editingProfessional ? (
              <Input
                value={professional.licenseNumber}
                onChange={(e) => setProfessional({ ...professional, licenseNumber: e.target.value })}
                placeholder="e.g. RMC-EPID-2026-001"
                className="mt-1"
              />
            ) : (
              <p className="mt-1 font-medium">{profile.licenseNumber || "Not registered"}</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Verification Status</Label>
            <p className="mt-1 flex items-center gap-1 font-medium text-emerald-600">
              <CheckCircle2 size={13} /> Active Staff Member
            </p>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="rounded-xl border p-5 space-y-4">
        <SectionTitle>Active Sessions</SectionTitle>
        <div className="divide-y text-xs">
          {sessions.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{device(item.userAgent)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {item.ipAddress || "Local"} · Active {item.updatedAt}
                </p>
              </div>
              {item.current ? (
                <Badge variant="secondary" className="text-[10px]">Current Session</Badge>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => revokeStaffSession(item.id))}
                  className="text-xs text-destructive hover:bg-destructive/10"
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
