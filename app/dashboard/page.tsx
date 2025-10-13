// crav-dashboard-app/app/dashboard/page.tsx
import Link from "next/link";
import {
  Crown,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Gauge,
  Package2,
  Wallet2,
  Zap,
} from "lucide-react";

/* ---------- Small presentational helpers (server-safe) ---------- */

function Stat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="text-sm text-slate-600">{label}</div>
        {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
      </div>
      <div className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
      {hint ? <div className="mt-2 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function AppTile({
  name,
  blurb,
  href = "#",
  free = false,
}: {
  name: string;
  blurb: string;
  href?: string;
  free?: boolean;
}) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base md:text-lg font-semibold text-slate-900">
          {name}
        </h3>
        <span
          className={`badge ${
            free ? "bg-green-50 text-green-700 border-green-200" : ""
          }`}
        >
          {free ? "Free" : "Paid"}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600 flex-1">{blurb}</p>
      <div className="mt-4">
        <Link href={href} className="btn btn-primary">
          Open
        </Link>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default async function DashboardPage() {
  // Temporary static values; wire up to your APIs later.
  const installedApps = 0;
  const planName = "Starter";
  const monthlyCredits = 1000;
  const creditBalance = 1000;

  // Admin “Unlimited” read from public flag for now (swap to real auth soon)
  const isAdmin =
    (process.env.NEXT_PUBLIC_SHOW_ADMIN || "").toLowerCase() === "true";
  const creditValue = isAdmin ? "Unlimited" : creditBalance.toLocaleString();

  const apps = [
    {
      name: "Logo Studio",
      blurb:
        "Generate, refine, and export brand-ready logos with vector outputs.",
      href: "/apps/logo-studio",
      free: true,
    },
    {
      name: "Music Builder",
      blurb:
        "Compose tracks with AI instruments. Stem export, mastering, and mixdown.",
      href: "/apps/music-builder",
      free: false,
    },
    {
      name: "Website Builder",
      blurb:
        "Launch production-grade sites with modular blocks and built-in SEO.",
      href: "/apps/website-builder",
      free: false,
    },
  ];

  return (
    <main>
      {/* Hero / Intro */}
      <section className="container mx-auto max-w-[1200px] px-4 pt-6">
        <div className="card p-6 md:p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Welcome to CRAV Dashboard
              </h1>
              <p className="mt-2 text-slate-600">
                Unified command center for <strong>apps</strong>,{" "}
                <strong>credits</strong>, and <strong>billing</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <span className="badge bg-violet-50 text-violet-700 border-violet-200">
                  <Crown className="h-4 w-4" />
                  Admin: Unlimited
                </span>
              )}
              <span className="badge">
                <ShieldCheck className="h-4 w-4" />
                Enterprise-grade
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Row */}
      <section className="container mx-auto max-w-[1200px] px-4 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Credit Balance"
          value={creditValue}
          hint={isAdmin ? "No limits for administrators" : "credits available"}
          icon={Wallet2}
        />
        <Stat
          label="Current Plan"
          value={planName}
          hint={`${monthlyCredits.toLocaleString()} credits/month`}
          icon={Package2}
        />
        <Stat
          label="Installed Apps"
          value={String(installedApps)}
          hint="across your organization"
          icon={Sparkles}
        />
        <Stat label="Avg. Response" value="~120ms" hint="last 24 hours" icon={Gauge} />
      </section>

      {/* Apps Catalog */}
      <section className="container mx-auto max-w-[1200px] px-4 mt-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              <span className="inline-flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Apps Catalog
              </span>
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              Discover tools. Try for free. Install with one click.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/apps" className="btn btn-outline">
              View all
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {apps.map((a) => (
            <AppTile key={a.name} {...a} />
          ))}
        </div>
      </section>

      {/* Unified Credits + Billing */}
      <section className="container mx-auto max-w-[1200px] px-4 mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unified Credits */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-slate-900">Unified Credits</h3>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            One balance powers all apps. Share across tools, carry over, and top-up anytime.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="card-quiet p-4">
              <div className="text-sm text-slate-600">Current Balance</div>
              <div className="text-2xl font-bold mt-1">{creditValue}</div>
              {!isAdmin && (
                <div className="text-xs text-slate-500 mt-1">credits</div>
              )}
            </div>
            <div className="card-quiet p-4">
              <div className="text-sm text-slate-600">Projected Usage</div>
              <div className="text-2xl font-bold mt-1">~650</div>
              <div className="text-xs text-slate-500 mt-1">next 30 days (est.)</div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard/credits" className="btn btn-outline">
              Manage Credits
            </Link>
            <Link href="/dashboard/apps" className="btn btn-ghost">
              Browse Apps
            </Link>
          </div>
        </div>

        {/* Billing & Payments */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-slate-900">Billing & Payments</h3>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Upgrade your plan or purchase credits via Stripe or PayPal.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-quiet p-4">
              <div className="text-sm text-slate-600">Current Plan</div>
              <div className="text-xl font-semibold mt-1">{planName}</div>
              <div className="text-xs text-slate-500 mt-1">
                {monthlyCredits.toLocaleString()} credits/month
              </div>
            </div>
            <div className="card-quiet p-4">
              <div className="text-sm text-slate-600">Next Invoice</div>
              <div className="text-xl font-semibold mt-1">$0.00</div>
              <div className="text-xs text-slate-500 mt-1">trial period</div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {/* Update hrefs to match your API routes if different */}
            <Link href="/api/billing/stripe/checkout" className="btn btn-primary">
              <CreditCard className="h-4 w-4" />
              Pay with Stripe
            </Link>
            <Link href="/api/webhooks/paypal" className="btn btn-outline">
              <img src="/icons/paypal.svg" alt="" className="h-4" />
              Pay with PayPal
            </Link>
            <Link href="/dashboard/billing" className="btn btn-ghost">
              Billing Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Cross-sell */}
      <section className="container mx-auto max-w-[1200px] px-4 mt-10 mb-8">
        <div className="card p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                Supercharge your workflow with connected apps
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                All apps share credits, assets, and settings. Install one and they work together.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/apps" className="btn btn-primary">
                Explore Apps
              </Link>
              <Link href="/dashboard/assets" className="btn btn-ghost">
                Manage Assets
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
