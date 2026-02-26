"use client";

import Link from "next/link";
import { PanelRightClose, PanelRightOpen, Store, User } from "lucide-react";
import type { MountedBusiness } from "./dual-pane-workspace";
import { SAMPLE_BUSINESSES } from "./dual-pane-workspace";
import { useAccountMode } from "@/contexts/account-mode";

type Props = {
  businesses: MountedBusiness[];
  onBusinessToggle: (businessId: string) => void;
  onMountBusiness?: (businessName: string) => void;
  vibeScrollOpen?: boolean;
  onVibeScrollToggle?: () => void;
  exploreMode?: boolean;
  onExploreModeToggle?: () => void;
};

export function MountingStatusIndicator({ businesses, onBusinessToggle, onMountBusiness, vibeScrollOpen, onVibeScrollToggle, exploreMode, onExploreModeToggle }: Props) {
  const mountedIds = new Set(businesses.map((s) => s.id));
  const unmountedSamples = SAMPLE_BUSINESSES.filter((name) => !mountedIds.has(name.toLowerCase()));
  const { currentBusiness, isMerchant } = useAccountMode();

  return (
    <div
      className="flex w-full min-w-0 shrink-0 flex-col gap-2 border-b px-4 py-3"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        paddingRight: exploreMode ? "1.25rem" : undefined,
      }}
    >
      <div className="flex items-center gap-2">
        {/* Left: link to profile page */}
        <Link
          href="/profile"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
          style={{
            background: isMerchant ? "var(--accent-muted)" : "var(--neutral-100)",
            color: isMerchant ? "var(--accent)" : "var(--neutral-600)",
            border: "1px solid var(--border)",
          }}
          title={isMerchant ? "Merchant account" : "Profile"}
        >
          {isMerchant ? <Store size={18} /> : <User size={18} />}
        </Link>
        {/* Center: Vant (and current business when merchant) */}
        <span
          className="flex-1 text-center text-lg font-semibold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          {isMerchant && currentBusiness ? (
            <>
              Vant <span className="font-normal opacity-80">· {currentBusiness.businessName}</span>
            </>
          ) : (
            "Vant"
          )}
        </span>
        {/* Right: vibe scroll toggle */}
        <div className="flex min-w-0 shrink-0 items-center">
          {onVibeScrollToggle && (
            <button
              onClick={onVibeScrollToggle}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:opacity-80"
              style={{
                background: vibeScrollOpen ? "var(--accent-muted)" : "var(--neutral-100)",
                color: vibeScrollOpen ? "var(--accent)" : "var(--neutral-500)",
                border: "1px solid var(--border)",
              }}
              title={vibeScrollOpen ? "Close Vibe Scroll" : "Open Vibe Scroll"}
            >
              {vibeScrollOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            </button>
          )}
        </div>
      </div>
      <div
        className="grid min-h-[28px] w-full overflow-hidden"
        style={{ gridTemplateColumns: "auto 64px 1fr", gap: 0 }}
      >
        {/* Explore */}
        <div className="flex items-center">
          {onExploreModeToggle ? (
            <button
              type="button"
              role="switch"
              aria-checked={exploreMode}
              onClick={onExploreModeToggle}
              className="flex shrink-0 items-center gap-2.5"
              title={exploreMode ? "Explore on" : "Explore off"}
            >
              <span className="text-xs font-medium leading-none" style={{ color: "var(--neutral-600)" }}>
                Explore
              </span>
              <span
                className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors items-center"
                style={{
                  background: exploreMode ? "var(--accent)" : "var(--neutral-200)",
                }}
              >
                <span
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow transition-[left] duration-200"
                  style={{
                    left: exploreMode ? "1.125rem" : "0.125rem",
                  }}
                />
              </span>
            </button>
          ) : null}
        </div>
        {/* 64px spacer */}
        <div />
        {/* Current mount: fit-content so no empty space; list scrolls when many businesses */}
        <div className="flex min-w-0 items-center justify-end gap-1.5 overflow-hidden">
          <span className="shrink-0 text-xs" style={{ color: "var(--neutral-500)" }}>
            Current mount:
          </span>
          <div
            className="current-mount-scroll overflow-x-auto overflow-y-hidden py-0.5"
            style={{ width: "fit-content", maxWidth: "100%" }}
          >
            <div className="flex w-max flex-nowrap items-center justify-end gap-1.5">
              {businesses.length > 0 ? (
                businesses.map((business) => (
                  <span
                    key={business.id}
                    className="shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      background: "var(--neutral-100)",
                    }}
                  >
                    {business.name
                      .replace(/-/g, " ")
                      .split(" ")
                      .filter(Boolean)
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                      .join(" ")}
                  </span>
                ))
              ) : (
                <span className="shrink-0 text-xs" style={{ color: "var(--neutral-400)" }}>—</span>
              )}
            </div>
          </div>
        </div>
      </div>
      {onMountBusiness && unmountedSamples.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 min-h-[28px] sm:justify-end">
          <span className="text-xs" style={{ color: "var(--neutral-500)" }}>
            Recent mount:
          </span>
          {unmountedSamples.map((name) => (
            <button
              key={name}
              onClick={() => onMountBusiness(name)}
              className="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
                background: "var(--neutral-100)",
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
