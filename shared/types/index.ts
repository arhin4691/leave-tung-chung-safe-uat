export interface BusRoute {
  busRoute: string;
  routeId: string;
  busStop: string;
  type: string;
  to: string[];
  spec: string[];
  routeStop: string[];
}

export interface KmbEtaEntry {
  co: string;
  route: string;
  dir: "I" | "O";
  service_type: number;
  seq: number;
  dest_tc: string;
  dest_en: string;
  eta_seq: number;
  eta: string | null;
  rmk_tc: string;
  rmk_en: string;
  data_timestamp: string;
}

export interface CtbEtaEntry {
  co: string;
  route: string;
  dir: "I" | "O";
  eta_seq: number;
  dest_tc: string;
  dest_en: string;
  eta: string | null;
  rmk_tc: string;
  rmk_en: string;
  data_timestamp: string;
}

export interface NlbEtaEntry {
  estimatedArrivalTime: string;
  routeVariantName: string;
}

export interface NlbStop {
  stopId: string;
  stopName_c: string;
  stopName_e: string;
  stopLatitude: string;
  stopLongitude: string;
  latitude?: string;
  longitude?: string;
}

export interface NlbRoute {
  routeId: string;
  routeNo: string;
  route: string;
  routeName_c: string;
  routeName_e: string;
  routeName_s: string;
  terminus: NlbStop[];
}

export interface KmbRoute {
  route: string;
  bound: string;
  service_type: string;
  orig_tc: string;
  dest_tc: string;
  orig_en: string;
  dest_en: string;
}

export interface CtbRoute {
  co: string;
  route: string;
  orig_tc: string;
  dest_tc: string;
  orig_en: string;
  dest_en: string;
  type?: string;
}

export interface YellowRoute {
  route_id: string;
  route_code: string;
  directions: YellowDirection[];
}

export interface YellowDirection {
  orig_tc: string;
  dest_tc: string;
  orig_en: string;
  dest_en: string;
}

// ── Bus page revamp types ───────────────────────────────────────

/** Normalised stop shape shared across KMB/CTB/NLB for the go_back revamp */
export interface NormalisedStop {
  /** Unique stop ID (KMB/CTB: alphanumeric string; NLB: numeric string) */
  id: string;
  name_tc: string;
  name_en: string;
  lat?: string;
  long?: string;
  /** Stop sequence (1-based) */
  seq: number;
}

/** Single ETA entry (normalised across all operators) */
export interface NormalisedEta {
  /** ISO 8601 arrival time string */
  eta: string | null;
  rmk_tc: string;
  rmk_en: string;
  dest_tc: string;
  dest_en: string;
}

/**
 * Normalised ETA item shared by all operators.
 * KMB/CTB/NLB use `eta` (ISO timestamp).
 * MTR Bus uses `etaSeconds` (delta seconds) + `etaText` (display string).
 */
export interface RouteEtaItem {
  /** ISO 8601 arrival timestamp — KMB / CTB / NLB */
  eta: string | null;
  /** Seconds from now — MTR Bus (arrivalTimeInSecond) */
  etaSeconds?: number | null;
  /** Arrival text — MTR Bus (arrivalTimeText) e.g. "3 minutes", "Arriving" */
  etaText?: string;
  rmk_tc: string;
  rmk_en: string;
  dest_tc: string;
  dest_en: string;
  /** Whether ETA is schedule-based (true) or real-time (false). MTR Bus only. */
  isScheduled?: boolean;
}

/** Snapshot passed from RouteCard to BusStopModal when a stop row is tapped */
export interface SelectedStopInfo {
  stopId: string;
  name_tc: string;
  name_en: string;
  lat?: string;
  long?: string;
  etas: RouteEtaItem[];
  company: "KMB" | "CTB" | "NLB" | "MTRBUS";
  route: string;
  dest_tc: string;
}

/** One route + direction tuple used across the revamped page */
export interface BusRouteEntry {
  /** Route number e.g. "E33", "A11", "K12" */
  route: string;
  /** "KMB" | "CTB" | "NLB" | "MTRBUS" */
  company: "KMB" | "CTB" | "NLB" | "MTRBUS";
  /** "O" outbound | "I" inbound (NLB/MTRBUS always "O") */
  dir: "O" | "I";
  orig_tc: string;
  dest_tc: string;
  orig_en: string;
  dest_en: string;
  /** KMB service type (default "1") */
  serviceType?: string;
  /** NLB routeId */
  routeId?: string;
}

