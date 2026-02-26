"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

type ProductHandle = {
  id: string;
  handle: string;
  business: string;
  thumbnail?: string;
};

type Props = {
  product: ProductHandle;
  isExpanded: boolean;
  isLiked: boolean;
  onLike: () => void;
  onExpand: () => void;
  onDragToChat: () => void;
};

export function VibeScrollCard({ product, isExpanded, isLiked, onLike, onExpand, onDragToChat }: Props) {
  const [dragStart, setDragStart] = useState(false);

  const handleSwipeLike = () => {
    onLike();
  };

  const handleTapExpand = () => {
    onExpand();
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/product-handle", JSON.stringify(product));
    setDragStart(true);
  };

  const handleDragEnd = () => {
    setDragStart(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        background: "var(--vibe-card-bg)",
        borderColor: "var(--vibe-card-border)",
        boxShadow: "var(--vibe-card-shadow)",
        opacity: dragStart ? 0.8 : 1,
      }}
    >
      <div
        className="relative aspect-[3/4] flex items-center justify-center cursor-pointer touch-manipulation overflow-hidden"
        style={{ background: "var(--neutral-100)" }}
        onClick={handleTapExpand}
      >
        {product.thumbnail ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.thumbnail}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-center p-4">
            <span className="text-sm font-medium" style={{ color: "var(--neutral-500)" }}>
              {product.business}
            </span>
            <p className="text-lg mt-2" style={{ color: "var(--foreground)" }}>
              {product.handle}
            </p>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSwipeLike();
          }}
          className="absolute top-3 right-3 rounded-full p-2 transition-colors"
          style={{
            background: "var(--surface)",
            boxShadow: "var(--vibe-card-shadow)",
            color: isLiked ? "var(--accent)" : "var(--neutral-400)",
          }}
        >
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>
      {isExpanded && (
        <div
          className="h-64 flex items-center justify-center"
          style={{ background: "var(--neutral-200)" }}
        >
          <p className="text-sm" style={{ color: "var(--neutral-500)" }}>
            Full-height iframe for secure checkout
          </p>
        </div>
      )}
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-sm" style={{ color: "var(--foreground)" }}>{product.handle}</span>
        <button
          onMouseDown={(e) => e.preventDefault()}
          className="text-xs underline"
          style={{ color: "var(--accent)" }}
        >
          Drag to chat
        </button>
      </div>
    </div>
  );
}
