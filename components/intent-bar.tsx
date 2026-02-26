"use client";

import { useState, useRef } from "react";
import { Image, Send } from "lucide-react";
import { mountFromLink } from "@/lib/mount";

function isLink(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

type Props = {
  onPull: () => void;
  onMessage: (msg: string) => void;
  onMount: (businessName: string) => void;
  canMountFromLink?: boolean;
};

export function IntentBar({ onPull, onMessage, onMount, canMountFromLink = true }: Props) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"text" | "image">("text");
  const [mounting, setMounting] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const asLink = isLink(trimmed);
    if (asLink) {
      if (!canMountFromLink) {
        setMountError("Enable Explore mode to mount other businesses");
        return;
      }
      setMounting(true);
      setMountError(null);
      try {
        const { businessName } = await mountFromLink(trimmed);
        onMount(businessName);
        onMessage(trimmed);
        setInput("");
      } catch (err) {
        setMountError(err instanceof Error ? err.message : "Mount failed");
      } finally {
        setMounting(false);
      }
      return;
    }

    onMessage(trimmed);
    setInput("");
    setMountError(null);
  };

  const handleImageDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) {
      onMessage(`[Image: ${file.name}]`);
      setMode("text");
    }
    e.target.value = "";
  };

  return (
    <div
      className="flex shrink-0 justify-center px-4 py-4 max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] max-lg:pt-4"
      style={{
        background: "var(--intent-bar-bg)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-2xl items-end gap-2 rounded-2xl border p-3"
        style={{
          background: "var(--surface)",
          borderColor: "var(--intent-bar-border)",
          boxShadow: "0 2px 12px rgba(28, 25, 22, 0.06)",
        }}
      >
        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageDrop} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
          style={{
            background: mode === "image" ? "var(--accent-muted)" : "transparent",
            color: mode === "image" ? "var(--accent)" : "var(--neutral-400)",
          }}
          title="Add image"
        >
          <Image size={18} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setMountError(null);
          }}
          placeholder="Describe what you're looking for or paste a link…"
          className="flex-1 min-w-0 h-10 bg-transparent px-3 text-base outline-none placeholder:opacity-60"
          style={{ color: "var(--foreground)" }}
        />
        <button
          type="submit"
          disabled={mounting}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--accent)", color: "white" }}
        >
          <Send size={18} />
        </button>
      </form>
      {mountError && (
        <p className="mt-2 text-center text-sm" style={{ color: "var(--accent)" }}>
          {mountError}
        </p>
      )}
    </div>
  );
}
