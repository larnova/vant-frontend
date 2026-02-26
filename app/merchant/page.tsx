"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Store } from "lucide-react";
import { addMerchantBusiness, fetchProfile, type UserProfile } from "@/lib/profile";

export default function MerchantPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchProfile().then((p) => {
      setProfile(p ?? null);
      setLoaded(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = businessName.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await addMerchantBusiness(name);
      setProfile(updated);
      setBusinessName("");
      router.push(`/merchant/${encodeURIComponent(updated.businesses.find((b) => b.businessName.toLowerCase() === name.toLowerCase())?.slug ?? name.toLowerCase().replace(/\s+/g, "-"))}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add business");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh overflow-y-auto overflow-x-hidden" style={{ background: "var(--background)" }}>
      <header
        className="sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-80"
          style={{ background: "var(--neutral-100)", color: "var(--foreground)" }}
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Add business
        </h1>
      </header>
      <main className="mx-auto max-w-xl px-4 py-8" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
        <p className="mb-6 text-sm" style={{ color: "var(--neutral-500)" }}>
          Add a business to your profile to manage products, brand, and your businessfront—like adding a business account on social media.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--foreground)" }}>
              Business name
            </span>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. My Business"
              className="w-full rounded-xl border px-4 py-3 text-base outline-none placeholder:opacity-60"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
          </label>
          {error && (
            <p className="text-sm" style={{ color: "var(--accent)" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !businessName.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            <Store size={18} />
            {loading ? "Adding…" : "Add business"}
          </button>
        </form>
        {loaded && profile?.businesses?.length ? (
          <div className="mt-10">
            <p className="mb-3 text-sm font-medium" style={{ color: "var(--neutral-500)" }}>
              Your businesses
            </p>
            <ul className="space-y-2">
              {profile.businesses.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/merchant/${encodeURIComponent(b.slug)}`}
                    className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-opacity hover:opacity-80"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <Store size={18} style={{ color: "var(--accent)" }} />
                    {b.businessName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </main>
    </div>
  );
}
