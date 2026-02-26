# Mounter UI Knowledge Base

To build an interface that feels like **Life-Changing** commerce and not just another shop, the UI must focus on **Conversation**, **Discovery**, and **Tactile Feedback**.

---

## 1. The Layout Philosophy: "The Dual-Pane Workspace"

The UI should never feel like a website; it should feel like a **collaborative workspace**.

| Pane | Purpose | Behavior |
|------|---------|----------|
| **Primary** (Left/Center) | **Chat Stream** — where the behavioral AI lives | Uses "Fluid Text" (appearing at human reading speed) to reduce anxiety |
| **Secondary** (Right/Overlay) | **Vibe Scroll** — product-handle-driven iframe | Invisible until a "Pull" is triggered by the AI |

---

## 2. Core UI Components

### A. The Intent Bar (The Input)

| Attribute | Spec |
|-----------|------|
| **Feature** | Multi-modal. It shouldn't just be a text box. |
| **Function** | Users can drop a link, an image (for "vibe" matching), or a voice note. |
| **Design** | Floating at the bottom center to prioritize thumb-reach on mobile. |

### B. The "Mounting" Status Indicator

| Attribute | Spec |
|-----------|------|
| **Feature** | A visual breadcrumb showing which businesses are currently "active" in the session. |
| **Visual** | Small, glowing brand favicons at the top of the chat. |
| **Behavior** | If the user says "Forget Nike for a second," the Nike icon dims. |

### C. The "Vibe Scroll" Cards (The Output)

| Attribute | Spec |
|-----------|------|
| **Feature** | The iframe container that uses the Product Handle. |
| **Interactions** | |
| **Swipe-to-Like** | Saves to the user's "Vault." |
| **Tap-to-Expand** | Opens the full-height iframe for secure checkout. |
| **Drag-to-Chat** | Allows the user to drag a product into the chat to ask a specific question (e.g., "Will this match the shoes I bought yesterday?") |

---

## 3. Style Guide (Design Tokens)

To appeal to **Authentic Brands** and high-end consumers, the UI must **avoid**:
- Tech-Blue (#007AFF, #0066CC)
- Corporate-Gray (cold neutrals)

**Preferred palette:**
- Warm neutrals: cream, warm gray, charcoal
- Accent: terracotta, amber, or deep olive
- Glow effects: warm amber glow for active states

Design tokens are defined in `app/globals.css` and support light/dark modes.

---

## 4. Component Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| `DualPaneWorkspace` | `components/dual-pane-workspace.tsx` | Main layout orchestrator |
| `MountingStatusIndicator` | `components/mounting-status-indicator.tsx` | Brand favicon breadcrumb |
| `IntentBar` | `components/intent-bar.tsx` | Multi-modal input bar |
| `VibeScroll` | `components/vibe-scroll.tsx` | Secondary pane container |
| `VibeScrollCard` | `components/vibe-scroll-card.tsx` | Product card with iframe + interactions |

---

## 5. Mount Flow

The mounting link comes from **outside** (e.g. Instagram); we mount to agents using tools. The **business name** after mount tells the agent which business to use.

| Step | Description |
|------|-------------|
| **1. External link** | User pastes a link (e.g. Instagram) into the Intent Bar |
| **2. Mount API** | `POST baseURL/mount` with `{ link }` → `{ businessName }` |
| **3. URL** | `baseURL/mount/{businessName}` — agent uses this to route queries |
| **4. Mounting Status** | Business favicons derive from mount responses (not hardcoded) |

**Config:** `NEXT_PUBLIC_BASE_URL` — when same as app origin, uses `/api/mount`; otherwise `{baseURL}/mount`.

---

## 6. Key Behaviors

- **Pull**: The AI triggers the Vibe Scroll to appear when it has product recommendations.
- **Fluid Text**: AI responses should animate in at ~human reading speed (~0.04s per chunk).
- **Thumb-reach**: Primary actions are placed bottom-center on mobile.
- **URL sync**: Visiting `baseURL/mount/{businessName}` pre-populates the Mounting Status.
