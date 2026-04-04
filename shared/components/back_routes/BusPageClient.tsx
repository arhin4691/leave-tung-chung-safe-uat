/**
 * BusPageClient — revamped go_back bus page client component.
 *
 * Receives all KMB/CTB/NLB routes pre-fetched by the server page and
 * renders them with:
 *   1. Company filter chips (All / KMB / CTB / NLB)
 *   2. Instant route-number search
 *   3. Route cards with lazy-loaded stop lists + real-time ETA
 *
 * API docs used:
 *   - kmb_eta_api_specification  → KMB route/stop/ETA endpoints
 *   - ctb_bus_eta_api_specifications → CTB route/stop/ETA endpoints
 *   - nlb_bus_eta_api             → NLB route/stop/ETA endpoints
 */
"use client";

import React, {
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import CompanyFilterChips, { CompanyFilter } from "./components/CompanyFilterChips";
import RouteCard from "./components/RouteCard";
import RouteKeyboard from "@/shared/components/ui/RouteKeyboard";
import type { BusRouteEntry, KmbRoute, CtbRoute, NlbRoute } from "@/shared/types";
import { useLocale } from "@/shared/context/locale-context";

interface BusPageClientProps {
  kmbData: KmbRoute[];
  ctbData: CtbRoute[];
  nlbData: NlbRoute[];
}

// ── Helpers to derive a flat, normalised BusRouteEntry list ───────

function kmbToEntries(routes: KmbRoute[]): BusRouteEntry[] {
  return routes.map((r) => ({
    route: r.route,
    company: "KMB",
    dir: r.bound === "O" || r.bound === "1" ? "O" : "I",
    orig_tc: r.orig_tc,
    dest_tc: r.dest_tc,
    orig_en: r.orig_en,
    dest_en: r.dest_en,
    serviceType: r.service_type?.toString() ?? "1",
  }));
}

function ctbToEntries(routes: CtbRoute[]): BusRouteEntry[] {
  // CTB routes don't always carry bound. Deduplicate by route (both dirs).
  const seen = new Set<string>();
  const entries: BusRouteEntry[] = [];
  for (const r of routes) {
    // Outbound (orig → dest)
    const keyO = `${r.route}|O`;
    if (!seen.has(keyO)) {
      seen.add(keyO);
      entries.push({
        route: r.route,
        company: "CTB",
        dir: "O",
        orig_tc: r.orig_tc,
        dest_tc: r.dest_tc,
        orig_en: r.orig_en,
        dest_en: r.dest_en,
      });
    }
    // Inbound (dest → orig)
    const keyI = `${r.route}|I`;
    if (!seen.has(keyI)) {
      seen.add(keyI);
      entries.push({
        route: r.route,
        company: "CTB",
        dir: "I",
        orig_tc: r.dest_tc,
        dest_tc: r.orig_tc,
        orig_en: r.dest_en,
        dest_en: r.orig_en,
      });
    }
  }
  return entries;
}

function nlbToEntries(routes: NlbRoute[]): BusRouteEntry[] {
  return routes.map((r) => ({
    route: r.routeNo,
    company: "NLB",
    dir: "O" as const,
    orig_tc: r.routeName_c,
    dest_tc: r.routeName_c,
    orig_en: r.routeName_e,
    dest_en: r.routeName_e,
    routeId: r.routeId,
  }));
}

// MTR Bus routes (static — per MTR_BUS_API_Spec_v1.13 / MTR_BUS_DataDictionary_v1.19)
const MTR_BUS_ROUTE_NAMES = [
  "506",
  "K12", "K14", "K17", "K18",
  "K51", "K51A",
  "K52", "K52A", "K52LR", "K52P",
  "K53", "K53S",
  "K54", "K54A",
  "K58",
  "K65", "K65A",
  "K66",
  "K68", "K68S",
  "K73", "K74",
  "K75A", "K75P", "K75S",
  "K76", "K76S",
] as const;

function mtrBusToEntries(): BusRouteEntry[] {
  return MTR_BUS_ROUTE_NAMES.map((routeName) => ({
    route: routeName,
    company: "MTRBUS" as const,
    dir: "O" as const,
    orig_tc: "港鐵巴士",
    dest_tc: routeName,
    orig_en: "MTR Bus",
    dest_en: routeName,
  }));
}

// ── Search filter: prefix match on route number, name, or terminus ─

function matchesSearch(entry: BusRouteEntry, q: string): boolean {
  if (!q) return true;
  const up = q.toUpperCase();
  return (
    entry.route.toUpperCase().startsWith(up) ||
    entry.dest_tc.includes(up) ||
    entry.dest_en.toUpperCase().includes(up) ||
    entry.orig_tc.includes(up)
  );
}

// ── Component ─────────────────────────────────────────────────────

const INITIAL_SHOW = 30;
const LOAD_MORE_STEP = 30;

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ClearIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const BusPageClient: React.FC<BusPageClientProps> = ({
  kmbData,
  ctbData,
  nlbData,
}) => {
  const { t } = useLocale();
  const [company, setCompany] = useState<CompanyFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const deferred = useDeferredValue(keyword);
  const [shown, setShown] = useState(INITIAL_SHOW);
  const loaderRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /**
   * Mobile detection — runs only after hydration so SSR output is consistent.
   * `pointer: coarse` = touch screen.  UA fallback for older devices.
   * When true → use custom keyboard bottom sheet.
   * When false → use normal <input> + physical keyboard (desktop).
   */
  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const uaTouch = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(coarse || uaTouch);
  }, []);

  // Normalise all routes once
  const allRoutes = useMemo<BusRouteEntry[]>(
    () => [
      ...kmbToEntries(kmbData),
      ...ctbToEntries(ctbData),
      ...nlbToEntries(nlbData),
      ...mtrBusToEntries(),
    ],
    [kmbData, ctbData, nlbData],
  );

  /**
   * Deduplicated route numbers for the current company filter.
   * Fed into RouteKeyboard to build the prediction trie.
   */
  const companyFilteredRouteNumbers = useMemo(
    () => [
      ...new Set(
        allRoutes
          .filter((e) => company === "ALL" || e.company === company)
          .map((e) => e.route),
      ),
    ],
    [allRoutes, company],
  );

  // Filtered list
  const filtered = useMemo(() => {
    return allRoutes
      .filter((e) => company === "ALL" || e.company === company)
      .filter((e) => matchesSearch(e, deferred));
  }, [allRoutes, company, deferred]);

  // Reset pagination on filter change
  useEffect(() => {
    setShown(INITIAL_SHOW);
  }, [company, deferred]);

  // Infinite scroll via IntersectionObserver
  const loadMore = useCallback(() => {
    setShown((prev) => Math.min(prev + LOAD_MORE_STEP, filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const visible = filtered.slice(0, shown);
  const hasMore = shown < filtered.length;

  return (
    <div style={{ padding: "12px 12px 110px" }}>
      {/* ── Page heading ──────────────────────────────────── */}
      <div style={{ marginBottom: "14px" }}>
        <h1
          style={{
            // fontSize: "20px",
            fontWeight: 800,
            color: "rgba(255,255,255,0.93)",
            letterSpacing: "-0.01em",
          }}
        className="display-5 mb-2"
        >
          巴士路線
        </h1>
        <p
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.38)",
            margin: "3px 0 0",
          }}
        >
          {filtered.length} 條路線
        </p>
      </div>

      {/* ── Company filter chips ──────────────────────────── */}
      <CompanyFilterChips value={company} onChange={setCompany} />

      {/* ── Search field ────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          background: isKeyboardOpen && isMobile
            ? "rgba(10,132,255,0.12)"
            : "rgba(255,255,255,0.07)",
          border: `1px solid ${isKeyboardOpen && isMobile ? "rgba(10,132,255,0.5)" : "rgba(255,255,255,0.13)"}`,
          borderRadius: "12px",
          padding: "0 12px",
          margin: "10px 0 14px",
          gap: "8px",
          cursor: isMobile ? "pointer" : undefined,
          transition: "background 0.2s, border-color 0.2s",
        }}
        onClick={isMobile ? () => setKeyboardOpen(true) : undefined}
      >
        <SearchIcon />
        <input
          ref={searchInputRef}
          type="text"
          value={keyword}
          /* Mobile: inputMode=none + readOnly prevents the native OS keyboard
             from opening. The custom bottom sheet handles all input instead.  */
          inputMode={isMobile ? "none" : "text"}
          readOnly={isMobile}
          onChange={isMobile ? undefined : (e) => setKeyword(e.target.value)}
          onFocus={isMobile ? () => setKeyboardOpen(true) : undefined}
          placeholder={t("common.enterRoute") ?? "輸入路線號碼…"}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontSize: "16px", /* ≥16px prevents iOS/Android auto-zoom on focus */
            padding: "12px 0",
            fontFamily: "inherit",
            cursor: isMobile ? "pointer" : undefined,
          }}
        />
        <AnimatePresence>
          {keyword && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={(e) => { e.stopPropagation(); setKeyword(""); }}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "none",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.6)",
                flexShrink: 0,
                padding: 0,
              }}
            >
              <ClearIcon />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Custom bottom-sheet keyboard (mobile only) ────────── */}
      {isMobile && (
        <RouteKeyboard
          isOpen={isKeyboardOpen}
          onClose={() => setKeyboardOpen(false)}
          value={keyword}
          onChange={setKeyword}
          routes={companyFilteredRouteNumbers}
        />
      )}

      {/* ── Empty state ──────────────────────────────────── */}
      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🚌</div>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>找不到路線</div>
          <div style={{ fontSize: "12px", marginTop: "6px" }}>
            試試其他關鍵字或更改篩選條件
          </div>
        </div>
      )}

      {/* ── Route cards ──────────────────────────────────── */}
      {/* desktop-grid class switches to 2-column grid on wide screens  */}
      <div className="bus-route-grid">
        <AnimatePresence initial={false}>
          {visible.map((entry, i) => (
            <motion.div
              key={`${entry.company}-${entry.routeId ?? ""}-${entry.route}-${entry.dir}`}
              initial={{ opacity: 1, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 8) * 0.03 }}
            >
              <RouteCard entry={entry} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Load-more sentinel ───────────────────────────── */}
      {hasMore && (
        <div ref={loaderRef} style={{ padding: "16px", textAlign: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
            載入更多路線…
          </span>
        </div>
      )}
    </div>
  );
};

export default BusPageClient;
