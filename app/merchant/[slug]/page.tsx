"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Check,
  ExternalLink,
  Package,
  Palette,
  Plus,
  Save,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { getMountUrl } from "@/lib/config";
import {
  getBrandForMerchant,
  updateBrandForMerchant,
} from "@/lib/merchant-brand";
import type { BrandInfo } from "@/lib/brand";
import {
  getProfileProductsAndServices,
  addProfileProductOrService,
  removeProfileProductOrService,
  type ProfileProductOrService,
  type ProductOrServiceType,
} from "@/lib/profile-products";
import { slugToDisplayName } from "@/lib/merchant-utils";

type MerchantTab = "brand" | "products";

function ItemRow({
  item,
  onRemove,
}: {
  item: ProfileProductOrService;
  onRemove: () => void;
}) {
  return (
    <li
      className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {item.imageUrl ? (
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--neutral-100)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "var(--neutral-100)", color: "var(--neutral-400)" }}
        >
          {item.type === "product" ? (
            <Package size={20} />
          ) : (
            <Wrench size={20} />
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {item.type === "product" ? (
            <Package size={16} style={{ color: "var(--accent)" }} />
          ) : (
            <Wrench size={16} style={{ color: "var(--accent)" }} />
          )}
          <span className="font-medium" style={{ color: "var(--foreground)" }}>
            {item.name}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              background: "var(--neutral-200)",
              color: "var(--neutral-600)",
            }}
          >
            {item.type}
          </span>
        </div>
        {item.description && (
          <p className="mt-0.5 truncate text-xs" style={{ color: "var(--neutral-500)" }}>
            {item.description}
          </p>
        )}
        {item.price && (
          <p className="mt-0.5 text-xs font-medium" style={{ color: "var(--neutral-600)" }}>
            {item.price}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-full p-2 transition-opacity hover:opacity-80"
        style={{ color: "var(--neutral-500)" }}
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 size={18} />
      </button>
    </li>
  );
}

export default function MerchantBusinessPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const businessName = slugToDisplayName(slug);
  const mountUrl = getMountUrl(businessName);

  const [activeTab, setActiveTab] = useState<MerchantTab>("brand");

  const [brand, setBrand] = useState<BrandInfo | null>(null);
  const [brandLoading, setBrandLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [ethos, setEthos] = useState("");
  const [initialConciergeMessage, setInitialConciergeMessage] = useState("");

  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemType, setItemType] = useState<ProductOrServiceType>("product");
  const [itemPrice, setItemPrice] = useState("");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);
  const [itemsRefresh, setItemsRefresh] = useState(0);

  const profileItems = slug ? getProfileProductsAndServices(slug) : [];

  const loadBrand = useCallback(async () => {
    if (!slug) return;
    setBrandLoading(true);
    try {
      const data = await getBrandForMerchant(businessName);
      setBrand(data ?? null);
      setWelcomeMessage(data?.welcomeMessage ?? "");
      setEthos(data?.ethos ?? "");
      setInitialConciergeMessage(data?.initialConciergeMessage ?? "");
    } finally {
      setBrandLoading(false);
    }
  }, [slug, businessName]);

  useEffect(() => {
    loadBrand();
  }, [loadBrand]);

  useEffect(() => {
    if (!saveSuccess) return;
    const t = setTimeout(() => setSaveSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [saveSuccess]);

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await updateBrandForMerchant(businessName, {
        welcomeMessage: welcomeMessage.trim() || undefined,
        ethos: ethos.trim() || undefined,
        initialConciergeMessage: initialConciergeMessage.trim() || undefined,
      });
      setSaveSuccess(true);
      setBrand({
        welcomeMessage: welcomeMessage.trim() || undefined,
        ethos: ethos.trim() || undefined,
        initialConciergeMessage: initialConciergeMessage.trim() || undefined,
      });
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not save. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const name = itemName.trim();
    const imageUrl = itemImageUrl.trim();
    const description = itemDescription.trim();
    const price = itemPrice.trim();
    if (!name || addingItem || !slug) return;
    if (!imageUrl) {
      setImageError("Please add a photo for the vibe scroll.");
      return;
    }
    if (!description) {
      setItemError("Please add a description.");
      return;
    }
    if (!price) {
      setItemError("Please add a price.");
      return;
    }
    setAddingItem(true);
    setItemError(null);
    setImageError(null);
    try {
      addProfileProductOrService(slug, {
        name,
        description,
        type: itemType,
        price,
        imageUrl,
      });
      setItemName("");
      setItemDescription("");
      setItemPrice("");
      setItemImageUrl("");
      setShowImageUrlInput(false);
      setItemsRefresh((r) => r + 1);
    } catch (err) {
      setItemError(
        err instanceof Error ? err.message : "Could not add. Try again."
      );
    } finally {
      setAddingItem(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    if (!slug) return;
    removeProfileProductOrService(slug, id);
    setItemsRefresh((r) => r + 1);
  };

  return (
    <div
      className="h-dvh overflow-y-auto overflow-x-hidden"
      style={{ background: "var(--background)" }}
    >
      <header
        className="sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Link
          href="/profile"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
          style={{ background: "var(--neutral-100)", color: "var(--foreground)" }}
          aria-label="Back to profile"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1
          className="flex-1 truncate text-lg font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          {businessName || "Business"}
        </h1>
      </header>

      <main className="mx-auto max-w-xl px-4 pt-6" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
        <a
          href={mountUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 flex items-center justify-between rounded-xl border px-4 py-3.5 transition-opacity hover:opacity-90"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <span className="flex items-center gap-2 font-medium">
            <ExternalLink size={20} style={{ color: "var(--accent)" }} />
            View your businessfront
          </span>
        </a>

        {/* Tab bar — state-driven, profile-style */}
        <div
          className="mb-6 flex rounded-xl border p-1"
          style={{
            background: "var(--neutral-100)",
            borderColor: "var(--border)",
          }}
          role="tablist"
          aria-label="Business sections"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "brand"}
            onClick={() => setActiveTab("brand")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors"
            style={{
              background: activeTab === "brand" ? "var(--surface)" : "transparent",
              color: activeTab === "brand" ? "var(--foreground)" : "var(--neutral-600)",
              boxShadow: activeTab === "brand" ? "var(--vibe-card-shadow)" : "none",
            }}
          >
            <Palette size={18} />
            Brand & businessfront
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "products"}
            onClick={() => setActiveTab("products")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors"
            style={{
              background: activeTab === "products" ? "var(--surface)" : "transparent",
              color: activeTab === "products" ? "var(--foreground)" : "var(--neutral-600)",
              boxShadow: activeTab === "products" ? "var(--vibe-card-shadow)" : "none",
            }}
          >
            <Package size={18} />
            Products & services
          </button>
        </div>

        {activeTab === "brand" && (
          <section
            className="rounded-2xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "var(--vibe-card-shadow)",
            }}
          >
            <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
              <Palette size={20} style={{ color: "var(--accent)" }} />
              <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                Brand & businessfront
              </h2>
            </div>
            <p className="px-4 pt-2 pb-4 text-sm" style={{ color: "var(--neutral-500)" }}>
              Set the welcome message and AI concierge intro customers see when they open your link.
            </p>
            <p className="px-4 pb-4 text-xs" style={{ color: "var(--neutral-500)" }}>
              <strong>Note:</strong> This information is used as a guide. Each time a customer mounts your business, the AI agent may rework or regenerate the tone and wording—so what they see can vary from visit to visit.
            </p>
            {brandLoading ? (
              <div className="h-48 animate-pulse px-4 pb-4" style={{ background: "var(--neutral-50)" }} />
            ) : (
              <form onSubmit={handleSaveBrand} className="space-y-4 px-4 pb-6">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    Welcome message
                  </span>
                  <input
                    type="text"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="e.g. Welcome to our business — we're glad you're here."
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none placeholder:opacity-60 focus:ring-2 focus:ring-[var(--accent)]/20"
                    style={{
                      background: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    Brand ethos (optional)
                  </span>
                  <input
                    type="text"
                    value={ethos}
                    onChange={(e) => setEthos(e.target.value)}
                    placeholder="e.g. Quality and simplicity."
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none placeholder:opacity-60 focus:ring-2 focus:ring-[var(--accent)]/20"
                    style={{
                      background: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    AI concierge intro
                  </span>
                  <textarea
                    value={initialConciergeMessage}
                    onChange={(e) => setInitialConciergeMessage(e.target.value)}
                    placeholder="e.g. Hi! I'm here to help you find exactly what you're looking for. Tell me your style or what occasion you're shopping for."
                    rows={3}
                    className="w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none placeholder:opacity-60 focus:ring-2 focus:ring-[var(--accent)]/20"
                    style={{
                      background: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <p className="mt-1 text-xs" style={{ color: "var(--neutral-500)" }}>
                    This appears as the first message from your business's concierge.
                  </p>
                </label>
                {saveError && (
                  <p className="text-sm" style={{ color: "var(--accent)" }} role="alert">
                    {saveError}
                  </p>
                )}
                {saveSuccess && (
                  <p className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--accent)" }}>
                    <Check size={18} />
                    Brand saved. View your businessfront to see changes.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ background: "var(--accent)" }}
                >
                  <Save size={18} />
                  {saving ? "Saving…" : "Save brand"}
                </button>
              </form>
            )}
          </section>
        )}

        {activeTab === "products" && (
          <section
            className="rounded-2xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "var(--vibe-card-shadow)",
            }}
          >
            <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
              <Package size={20} style={{ color: "var(--accent)" }} />
              <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                Products & services
              </h2>
            </div>
            <p className="px-4 pt-2 pb-4 text-sm" style={{ color: "var(--neutral-500)" }}>
              Add products and services for this business. They’ll appear on your businessfront.
            </p>
            <div className="space-y-4 px-4 pb-6">
              <form onSubmit={handleAddItem} className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setItemType("product")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors"
                    style={{
                      background: itemType === "product" ? "var(--accent-muted)" : "var(--neutral-100)",
                      borderColor: itemType === "product" ? "var(--accent)" : "var(--border)",
                      color: itemType === "product" ? "var(--accent)" : "var(--neutral-600)",
                    }}
                  >
                    <Package size={18} />
                    Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemType("service")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors"
                    style={{
                      background: itemType === "service" ? "var(--accent-muted)" : "var(--neutral-100)",
                      borderColor: itemType === "service" ? "var(--accent)" : "var(--border)",
                      color: itemType === "service" ? "var(--accent)" : "var(--neutral-600)",
                    }}
                  >
                    <Wrench size={18} />
                    Service
                  </button>
                </div>
                {/* Image — required, prominent UX */}
                <div className="block">
                  <span className="mb-2 block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    Photo <span style={{ color: "var(--accent)" }}>*</span>
                  </span>
                  <p className="mb-2 text-xs" style={{ color: "var(--neutral-500)" }}>
                    Shown in vibe scroll. Upload or paste an image URL.
                  </p>
                  {!itemImageUrl ? (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        aria-hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setItemImageUrl(reader.result as string);
                              setImageError(null);
                            };
                            reader.readAsDataURL(file);
                          }
                          e.target.value = "";
                        }}
                      />
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.setAttribute("data-dragging", "true");
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.removeAttribute("data-dragging");
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.removeAttribute("data-dragging");
                          const file = e.dataTransfer.files?.[0];
                          if (file?.type.startsWith("image/")) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setItemImageUrl(reader.result as string);
                              setImageError(null);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setImageError("Please drop an image file (e.g. JPG, PNG).");
                          }
                        }}
                        className="flex aspect-[3/4] max-h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] data-[dragging=true]:border-[var(--accent)] data-[dragging=true]:bg-[var(--accent-muted)]"
                        style={{
                          borderColor: imageError ? "var(--accent)" : "var(--border)",
                          background: "var(--neutral-50)",
                          color: "var(--neutral-500)",
                        }}
                      >
                        <Camera size={32} strokeWidth={1.5} />
                        <span className="text-sm font-medium">Tap to upload</span>
                        <span className="text-xs">or drag and drop</span>
                      </div>
                      {showImageUrlInput ? (
                        <div className="mt-2">
                          <label className="mb-1 block text-xs font-medium" style={{ color: "var(--neutral-600)" }}>
                            Image URL
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={itemImageUrl}
                              onChange={(e) => {
                                setItemImageUrl(e.target.value);
                                setImageError(null);
                              }}
                              placeholder="https://example.com/photo.jpg"
                              className="min-w-0 flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none placeholder:opacity-60 focus:ring-2 focus:ring-[var(--accent)]/20"
                              style={{
                                background: "var(--background)",
                                borderColor: "var(--border)",
                                color: "var(--foreground)",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setShowImageUrlInput(false);
                                setItemImageUrl("");
                              }}
                              className="shrink-0 rounded-xl border px-3 py-2.5 text-sm font-medium"
                              style={{
                                borderColor: "var(--border)",
                                color: "var(--neutral-600)",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowImageUrlInput(true)}
                          className="mt-2 text-xs font-medium underline"
                          style={{ color: "var(--accent)" }}
                        >
                          Or paste image URL
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="aspect-[3/4] max-h-48 w-full overflow-hidden rounded-xl border bg-[var(--neutral-100)]" style={{ borderColor: "var(--border)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={itemImageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium"
                          style={{
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                          }}
                        >
                          <Camera size={16} />
                          Change photo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setItemImageUrl("");
                            setImageError(null);
                          }}
                          className="flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-4 text-sm font-medium"
                          style={{
                            borderColor: "var(--border)",
                            color: "var(--neutral-600)",
                          }}
                        >
                          <X size={16} />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                  {imageError && (
                    <p className="mt-1.5 text-sm" style={{ color: "var(--accent)" }} role="alert">
                      {imageError}
                    </p>
                  )}
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--neutral-600)" }}>
                    Name <span style={{ color: "var(--accent)" }}>*</span>
                  </span>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => {
                      setItemName(e.target.value);
                      setItemError(null);
                    }}
                    placeholder={itemType === "product" ? "e.g. Blue running shoes" : "e.g. 1-hour consultation"}
                    required
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none placeholder:opacity-60 focus:ring-2 focus:ring-[var(--accent)]/20"
                    style={{
                      background: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--neutral-600)" }}>
                    Description <span style={{ color: "var(--accent)" }}>*</span>
                  </span>
                  <textarea
                    value={itemDescription}
                    onChange={(e) => {
                      setItemDescription(e.target.value);
                      setItemError(null);
                    }}
                    placeholder="Short description of the product or service"
                    rows={2}
                    required
                    className="w-full resize-y rounded-xl border px-4 py-2.5 text-sm outline-none placeholder:opacity-60 focus:ring-2 focus:ring-[var(--accent)]/20"
                    style={{
                      background: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: "var(--neutral-600)" }}>
                    Price <span style={{ color: "var(--accent)" }}>*</span>
                  </span>
                  <input
                    type="text"
                    value={itemPrice}
                    onChange={(e) => {
                      setItemPrice(e.target.value);
                      setItemError(null);
                    }}
                    placeholder="e.g. $29.00 or Free"
                    required
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none placeholder:opacity-60 focus:ring-2 focus:ring-[var(--accent)]/20"
                    style={{
                      background: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </label>
                {itemError && (
                  <p className="text-sm" style={{ color: "var(--accent)" }} role="alert">
                    {itemError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={addingItem || !itemName.trim() || !itemImageUrl.trim() || !itemDescription.trim() || !itemPrice.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ background: "var(--accent)" }}
                >
                  <Plus size={18} />
                  {addingItem ? "Adding…" : `Add ${itemType}`}
                </button>
              </form>

              {profileItems.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    Your items ({profileItems.length})
                  </h3>
                  <ul className="space-y-2">
                    {profileItems.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        onRemove={() => handleRemoveItem(item.id)}
                      />
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="rounded-xl border px-4 py-4 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--neutral-500)" }}>
                  No products or services yet. Add one above.
                </p>
              )}
            </div>
          </section>
        )}

        <p className="mt-6 text-center">
          <Link
            href="/merchant"
            className="text-sm font-medium"
            style={{ color: "var(--accent)" }}
          >
            ← Add another business
          </Link>
        </p>
      </main>
    </div>
  );
}
