"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MountingStatusIndicator } from "./mounting-status-indicator";
import { IntentBar } from "./intent-bar";
import { VibeScroll } from "./vibe-scroll";
import { getBrandFromApi, type BrandInfo } from "@/lib/brand";

export type MountedBusiness = {
  id: string;
  name: string;
  favicon: string;
  active: boolean;
};

export const SAMPLE_BUSINESSES = ["Nike", "COS", "Aesop"] as const;

function toMountedBusiness(businessName: string): MountedBusiness {
  const id = businessName.toLowerCase().replace(/\s+/g, "-");
  return {
    id,
    name: businessName,
    favicon: `/favicons/${id}.svg`,
    active: true,
  };
}

export function DualPaneWorkspace() {
  const pathname = usePathname();
  const [mountedBusinesses, setMountedBusinesses] = useState<MountedBusiness[]>([]);
  const [showVibeScroll, setShowVibeScroll] = useState(false);
  const [exploreMode, setExploreMode] = useState(false);

  const isOnMountUrl = Boolean(pathname?.match(/^\/mount\/[^/]+/));
  const canMountOtherBusinesses = !isOnMountUrl || exploreMode;

  // Sync from URL: baseURL/mount/businessName
  useEffect(() => {
    const match = pathname?.match(/^\/mount\/([^/]+)/);
    if (match) {
      const businessName = decodeURIComponent(match[1]);
      const business = toMountedBusiness(businessName);
      setMountedBusinesses((prev) =>
        prev.some((s) => s.id === business.id) ? prev : [...prev, business]
      );
    }
  }, [pathname]);

  // When Explore is disabled on /mount/businessname, keep only the URL business
  useEffect(() => {
    if (!exploreMode && isOnMountUrl) {
      const match = pathname?.match(/^\/mount\/([^/]+)/);
      if (match) {
        const urlBusinessId = decodeURIComponent(match[1]).toLowerCase().replace(/\s+/g, "-");
        setMountedBusinesses((prev) => prev.filter((s) => s.id === urlBusinessId));
      }
    }
  }, [exploreMode, isOnMountUrl, pathname]);

  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);

  // When on a mount URL, fetch brand (welcome message, ethos, initial concierge message)
  useEffect(() => {
    const match = pathname?.match(/^\/mount\/([^/]+)/);
    if (match) {
      const businessName = decodeURIComponent(match[1]);
      getBrandFromApi(businessName).then(setBrandInfo);
    } else {
      setBrandInfo(null);
    }
  }, [pathname]);

  const handleBusinessToggle = (businessId: string) => {
    setMountedBusinesses((prev) =>
      prev.map((s) =>
        s.id === businessId ? { ...s, active: !s.active } : s
      )
    );
  };

  const handlePull = () => {
    setShowVibeScroll(true);
  };

  const handleMessage = (msg: string) => {
    setChatMessages((m) => [...m, msg]);
  };

  const handleMount = (businessName: string) => {
    const business = toMountedBusiness(businessName);
    setMountedBusinesses((prev) =>
      prev.some((s) => s.id === business.id) ? prev : [...prev, business]
    );
  };

  return (
    <div
      className="grid h-dvh min-h-dvh w-full overflow-hidden bg-[var(--background)] max-lg:grid-cols-1 lg:grid-cols-[1fr_auto]"
    >
      {/* Column 1: Chat Stream (Intent Bar stays in this column only) */}
      <div
        className="flex min-h-0 min-w-0 flex-col overflow-hidden transition-[border-color] duration-300"
        style={showVibeScroll ? { borderRight: "1px solid var(--border)" } : undefined}
      >
        <MountingStatusIndicator
          businesses={mountedBusinesses}
          onBusinessToggle={handleBusinessToggle}
          onMountBusiness={canMountOtherBusinesses ? handleMount : undefined}
          vibeScrollOpen={showVibeScroll}
          onVibeScrollToggle={() => setShowVibeScroll((prev) => !prev)}
          exploreMode={exploreMode}
          onExploreModeToggle={() => setExploreMode((prev) => !prev)}
        />
        <div className="flex-1 min-h-0 overflow-hidden px-4 pb-4 pt-6 max-lg:pb-24" style={{ background: "var(--chat-bg)" }}>
          <div className="mx-auto h-full max-w-2xl">
            {chatMessages.length === 0 ? (
              <div className="flex h-full min-h-0 flex-col items-center justify-center gap-8 py-12">
                {brandInfo?.welcomeMessage || brandInfo?.initialConciergeMessage ? (
                  <>
                    {brandInfo.welcomeMessage && (
                      <p
                        className="shrink-0 text-center text-lg font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {brandInfo.welcomeMessage}
                      </p>
                    )}
                    {brandInfo.initialConciergeMessage && (
                      <div
                        className="mx-auto max-w-xl rounded-2xl border px-5 py-4 text-left"
                        style={{
                          background: "var(--surface)",
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                        }}
                      >
                        <p className="text-sm font-medium opacity-80" style={{ color: "var(--neutral-500)" }}>
                          Your concierge
                        </p>
                        <p className="mt-2 leading-relaxed">
                          {brandInfo.initialConciergeMessage}
                        </p>
                      </div>
                    )}
                    <p className="text-center text-sm" style={{ color: "var(--neutral-400)" }}>
                      Share what you love or what you're looking for below.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[var(--neutral-400)] shrink-0 text-center">
                      Start shopping — share what you love or what you're looking for.
                    </p>
                    <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/shopper.png"
                        alt="Shoppers"
                        className="max-h-[50dvh] max-w-full rounded-xl object-contain"
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto py-4">
                {chatMessages.map((text, i) => (
                  <div
                    key={`${i}-${text.slice(0, 20)}`}
                    className="ml-auto max-w-[85%] rounded-2xl px-4 py-3"
                    style={{
                      background: "var(--accent-muted)",
                      color: "var(--foreground)",
                      borderBottomRightRadius: 4,
                    }}
                  >
                    <p className="text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Intent bar: fixed to viewport bottom on mobile (no gap below); in-flow on desktop */}
        <div className="shrink-0 max-lg:fixed max-lg:bottom-0 max-lg:left-0 max-lg:right-0 max-lg:z-40 lg:static">
          <IntentBar
            onPull={handlePull}
            onMessage={handleMessage}
            onMount={handleMount}
            canMountFromLink={canMountOtherBusinesses}
          />
        </div>
      </div>

      {/* Column 2: Vibe Scroll — full screen on mobile/tablet, sidebar on desktop; width transition for desktop animation */}
      <div
        className={`min-w-0 overflow-hidden max-lg:h-0 max-lg:min-h-0 transition-[width] duration-300 ease-out lg:h-dvh ${showVibeScroll ? "w-0 lg:w-[400px]" : "w-0"}`}
      >
        <aside
          className={`
            flex h-dvh min-w-0 flex-col overflow-hidden bg-[var(--surface)]
            transition-transform duration-300 ease-out
            max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:w-full
            ${showVibeScroll ? "max-lg:translate-x-0" : "max-lg:translate-x-full max-lg:pointer-events-none"}
            lg:static lg:z-auto lg:translate-x-0 lg:h-full lg:w-[400px] lg:min-w-[360px]
          `}
          aria-label="Vibe Scroll"
          aria-hidden={!showVibeScroll}
        >
          <VibeScroll
            mountedBusinesses={mountedBusinesses}
            onClose={() => setShowVibeScroll(false)}
          />
        </aside>
      </div>
    </div>
  );
}
