import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  ClipboardList,
  Droplets,
  FileDown,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { requireAdminPage } from "@/lib/admin-auth";
import { formatAdminDateTime } from "@/lib/admin";
import prisma from "@/lib/prisma";

export default async function AdminDashboard() {
  await requireAdminPage();
  const [
    users,
    cases,
    environmental,
    pendingCases,
    highRiskCases,
    recentLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.assessment.count(),
    prisma.environmentalData.count(),
    prisma.assessment.count({ where: { validationStatus: "PENDING" } }),
    prisma.assessment.count({ where: { riskLevel: "HIGH" } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true } } },
    }),
  ]);

  const cards = [
    { label: "Total Users", value: users, href: "/admin/users", icon: Users },
    { label: "Disease Records", value: cases, href: "/admin/records", icon: Activity },
    { label: "Water Surveillance Points", value: environmental, href: "/admin/records", icon: Droplets },
    { label: "Severe Outbreak Cases", value: highRiskCases, href: "/admin/records", icon: AlertTriangle },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <AdminPageHeader
        eyebrow="Epidemic Surveillance Administration"
        title="Command Center"
        description="Monitor disease reports, staff validations, environmental hazards, and authoritative reports."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.map(({ label, value, href, icon: Icon }) => (
          <Link
            href={href}
            key={label}
            className="rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex justify-between gap-3">
              <p className="text-2xl font-bold">{value}</p>
              <Icon size={18} className="text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Urgent Action Cards */}
        <div className="space-y-3">
          <Link
            href="/admin/records"
            className="rounded-xl border bg-card p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold">Unvalidated Disease Reports</p>
              <p className="text-xs text-muted-foreground mt-0.5">Awaiting staff clinical validation</p>
            </div>
            <Badge variant={pendingCases ? "destructive" : "secondary"}>
              {pendingCases}
            </Badge>
          </Link>

          <Link
            href="/admin/audit"
            className="rounded-xl border bg-card p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold">Surveillance Event Trail</p>
              <p className="text-xs text-muted-foreground mt-0.5">Immutable audit event logs</p>
            </div>
            <Badge variant="outline">Active</Badge>
          </Link>

          <Link
            href="/admin/reports"
            className="rounded-xl border bg-card p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold">Authoritative Export</p>
              <p className="text-xs text-muted-foreground mt-0.5">Download surveillance CSVs</p>
            </div>
            <FileDown size={16} className="text-primary" />
          </Link>
        </div>

        {/* Recent Audit Logs */}
        <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Recent Audit & Surveillance Activity</p>
            <Link
              href="/admin/audit"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y">
            {recentLogs.map((log) => (
              <div key={log.id} className="px-4 py-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">
                    {log.action.replaceAll("_", " ")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatAdminDateTime(log.createdAt)}
                  </p>
                </div>
                <p className="mt-0.5 text-muted-foreground">
                  {log.description ?? "System event"} · {log.user?.name ?? "System"}
                </p>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <p className="py-12 text-center text-xs text-muted-foreground">
                No audit activity recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
