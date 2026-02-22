"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MountingStatusIndicator } from "./mounting-status-indicator";
import { IntentBar } from "./intent-bar";
import { VibeScroll } from "./vibe-scroll";

export type MountedStore = {
  id: string;
  name: string;
  favicon: string;
  active: boolean;
};

export const SAMPLE_STORES = ["Nike", "COS", "Aesop"] as const;

function toMountedStore(businessName: string): MountedStore {
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
  const [mountedStores, setMountedStores] = useState<MountedStore[]>([]);
  const [showVibeScroll, setShowVibeScroll] = useState(false);
  const [exploreMode, setExploreMode] = useState(false);

  const isOnMountUrl = Boolean(pathname?.match(/^\/mount\/[^/]+/));
  const canMountOtherStores = !isOnMountUrl || exploreMode;

  // Sync from URL: baseURL/mount/businessName
  useEffect(() => {
    const match = pathname?.match(/^\/mount\/([^/]+)/);
    if (match) {
      const businessName = decodeURIComponent(match[1]);
      const store = toMountedStore(businessName);
      setMountedStores((prev) =>
        prev.some((s) => s.id === store.id) ? prev : [...prev, store]
      );
    }
  }, [pathname]);

  // When Explore is disabled on /mount/storename, keep only the URL store
  useEffect(() => {
    if (!exploreMode && isOnMountUrl) {
      const match = pathname?.match(/^\/mount\/([^/]+)/);
      if (match) {
        const urlStoreId = decodeURIComponent(match[1]).toLowerCase().replace(/\s+/g, "-");
        setMountedStores((prev) => prev.filter((s) => s.id === urlStoreId));
      }
    }
  }, [exploreMode, isOnMountUrl, pathname]);

  const [chatMessages, setChatMessages] = useState<string[]>([]);

  const handleStoreToggle = (storeId: string) => {
    setMountedStores((prev) =>
      prev.map((s) =>
        s.id === storeId ? { ...s, active: !s.active } : s
      )
    );
  };

  const handlePull = () => {
    setShowVibeScroll(true);
  };

  const handleMessage = (msg: string) => {
    setChatMessages((m) => [...m, msg]);
    if (chatMessages.length === 0) handlePull();
  };

  const handleMount = (businessName: string) => {
    const store = toMountedStore(businessName);
    setMountedStores((prev) =>
      prev.some((s) => s.id === store.id) ? prev : [...prev, store]
    );
  };

  return (
    <div
      className="grid h-dvh w-full overflow-hidden bg-[var(--background)] max-lg:grid-cols-1 lg:grid-cols-[1fr_auto]"
    >
      {/* Column 1: Chat Stream (Intent Bar stays in this column only) */}
      <div
        className="flex min-w-0 flex-col overflow-hidden transition-[border-color] duration-300"
        style={showVibeScroll ? { borderRight: "1px solid var(--border)" } : undefined}
      >
        <MountingStatusIndicator
          stores={mountedStores}
          onStoreToggle={handleStoreToggle}
          onMountStore={canMountOtherStores ? handleMount : undefined}
          vibeScrollOpen={showVibeScroll}
          onVibeScrollToggle={() => setShowVibeScroll((prev) => !prev)}
          exploreMode={exploreMode}
          onExploreModeToggle={() => setExploreMode((prev) => !prev)}
        />
        <div className="flex-1 overflow-hidden px-4 pb-4 pt-6" style={{ background: "var(--chat-bg)" }}>
          <div className="mx-auto max-w-2xl space-y-6">
            {chatMessages.length === 0 && (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 py-12">
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
              </div>
            )}
          </div>
        </div>
        <IntentBar
          onPull={handlePull}
          onMessage={handleMessage}
          onMount={handleMount}
          canMountFromLink={canMountOtherStores}
        />
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
            mountedStores={mountedStores}
            onClose={() => setShowVibeScroll(false)}
          />
        </aside>
      </div>
    </div>
  );
}
