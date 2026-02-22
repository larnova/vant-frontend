"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PanelRightClose, PanelRightOpen, Settings, User } from "lucide-react";
import type { MountedStore } from "./dual-pane-workspace";
import { SAMPLE_STORES } from "./dual-pane-workspace";

type Props = {
  stores: MountedStore[];
  onStoreToggle: (storeId: string) => void;
  onMountStore?: (businessName: string) => void;
  vibeScrollOpen?: boolean;
  onVibeScrollToggle?: () => void;
  exploreMode?: boolean;
  onExploreModeToggle?: () => void;
};

export function MountingStatusIndicator({ stores, onStoreToggle, onMountStore, vibeScrollOpen, onVibeScrollToggle, exploreMode, onExploreModeToggle }: Props) {
  const mountedIds = new Set(stores.map((s) => s.id));
  const unmountedSamples = SAMPLE_STORES.filter((name) => !mountedIds.has(name.toLowerCase()));
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

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
        {/* Left: user profile with dropdown */}
        <div className="relative shrink-0" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:opacity-80"
            style={{
              background: "var(--neutral-100)",
              color: "var(--neutral-600)",
              border: "1px solid var(--border)",
            }}
            title="Profile"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <User size={18} />
          </button>
          {profileOpen && (
            <div
              className="absolute left-0 top-full z-50 mt-1 min-w-[240px] rounded-lg border py-1 shadow-lg"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              {/* User info */}
              <div className="flex items-center gap-3 px-3 py-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: "var(--neutral-100)",
                    color: "var(--neutral-600)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <User size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    Guest
                  </p>
                  <p className="truncate text-xs" style={{ color: "var(--neutral-500)" }}>
                    guest@example.com
                  </p>
                </div>
              </div>
              <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
              {/* Account settings */}
              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--foreground)" }}
              >
                <Settings size={16} className="shrink-0" />
                Account settings
              </Link>
              <Link
                href="/merchant"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--accent)" }}
              >
                Become a Vant merchant
              </Link>
            </div>
          )}
        </div>
        {/* Center: Vant */}
        <span
          className="flex-1 text-center text-lg font-semibold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Vant
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
        {/* Current mount: fit-content so no empty space; list scrolls when many stores */}
        <div className="flex min-w-0 items-center justify-end gap-1.5 overflow-hidden">
          <span className="shrink-0 text-xs" style={{ color: "var(--neutral-500)" }}>
            Current mount:
          </span>
          <div
            className="current-mount-scroll overflow-x-auto overflow-y-hidden py-0.5"
            style={{ width: "fit-content", maxWidth: "100%" }}
          >
            <div className="flex w-max flex-nowrap items-center justify-end gap-1.5">
              {stores.length > 0 ? (
                stores.map((store) => (
                  <span
                    key={store.id}
                    className="shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      background: "var(--neutral-100)",
                    }}
                  >
                    {store.name.charAt(0).toUpperCase() + store.name.slice(1).toLowerCase()}
                  </span>
                ))
              ) : (
                <span className="shrink-0 text-xs" style={{ color: "var(--neutral-400)" }}>—</span>
              )}
            </div>
          </div>
        </div>
      </div>
      {onMountStore && unmountedSamples.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 min-h-[28px] sm:justify-end">
          <span className="text-xs" style={{ color: "var(--neutral-500)" }}>
            Recent mount:
          </span>
          {unmountedSamples.map((name) => (
            <button
              key={name}
              onClick={() => onMountStore(name)}
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
