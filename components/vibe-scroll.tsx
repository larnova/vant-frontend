"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { VibeScrollCard } from "./vibe-scroll-card";
import type { MountedStore } from "./dual-pane-workspace";

type ProductHandle = {
  id: string;
  handle: string;
  store: string;
  thumbnail?: string;
};

type Props = {
  onClose: () => void;
  mountedStores: MountedStore[];
};

const MOCK_PRODUCTS: ProductHandle[] = [
  { id: "1", handle: "nike-air-max-90", store: "Nike" },
  { id: "2", handle: "cos-oversized-blazer", store: "COS" },
  { id: "3", handle: "nike-dunk-low", store: "Nike" },
  { id: "4", handle: "cos-minimal-blazer", store: "COS" },
  { id: "5", handle: "aesop-resurrection-aromatique-hand-wash", store: "Aesop" },
  { id: "6", handle: "aesop-geranium-leaf-body-cleanser", store: "Aesop" },
  { id: "7", handle: "aesop-tacit-eau-de-parfum", store: "Aesop" },
];

export function VibeScroll({ onClose, mountedStores }: Props) {
  const activeStoreNames = useMemo(
    () => new Set(mountedStores.filter((s) => s.active).map((s) => s.name)),
    [mountedStores]
  );

  const products = useMemo(
    () => MOCK_PRODUCTS.filter((p) => activeStoreNames.has(p.store)),
    [activeStoreNames]
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [vaultIds, setVaultIds] = useState<Set<string>>(new Set());

  const handleLike = (id: string) => {
    setVaultIds((prev) => new Set([...prev, id]));
  };

  const handleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="flex h-full min-w-0 flex-1 flex-col border-l"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-medium" style={{ color: "var(--foreground)" }}>Vibe Scroll</h2>
        <button
          onClick={onClose}
          className="rounded-full p-2 transition-opacity hover:opacity-70"
          style={{ color: "var(--neutral-500)" }}
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {products.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: "var(--neutral-500)" }}>
            Mount a store to see products
          </p>
        ) : (
          products.map((product) => (
            <VibeScrollCard
              key={product.id}
              product={product}
              isExpanded={expandedId === product.id}
              isLiked={vaultIds.has(product.id)}
              onLike={() => handleLike(product.id)}
              onExpand={() => handleExpand(product.id)}
              onDragToChat={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
}
