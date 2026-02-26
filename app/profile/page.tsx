"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Play,
  RefreshCw,
  Settings,
  Store,
  User,
  X,
} from "lucide-react";
import { useAccountMode } from "@/contexts/account-mode";
import {
  useDemoMode,
  DEMO_BUSINESS_SLUG,
  DEMO_BUSINESS_NAME,
} from "@/contexts/demo-mode";
import { getMountPath } from "@/lib/config";
import {
  addMerchantBusiness,
  fetchProfile,
  type UserProfile,
} from "@/lib/profile";

type ProfileStatus = "idle" | "loading" | "success" | "error";

export default function ProfilePage() {
  const router = useRouter();
  const {
    currentBusiness,
    switchToUser,
    switchToMerchant,
    isMerchant,
  } = useAccountMode();
  const { isDemoMode, enterDemo, exitDemo } = useDemoMode();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<ProfileStatus>("loading");
  const [addBusinessName, setAddBusinessName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await fetchProfile();
      setProfile(data ?? null);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const handleAddBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = addBusinessName.trim();
    if (!name || adding) return;
    setAdding(true);
    setAddError(null);
    try {
      const updated = await addMerchantBusiness(name);
      setProfile(updated);
      setAddBusinessName("");
      const newBiz = updated.businesses.find(
        (b) => b.businessName.toLowerCase() === name.toLowerCase()
      );
      if (newBiz) {
        switchToMerchant({ slug: newBiz.slug, businessName: newBiz.businessName });
        setSuccessMessage(`${newBiz.businessName} added. You’re now in merchant mode.`);
      } else {
        setSuccessMessage("Business added.");
      }
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : "Could not add business. Try again."
      );
    } finally {
      setAdding(false);
    }
  };

  const handleSwitchToUser = () => {
    switchToUser();
    setSuccessMessage("Switched to personal account.");
  };

  const handleSwitchToMerchant = (slug: string, businessName: string) => {
    switchToMerchant({ slug, businessName });
    setSuccessMessage(`Now using ${businessName}.`);
  };

  const handleEnterDemo = () => {
    enterDemo();
    switchToMerchant({ slug: DEMO_BUSINESS_SLUG, businessName: DEMO_BUSINESS_NAME });
    router.push(getMountPath(DEMO_BUSINESS_NAME));
  };

  const handleExitDemo = () => {
    exitDemo();
    switchToUser();
    router.push("/");
  };

  const businesses = profile?.businesses ?? [];
  const hasBusinesses = businesses.length > 0;

  return (
    <div
      className="h-dvh overflow-y-auto overflow-x-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-3"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            background: "var(--neutral-100)",
            color: "var(--foreground)",
            outlineOffset: "2px",
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1
          className="flex-1 text-xl font-semibold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Profile
        </h1>
      </header>

      <main className="mx-auto max-w-xl px-4 pt-6" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
        {/* Success toast */}
        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-center gap-2 rounded-xl border px-4 py-3"
            style={{
              background: "var(--accent-muted)",
              borderColor: "var(--accent)",
              color: "var(--foreground)",
            }}
          >
            <Check size={20} className="shrink-0" style={{ color: "var(--accent)" }} />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}

        {/* Loading */}
        {status === "loading" && (
          <div className="space-y-6">
            <div
              className="h-24 animate-pulse rounded-2xl"
              style={{ background: "var(--neutral-200)" }}
            />
            <div
              className="h-32 animate-pulse rounded-2xl"
              style={{ background: "var(--neutral-200)" }}
            />
            <div
              className="h-20 animate-pulse rounded-2xl"
              style={{ background: "var(--neutral-200)" }}
            />
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <section
            className="rounded-2xl border p-6 text-center"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <p className="mb-4 text-sm" style={{ color: "var(--neutral-600)" }}>
              Couldn’t load your profile. Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={loadProfile}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background: "var(--accent)",
                color: "white",
              }}
            >
              <RefreshCw size={18} />
              Retry
            </button>
          </section>
        )}

        {/* Content */}
        {status === "success" && (
          <div className="space-y-8">
            {/* Demo mode banner */}
            {isDemoMode ? (
              <section
                className="rounded-2xl border px-4 py-4"
                style={{
                  background: "var(--accent-muted)",
                  borderColor: "var(--accent)",
                }}
              >
                <p className="mb-3 text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  You’re viewing the prototype in demo mode.
                </p>
                <p className="mb-4 text-sm" style={{ color: "var(--neutral-600)" }}>
                  Profile and businessfront are pre-filled to showcase the experience. Exit demo to use your own account.
                </p>
                <button
                  type="button"
                  onClick={handleExitDemo}
                  className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--accent)",
                    color: "var(--accent)",
                  }}
                >
                  <X size={18} />
                  Exit demo mode
                </button>
              </section>
            ) : (
              <section
                className="rounded-2xl border px-4 py-4"
                style={{
                  background: "var(--neutral-100)",
                  borderColor: "var(--border)",
                }}
              >
                <p className="mb-3 text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  Try the prototype
                </p>
                <p className="mb-4 text-sm" style={{ color: "var(--neutral-600)" }}>
                  See how it looks when a merchant has set up their business — welcome message, AI concierge, and businessfront.
                </p>
                <button
                  type="button"
                  onClick={handleEnterDemo}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--accent)" }}
                >
                  <Play size={18} />
                  Start demo mode
                </button>
              </section>
            )}

            {/* Current identity card */}
            <section
              className="overflow-hidden rounded-2xl border"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                boxShadow: "var(--vibe-card-shadow)",
              }}
            >
              <div className="flex items-center gap-4 p-5">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: isMerchant ? "var(--accent-muted)" : "var(--neutral-100)",
                    color: isMerchant ? "var(--accent)" : "var(--neutral-600)",
                    border: "2px solid var(--border)",
                  }}
                >
                  {isMerchant ? <Store size={32} /> : <User size={32} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-lg font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {isMerchant
                      ? currentBusiness?.businessName ?? "Merchant"
                      : profile?.displayName ?? "Guest"}
                  </p>
                  <span
                    className="inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      background: isMerchant ? "var(--accent-muted)" : "var(--neutral-200)",
                      color: isMerchant ? "var(--accent)" : "var(--neutral-600)",
                    }}
                  >
                    {isMerchant ? "Merchant account" : "Personal account"}
                  </span>
                </div>
              </div>
              {profile?.email && !isMerchant && (
                <p
                  className="border-t px-5 py-3 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--neutral-500)",
                  }}
                >
                  {profile.email}
                </p>
              )}
            </section>

            {/* Switch account */}
            <section aria-labelledby="switch-heading">
              <h2
                id="switch-heading"
                className="mb-1 text-sm font-semibold uppercase tracking-wide"
                style={{ color: "var(--neutral-500)" }}
              >
                Switch account
              </h2>
              <p className="mb-4 text-sm" style={{ color: "var(--neutral-500)" }}>
                Use a different account to shop or manage a business.
              </p>
              <div className="space-y-2">
                {isMerchant ? (
                  <button
                    type="button"
                    onClick={handleSwitchToUser}
                    className="flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <span className="flex items-center gap-3">
                      <User size={22} className="shrink-0" style={{ color: "var(--neutral-500)" }} />
                      <span className="font-medium">Personal account</span>
                    </span>
                    <ChevronRight size={20} style={{ color: "var(--neutral-400)" }} />
                  </button>
                ) : (
                  hasBusinesses &&
                  businesses.map((b) => (
                    <button
                      key={b.slug}
                      type="button"
                      onClick={() => handleSwitchToMerchant(b.slug, b.businessName)}
                      className="flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                    >
                      <span className="flex items-center gap-3">
                        <Store size={22} className="shrink-0" style={{ color: "var(--accent)" }} />
                        <span className="font-medium">{b.businessName}</span>
                      </span>
                      <ChevronRight size={20} style={{ color: "var(--neutral-400)" }} />
                    </button>
                  ))
                )}
                {!isMerchant && !hasBusinesses && (
                  <p className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "var(--border)", color: "var(--neutral-500)" }}>
                    Add your first business below to become a merchant.
                  </p>
                )}
              </div>
            </section>

            {/* Your businesses */}
            {hasBusinesses && (
              <section aria-labelledby="businesses-heading">
                <h2
                  id="businesses-heading"
                  className="mb-1 text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "var(--neutral-500)" }}
                >
                  Your businesses
                </h2>
                <p className="mb-4 text-sm" style={{ color: "var(--neutral-500)" }}>
                  {isMerchant
                    ? "Manage products, brand, and businessfront for each business."
                    : "Switch to merchant mode above to add or manage businesses."}
                </p>
                <ul className="space-y-2">
                  {businesses.map((b) => (
                    <li key={b.slug}>
                      {isMerchant ? (
                        <Link
                          href={`/merchant/${encodeURIComponent(b.slug)}`}
                          className="flex items-center justify-between rounded-xl border px-4 py-3.5 transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                          }}
                        >
                          <span className="flex items-center gap-3 font-medium">
                            <Store size={20} className="shrink-0" style={{ color: "var(--accent)" }} />
                            {b.businessName}
                          </span>
                          <ChevronRight size={20} style={{ color: "var(--neutral-400)" }} />
                        </Link>
                      ) : (
                        <div
                          className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
                          style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                          }}
                        >
                          <Store size={20} className="shrink-0" style={{ color: "var(--neutral-400)" }} />
                          <span className="font-medium">{b.businessName}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Add business — only in merchant mode, or when no businesses (first-time add) */}
            {(isMerchant || !hasBusinesses) && (
              <section aria-labelledby="add-business-heading">
              <h2
                id="add-business-heading"
                className="mb-1 text-sm font-semibold uppercase tracking-wide"
                style={{ color: "var(--neutral-500)" }}
              >
                {hasBusinesses ? "Add another business" : "Become a merchant"}
              </h2>
              <p className="mb-4 text-sm" style={{ color: "var(--neutral-500)" }}>
                {hasBusinesses
                  ? "Register another business to manage from your profile."
                  : "Add your business to manage products, services, set your brand, and get a businessfront link."}
              </p>
              <form onSubmit={handleAddBusiness} className="space-y-3">
                <label htmlFor="profile-business-name" className="sr-only">
                  Business name
                </label>
                <div className="flex gap-2">
                  <input
                    id="profile-business-name"
                    type="text"
                    value={addBusinessName}
                    onChange={(e) => {
                      setAddBusinessName(e.target.value);
                      setAddError(null);
                    }}
                    placeholder="e.g. My Business"
                    disabled={adding}
                    autoComplete="organization"
                    className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-base outline-none transition-colors placeholder:opacity-60 focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--accent)]/20 disabled:opacity-60"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={adding || !addBusinessName.trim()}
                    className="shrink-0 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                    style={{ background: "var(--accent)" }}
                  >
                    {adding ? "Adding…" : "Add"}
                  </button>
                </div>
                {addError && (
                  <p className="text-sm" style={{ color: "var(--accent)" }} role="alert">
                    {addError}
                  </p>
                )}
              </form>
            </section>
            )}

            {/* Settings */}
            <section>
              <Link
                href="/settings"
                className="flex items-center justify-between rounded-xl border px-4 py-3.5 transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <span className="flex items-center gap-3 font-medium">
                  <Settings size={22} className="shrink-0" style={{ color: "var(--neutral-500)" }} />
                  Account settings
                </span>
                <ChevronRight size={20} style={{ color: "var(--neutral-400)" }} />
              </Link>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
