"use client";

import { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import { VibeScrollCard } from "./vibe-scroll-card";
import { fetchProductsFromApi, type ProductHandle } from "@/lib/products";
import { getBaseUrl } from "@/lib/config";
import { getProfileProductsAndServices } from "@/lib/profile-products";
import type { MountedBusiness } from "./dual-pane-workspace";

type Props = {
  onClose: () => void;
  mountedBusinesses: MountedBusiness[];
};

const MOCK_PRODUCTS: ProductHandle[] = [
  { id: "1", handle: "nike-air-max-90", business: "Nike" },
  { id: "2", handle: "cos-oversized-blazer", business: "COS" },
  { id: "3", handle: "nike-dunk-low", business: "Nike" },
  { id: "4", handle: "cos-minimal-blazer", business: "COS" },
  { id: "5", handle: "aesop-resurrection-aromatique-hand-wash", business: "Aesop" },
  { id: "6", handle: "aesop-geranium-leaf-body-cleanser", business: "Aesop" },
  { id: "7", handle: "aesop-tacit-eau-de-parfum", business: "Aesop" },
];

export function VibeScroll({ onClose, mountedBusinesses }: Props) {
  const activeBusinessNames = useMemo(
    () => new Set(mountedBusinesses.filter((s) => s.active).map((s) => s.name)),
    [mountedBusinesses]
  );
  const activeList = useMemo(() => [...activeBusinessNames], [activeBusinessNames]);

  const [apiProducts, setApiProducts] = useState<ProductHandle[] | null>(null);
  const isExternalApi =
    typeof window !== "undefined" && getBaseUrl() !== window.location.origin;

  useEffect(() => {
    if (!isExternalApi || activeList.length === 0) {
      setApiProducts(null);
      return;
    }
    let cancelled = false;
    fetchProductsFromApi(activeList).then((data) => {
      if (!cancelled) setApiProducts(data);
    });
    return () => {
      cancelled = true;
    };
  }, [isExternalApi, activeList.join(",")]);

  const products = useMemo(() => {
    const fromApiOrMock =
      isExternalApi && apiProducts
        ? apiProducts
        : MOCK_PRODUCTS.filter((p) => activeBusinessNames.has(p.business));

    const activeBusinesses = mountedBusinesses.filter((b) => b.active);
    const fromProfile: ProductHandle[] = [];
    for (const biz of activeBusinesses) {
      const items = getProfileProductsAndServices(biz.id);
      for (const item of items) {
        fromProfile.push({
          id: item.id,
          handle: item.name,
          business: biz.name,
          thumbnail: item.imageUrl,
        });
      }
    }

    return [...fromApiOrMock, ...fromProfile];
  }, [isExternalApi, apiProducts, activeBusinessNames, mountedBusinesses]);
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
            Mount a business to see products
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