/**
 * A favourite bus stop (from the new RouteCard system) persisted to
 * localStorage under the key "likedRouteStop".
 */
export interface FavRouteStop {
  stopId: string;
  name_tc: string;
  name_en: string;
  lat?: string;
  long?: string;
  company: "KMB" | "CTB" | "NLB" | "MTRBUS";
  route: string;
  dir: "O" | "I";
  dest_tc: string;
  serviceType?: string;
  routeId?: string;
}

export interface KmbStop {
  stop: string;
  name_tc: string;
  name_en: string;
  lat: string;
  long: string;
}

export interface CtbStop {
  stop: string;
  name_tc: string;
  name_en: string;
  lat: string;
  long: string;
}

export interface CarParkData {
  park_id: string;
  name_tc: string;
  name_en: string;
  displayAddress_tc: string;
  latitude: string;
  longitude: string;
  opening_status: "OPEN" | "CLOSED";
  carpark_photo: string;
  vehicle_type?: VehicleType[];
}

export interface VehicleType {
  type: string;
  service_category: ServiceCategory[];
}

export interface ServiceCategory {
  category: string;
  vacancy: number;
  vacancy_type: "A" | "B" | "C";
}

export interface UpdateContextType {
  update: () => void;
  updateBack: () => void;
  updateNlb: () => void;
}

/** Traffic news message returned by data.one.gov.hk XML feed (parsed by xml2js) */
export interface RoadStatusMessage {
  msgID?: string[];
  ChinShort?: string[];
  ChinText?: string[];
  EngShort?: string[];
  EngText?: string[];
  ReferenceDate?: string[];
}

/** KMB timetable route entry from KMB website */
export interface KmbTimetableRoute {
  Desc_CHI: string;
  Desc_ENG: string;
  From_weekday: string;
  To_weekday: string;
  From_saturday: string;
  To_saturday: string;
  From_holiday: string;
  To_holiday: string;
}

/** NLB stop returned from route.php?action=list */
export interface NlbRouteStop {
  stopId: string;
  stopName_c: string;
  stopName_e: string;
  latitude: string;
  longitude: string;
}

/** Yellow bus (Park Island / SHK) ETA entry */
export interface YellowEtaEntry {
  timestamp: string;
}

/** Yellow bus route-stop entry from 360-api */
export interface YellowStop {
  stop_id: string | number;
  name_tc: string;
  name_en: string;
}

/** Yellow bus ETA per stop-sequence */
export interface YellowStopEta {
  eta: YellowEtaEntry[];
}

/** ETA entry returned by KMB / CTB / NLB APIs */
export interface EtaEntry {
  eta?: string | null;
  estimatedArrivalTime?: string;
  dir?: string;
  route?: string;
  dest_tc?: string;
}

/** KMB stop-eta API response (data.etabus.gov.hk) */
export interface KmbStopEtaEntry {
  route: string;
  eta: string | null;
  dest_tc: string;
  dir: string;
  service_type: string;
}

/** CTB stop-eta API response (rt.data.gov.hk) */
export interface CtbStopEtaEntry {
  route: string | null;
  eta: string | null;
  dest_tc: string | null;
  dir: string | null;
}

/**
 * Polymorphic stop data stored in BackRoutesModal / favourites.
 * KMB/CTB use `stop` + `name_tc`; NLB uses `stopId` + `stopName_c`.
 */
export interface BackModalStop {
  stop?: string;
  stopId?: string | number;
  name_tc?: string;
  name_en?: string;
  stopName_c?: string;
  stopName_e?: string;
  route?: string;
  routeId?: string | number;
  company?: string;
  terminus?: unknown;
  termName?: string;
  stopSeq?: number | string;
  routeSeq?: string;
  lat?: string;
  long?: string;
}

/** Favourite back-route stop entry persisted to localStorage */
export interface FavBackStop extends BackModalStop {
  route: string;
  company: string;
}

/** Favourite NLB stop entry persisted to localStorage */
export interface FavNlbStop {
  route: string;
  routeId: string | number;
  stopId: string | number;
  stopName_c: string;
  terminus: NlbStop[];
  company: string;
}

/** Single ETA slot returned by stop-all-eta API */
export interface StopEtaSlot {
  eta: string | null;
  eta_seq: number;
  rmk_tc: string;
  rmk_en: string;
}

/** Grouped ETA row (one route+direction) returned by /api/stop-all-eta */
export interface StopEtaRow {
  route: string;
  co: string;
  dir: "I" | "O";
  dest_tc: string;
  dest_en: string;
  etas: StopEtaSlot[];
}

