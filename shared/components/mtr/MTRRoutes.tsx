"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/shared/context/locale-context";
import type { TranslationKey } from "@/shared/i18n/translations";
import styles from "./MTRRoutes.module.css";

// ── MTR line definitions ─────────────────────────────────────────
export interface MtrStation {
  code: string;
  name_zh: string;
  name_en: string;
}

export interface MtrLineDirection {
  label_zh: string;
  label_en: string;
}

export interface MtrLine {
  code: string;
  name_zh: string;
  name_en: string;
  color: string;
  textColor: string;
  stations: MtrStation[];
  /** API "DOWN" direction terminus label (toward urban/first listed terminus) */
  directionDown: MtrLineDirection;
  /** API "UP" direction terminus label (toward outlying/last listed terminus) */
  directionUp: MtrLineDirection;
}

export const MTR_LINES: MtrLine[] = [
  {
    code: "TCL",
    name_zh: "東涌線",
    name_en: "Tung Chung Line",
    color: "#F7943E",
    textColor: "#fff",
    directionDown: { label_zh: "往香港", label_en: "Towards HK" },
    directionUp: { label_zh: "往東涌", label_en: "Towards TC" },
    stations: [
      { code: "HOK", name_zh: "香港", name_en: "Hong Kong" },
      { code: "KOW", name_zh: "九龍", name_en: "Kowloon" },
      { code: "OLY", name_zh: "奧運", name_en: "Olympic" },
      { code: "NAC", name_zh: "南昌", name_en: "Nam Cheong" },
      { code: "LAK", name_zh: "荔景", name_en: "Lai King" },
      { code: "TSY", name_zh: "青衣", name_en: "Tsing Yi" },
      { code: "SUN", name_zh: "欣澳", name_en: "Sunny Bay" },
      { code: "TUC", name_zh: "東涌", name_en: "Tung Chung" },
    ],
  },
  {
    code: "AEL",
    name_zh: "機場快綫",
    name_en: "Airport Express",
    color: "#00888A",
    textColor: "#fff",
    directionDown: { label_zh: "往香港", label_en: "Towards HK" },
    directionUp: { label_zh: "往博覽館", label_en: "Towards AsiaWorld-Expo" },
    stations: [
      { code: "HOK", name_zh: "香港", name_en: "Hong Kong" },
      { code: "KOW", name_zh: "九龍", name_en: "Kowloon" },
      { code: "TSY", name_zh: "青衣", name_en: "Tsing Yi" },
      { code: "AIR", name_zh: "機場", name_en: "Airport" },
      { code: "AWE", name_zh: "博覽館", name_en: "AsiaWorld-Expo" },
    ],
  },
  {
    code: "TML",
    name_zh: "屯馬線",
    name_en: "Tuen Ma Line",
    color: "#9C2E00",
    textColor: "#fff",
    directionDown: { label_zh: "往八鄉", label_en: "Towards Pat Heung" },
    directionUp: { label_zh: "往烏溪沙", label_en: "Towards Wu Kai Sha" },
    stations: [
      { code: "WKS", name_zh: "烏溪沙", name_en: "Wu Kai Sha" },
      { code: "MOS", name_zh: "馬鞍山", name_en: "Ma On Shan" },
      { code: "HEO", name_zh: "恆安", name_en: "Heng On" },
      { code: "TSH", name_zh: "大水坑", name_en: "Tai Shui Hang" },
      { code: "SHM", name_zh: "石門", name_en: "Shek Mun" },
      { code: "CIO", name_zh: "城門河", name_en: "City One" },
      { code: "STW", name_zh: "沙田圍", name_en: "Sha Tin Wai" },
      { code: "CKT", name_zh: "車公廟", name_en: "Che Kung Temple" },
      { code: "TAW", name_zh: "大圍", name_en: "Tai Wai" },
      { code: "HIK", name_zh: "顯徑", name_en: "Hin Keng" },
      { code: "DIH", name_zh: "鑽石山", name_en: "Diamond Hill" },
      { code: "KAT", name_zh: "啟德", name_en: "Kai Tak" },
      { code: "SUW", name_zh: "宋皇臺", name_en: "To Kwa Wan" },
      { code: "TKW", name_zh: "土瓜灣", name_en: "Kok Keung" },
      { code: "HOM", name_zh: "何文田", name_en: "Ho Man Tin" },
      { code: "HUH", name_zh: "紅磡", name_en: "Hung Hom" },
      { code: "ETS", name_zh: "尖東", name_en: "East Tsim Sha Tsui" },
      { code: "AUS", name_zh: "柯士甸", name_en: "Austin" },
      { code: "NAC", name_zh: "南昌", name_en: "Nam Cheong" },
      { code: "MEF", name_zh: "美孚", name_en: "Mei Foo" },
      { code: "TWW", name_zh: "荃灣西", name_en: "Tsuen Wan West" },
      { code: "TIS", name_zh: "天水圍", name_en: "Tin Shui Wai" },
      { code: "LOP", name_zh: "朗屏", name_en: "Long Ping" },
      { code: "YUL", name_zh: "元朗", name_en: "Yuen Long" },
      { code: "KSR", name_zh: "錦上路", name_en: "Kam Sheung Road" },
      { code: "PAT", name_zh: "八鄉", name_en: "Pat Heung" },
    ],
  },
  {
    code: "TWL",
    name_zh: "荃灣線",
    name_en: "Tsuen Wan Line",
    color: "#E2231A",
    textColor: "#fff",
    directionDown: { label_zh: "往中環", label_en: "Towards Central" },
    directionUp: { label_zh: "往荃灣", label_en: "Towards Tsuen Wan" },
    stations: [
      { code: "CEN", name_zh: "中環", name_en: "Central" },
      { code: "ADM", name_zh: "金鐘", name_en: "Admiralty" },
      { code: "TST", name_zh: "尖沙咀", name_en: "Tsim Sha Tsui" },
      { code: "JOR", name_zh: "佐敦", name_en: "Jordan" },
      { code: "YMT", name_zh: "油麻地", name_en: "Yau Ma Tei" },
      { code: "MOK", name_zh: "旺角", name_en: "Mong Kok" },
      { code: "PRE", name_zh: "太子", name_en: "Prince Edward" },
      { code: "SSP", name_zh: "深水埗", name_en: "Sham Shui Po" },
      { code: "CSW", name_zh: "長沙灣", name_en: "Cheung Sha Wan" },
      { code: "LCK", name_zh: "荔枝角", name_en: "Lai Chi Kok" },
      { code: "MEF", name_zh: "美孚", name_en: "Mei Foo" },
      { code: "LAK", name_zh: "荔景", name_en: "Lai King" },
      { code: "KWH", name_zh: "葵興", name_en: "Kwai Hing" },
      { code: "KWF", name_zh: "葵芳", name_en: "Kwai Fong" },
      { code: "TSW", name_zh: "荃灣", name_en: "Tsuen Wan" },
    ],
  },
  {
    code: "KTL",
    name_zh: "觀塘線",
    name_en: "Kwun Tong Line",
    color: "#00A040",
    textColor: "#fff",
    directionDown: { label_zh: "往黃埔", label_en: "Towards Whampoa" },
    directionUp: { label_zh: "往調景嶺", label_en: "Towards Tiu Keng Leng" },
    stations: [
      { code: "WHA", name_zh: "黃埔", name_en: "Whampoa" },
      { code: "HOM", name_zh: "何文田", name_en: "Ho Man Tin" },
      { code: "YMT", name_zh: "油麻地", name_en: "Yau Ma Tei" },
      { code: "MOK", name_zh: "旺角東", name_en: "Mong Kok East" },
      { code: "PRE", name_zh: "太子", name_en: "Prince Edward" },
      { code: "SKM", name_zh: "石硤尾", name_en: "Shek Kip Mei" },
      { code: "KOT", name_zh: "九龍塘", name_en: "Kowloon Tong" },
      { code: "LOF", name_zh: "樂富", name_en: "Lok Fu" },
      { code: "WTS", name_zh: "黃大仙", name_en: "Wong Tai Sin" },
      { code: "DIH", name_zh: "鑽石山", name_en: "Diamond Hill" },
      { code: "CHH", name_zh: "彩虹", name_en: "Choi Hung" },
      { code: "KOB", name_zh: "九龍灣", name_en: "Kowloon Bay" },
      { code: "NTK", name_zh: "牛頭角", name_en: "Ngau Tau Kok" },
      { code: "KWT", name_zh: "觀塘", name_en: "Kwun Tong" },
      { code: "LAT", name_zh: "藍田", name_en: "Lam Tin" },
      { code: "TIK", name_zh: "調景嶺", name_en: "Tiu Keng Leng" },
    ],
  },
  {
    code: "ISL",
    name_zh: "港島線",
    name_en: "Island Line",
    color: "#007DC5",
    textColor: "#fff",
    directionDown: { label_zh: "往堅尼地城", label_en: "Towards Kennedy Town" },
    directionUp: { label_zh: "往柴灣", label_en: "Towards Chai Wan" },
    stations: [
      { code: "KET", name_zh: "堅尼地城", name_en: "Kennedy Town" },
      { code: "HKU", name_zh: "香港大學", name_en: "HKU" },
      { code: "SYP", name_zh: "西營盤", name_en: "Sai Ying Pun" },
      { code: "SHW", name_zh: "上環", name_en: "Sheung Wan" },
      { code: "CEN", name_zh: "中環", name_en: "Central" },
      { code: "ADM", name_zh: "金鐘", name_en: "Admiralty" },
      { code: "WAC", name_zh: "灣仔", name_en: "Wan Chai" },
      { code: "CAB", name_zh: "銅鑼灣", name_en: "Causeway Bay" },
      { code: "TIH", name_zh: "天后", name_en: "Tin Hau" },
      { code: "FOH", name_zh: "炮台山", name_en: "Fortress Hill" },
      { code: "NOP", name_zh: "北角", name_en: "North Point" },
      { code: "QUB", name_zh: "鰂魚涌", name_en: "Quarry Bay" },
      { code: "TAK", name_zh: "太古", name_en: "Tai Koo" },
      { code: "SWH", name_zh: "西灣河", name_en: "Sai Wan Ho" },
      { code: "SKW", name_zh: "筲箕灣", name_en: "Shau Kei Wan" },
      { code: "HFC", name_zh: "杏花邨", name_en: "Heng Fa Chuen" },
      { code: "CHW", name_zh: "柴灣", name_en: "Chai Wan" },
    ],
  },
  {
    code: "TKL",
    name_zh: "將軍澳線",
    name_en: "Tseung Kwan O Line",
    color: "#7D499D",
    textColor: "#fff",
    directionDown: { label_zh: "往北角", label_en: "Towards North Point" },
    directionUp: { label_zh: "往寶琳/康城", label_en: "Towards Po Lam/LOHAS Park" },
    stations: [
      { code: "NOP", name_zh: "北角", name_en: "North Point" },
      { code: "QUB", name_zh: "鰂魚涌", name_en: "Quarry Bay" },
      { code: "YAT", name_zh: "油塘", name_en: "Yau Tong" },
      { code: "TIK", name_zh: "調景嶺", name_en: "Tiu Keng Leng" },
      { code: "TKO", name_zh: "將軍澳", name_en: "Tseung Kwan O" },
      { code: "LHP", name_zh: "康城", name_en: "LOHAS Park" },
      { code: "POA", name_zh: "寶琳", name_en: "Po Lam" },
      { code: "HAH", name_zh: "坑口", name_en: "Hang Hau" },
    ],
  },
  {
    code: "EAL",
    name_zh: "東鐵線",
    name_en: "East Rail Line",
    color: "#53B7E8",
    textColor: "#fff",
    directionDown: { label_zh: "往金鐘", label_en: "Towards Admiralty" },
    directionUp: { label_zh: "往羅湖/落馬洲", label_en: "Towards Lo Wu/Lok Ma Chau" },
    stations: [
      { code: "ADM", name_zh: "金鐘", name_en: "Admiralty" },
      { code: "EXC", name_zh: "會展", name_en: "Exhibition Centre" },
      { code: "HUH", name_zh: "紅磡", name_en: "Hung Hom" },
      { code: "MKK", name_zh: "旺角東", name_en: "Mong Kok East" },
      { code: "KOT", name_zh: "九龍塘", name_en: "Kowloon Tong" },
      { code: "TAW", name_zh: "大圍", name_en: "Tai Wai" },
      { code: "SHT", name_zh: "沙田", name_en: "Sha Tin" },
      { code: "FOT", name_zh: "火炭", name_en: "Fo Tan" },
      { code: "UNI", name_zh: "大學", name_en: "University" },
      { code: "TAP", name_zh: "大埔墟", name_en: "Tai Po Market" },
      { code: "TWO", name_zh: "太和", name_en: "Tai Wo" },
      { code: "FAN", name_zh: "粉嶺", name_en: "Fanling" },
      { code: "SHS", name_zh: "上水", name_en: "Sheung Shui" },
      { code: "LOW", name_zh: "羅湖", name_en: "Lo Wu" },
      { code: "LMC", name_zh: "落馬洲", name_en: "Lok Ma Chau" },
    ],
  },
  {
    code: "SIL",
    name_zh: "南港島線",
    name_en: "South Island Line",
    color: "#BAD53F",
    textColor: "#333",
    directionDown: { label_zh: "往金鐘", label_en: "Towards Admiralty" },
    directionUp: { label_zh: "往海怡半島", label_en: "Towards South Horizons" },
    stations: [
      { code: "ADM", name_zh: "金鐘", name_en: "Admiralty" },
      { code: "OCP", name_zh: "海洋公園", name_en: "Ocean Park" },
      { code: "WCH", name_zh: "黃竹坑", name_en: "Wong Chuk Hang" },
      { code: "LET", name_zh: "利東", name_en: "Lei Tung" },
      { code: "SOK", name_zh: "海怡半島", name_en: "South Horizons" },
    ],
  },
  {
    code: "DRL",
    name_zh: "迪士尼線",
    name_en: "Disneyland Resort Line",
    color: "#F589B2",
    textColor: "#fff",
    directionDown: { label_zh: "往欣澳", label_en: "Towards Sunny Bay" },
    directionUp: { label_zh: "往迪士尼", label_en: "Towards Disneyland" },
    stations: [
      { code: "SUN", name_zh: "欣澳", name_en: "Sunny Bay" },
      { code: "DIS", name_zh: "迪士尼", name_en: "Disneyland Resort" },
    ],
  },
];

// ── ETA types ─────────────────────────────────────────────────────
interface TrainEta {
  ttnt: number;
  plat: string;
  source?: string;
}

interface StationData {
  UP?: TrainEta[];
  DOWN?: TrainEta[];
}

// ── Sub-components ────────────────────────────────────────────────

// Line selector card
const LineCard: React.FC<{
  line: MtrLine;
  selected: boolean;
  onClick: () => void;
  locale: string;
}> = ({ line, selected, onClick, locale }) => (
  <motion.button
    className={`${styles.lineCard} ${selected ? styles.lineCardSelected : ""}`}
    onClick={onClick}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.96 }}
    layout
    style={
      {
        "--line-color": line.color,
        "--line-text": line.textColor,
      } as React.CSSProperties
    }
  >
    {!selected && <span className={styles.lineCode}>{line.code}</span>}
    <span
      className={`${styles.lineName}`}
      style={
        selected
          ? {
              fontSize: "2vh",
            }
          : {}
      }
    >
      {locale === "zh-HK" ? line.name_zh : line.name_en}
    </span>
    {/* Glow overlay: NOT using layoutId so it stays contained within
        overflow:hidden; was causing the selected card to visually cover
        adjacent cards during Framer Motion shared-layout animation. */}
    <AnimatePresence>
      {selected && (
        <motion.div
          key="glow"
          className={styles.lineCardGlow}
          style={{ background: line.color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </AnimatePresence>
  </motion.button>
);

// ETA row
const EtaRow: React.FC<{
  eta: TrainEta;
  size?: "lg" | "sm";
  t: (key: TranslationKey) => string;
}> = ({ eta, size = "sm", t }) => {
  const mins = eta.ttnt;
  const isNow = mins === 0;
  const isSoon = mins > 0 && mins <= 3;

  return (
    <div className={`${styles.etaRow} ${size === "lg" ? styles.etaRowLg : ""}`}>
      <span
        className={`${styles.etaMins} ${isNow ? styles.etaNow : isSoon ? styles.etaSoon : ""}`}
      >
        {isNow ? t("mtr.arriving") : `${mins}${t("mtr.minSuffix")}`}
      </span>
      <span className={styles.etaPlat}>
        {t("mtr.platShort")} {eta.plat}
      </span>
    </div>
  );
};

// Station ETA card
const StationEtaCard: React.FC<{
  station: MtrStation;
  data: StationData | null;
  lineCode: string;
  lineColor: string;
  locale: string;
  t: (key: TranslationKey) => string;
  directionDown: MtrLineDirection;
  directionUp: MtrLineDirection;
  selected: boolean;
  onSelect: () => void;
}> = ({ station, data, lineCode, lineColor, locale, t, directionDown, directionUp, selected, onSelect }) => {
  const stationKey = `${lineCode}-${station.code}`;
  const stationData = data?.[stationKey as keyof typeof data] as any;
  const down: TrainEta[] = stationData?.DOWN ?? [];
  const up: TrainEta[] = stationData?.UP ?? [];
  const hasData = down.length > 0 || up.length > 0;

  return (
    <motion.div
      className={`${styles.stationCard} ${selected ? styles.stationCardSelected : ""}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
      style={
        selected
          ? ({ "--line-color": lineColor } as React.CSSProperties)
          : undefined
      }
    >
      {/* Station header */}
      <button className={styles.stationHeader} onClick={onSelect}>
        <div className={styles.stationBadge} style={{ background: lineColor }}>
          <span className={styles.stationCode}>{station.code}</span>
        </div>
        <div className={styles.stationInfo}>
          <span className={styles.stationName}>
            {locale === "zh-HK" ? station.name_zh : station.name_en}
          </span>
          <span className={styles.lineTag}>{lineCode}</span>
        </div>
        <motion.span
          className={styles.chevron}
          animate={{ rotate: selected ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          ▾
        </motion.span>
      </button>

      {/* ETA detail */}
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            key="eta-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className={styles.etaDetail}
          >
            {!hasData ? (
              <p className={styles.noService}>
                {t("mtr.noService")}
              </p>
            ) : (
              <div className={styles.etaColumns}>
                {down.length > 0 && (
                  <div className={styles.etaCol}>
                    <span className={styles.dirLabel}>
                      {locale === "zh-HK" ? directionDown.label_zh : directionDown.label_en}
                    </span>
                    {down.slice(0, 3).map((e, i) => (
                      <EtaRow
                        key={i}
                        eta={e}
                        t={t}
                        size={i === 0 ? "lg" : "sm"}
                      />
                    ))}
                  </div>
                )}
                {up.length > 0 && (
                  <div className={styles.etaCol}>
                    <span className={styles.dirLabel}>
                      {locale === "zh-HK" ? directionUp.label_zh : directionUp.label_en}
                    </span>
                    {up.slice(0, 3).map((e, i) => (
                      <EtaRow
                        key={i}
                        eta={e}
                        t={t}
                        size={i === 0 ? "lg" : "sm"}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────
const MTRRoutes: React.FC = () => {
  const { locale, t } = useLocale();
  const [selectedLine, setSelectedLine] = useState<MtrLine | null>(
    MTR_LINES[0],
  );
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [etaData, setEtaData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const fetchEta = useCallback(async (line: MtrLine) => {
    setLoading(true);
    try {
      const stationCodes = line.stations.map((s) => s.code).join(",");
      const res = await fetch(
        `/api/mtr-schedule?line=${line.code}&stations=${stationCodes}`,
      );
      if (!res.ok) return;
      const json = await res.json();
      // Build a map: stationCode → data object
      const map: Record<string, any> = {};
      (json.stations ?? []).forEach((s: any) => {
        map[s.station] = s.data;
      });
      setEtaData(map);
    } catch (err) {
      console.error("MTR ETA fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch ETA whenever selected line changes
  useEffect(() => {
    if (!selectedLine) return;
    setEtaData({});
    setSelectedStation(null);
    fetchEta(selectedLine);
    const interval = setInterval(() => fetchEta(selectedLine), 30000);
    return () => clearInterval(interval);
  }, [selectedLine, fetchEta]);

  const handleLineSelect = (line: MtrLine) => {
    setSelectedLine((prev) => (prev?.code === line.code ? null : line));
  };

  const handleStationSelect = (code: string) => {
    setSelectedStation((prev) => (prev === code ? null : code));
  };

  // Build station ETA data for selected line, keyed by stationCode
  const getStationData = (stationCode: string): StationData | null => {
    const raw = etaData[stationCode];
    if (!raw || !selectedLine) return null;
    return raw[`${selectedLine.code}-${stationCode}`] ? raw : raw;
  };

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div
        className="display-5 mb-2"
        style={{
          fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
        }}
      >
        {t("mtr.title")}
      </div>

      {/* Line selector */}
      <div className={styles.lineGrid}>
        {MTR_LINES.map((line) => (
          <LineCard
            key={line.code}
            line={line}
            selected={selectedLine?.code === line.code}
            onClick={() => handleLineSelect(line)}
            locale={locale}
          />
        ))}
      </div>

      {/* Station list for selected line */}
      <AnimatePresence mode="wait">
        {selectedLine && (
          <motion.div
            key={selectedLine.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className={styles.stationSection}
          >
            {/* Section heading */}
            <div className={styles.sectionHeading}>
              <span
                className={styles.linePill}
                style={{ background: selectedLine.color }}
              >
                {selectedLine.code}
              </span>
              <span className={styles.sectionTitle}>
                {locale === "zh-HK"
                  ? selectedLine.name_zh
                  : selectedLine.name_en}
              </span>
              {loading && <span className={styles.loadingDot} />}
            </div>

            {/* Station cards */}
            <div className={styles.stationList}>
              {selectedLine.stations.map((station) => {
                const raw = etaData[station.code];
                return (
                  <StationEtaCard
                    key={station.code}
                    station={station}
                    data={raw ?? null}
                    lineCode={selectedLine.code}
                    lineColor={selectedLine.color}
                    locale={locale}
                    t={t}
                    directionDown={selectedLine.directionDown}
                    directionUp={selectedLine.directionUp}
                    selected={selectedStation === station.code}
                    onSelect={() => handleStationSelect(station.code)}
                  />
                );
              })}
            </div>

            <p className={styles.serviceHours}>
              {t("mtr.operatingHours")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MTRRoutes;
