/** How far ahead a document counts as expiring soon. FR-014 fixes this at 30 days for
 *  every document type. It is a constant, not a setting: FR-014 forbids exposing it. */
export const EXPIRY_WARNING_DAYS = 30;

/** How long a signed file URL stays valid, in seconds. FR-018. */
export const SIGNED_URL_TTL = 60;

/** Cookie the middleware uses to cache the signed-in person's role and status. */
export const ACTOR_CACHE_COOKIE = "dar-actor";

/** Minimum password length for sign-up. Matches the Supabase project default. */
export const MIN_PASSWORD_LENGTH = 6;

/** Maximum upload size, matching the bucket limit in migration 3. FR-020. */
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/webp",
  "audio/webm",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
] as const;

/** Human wording for the upload refusal in FR-020. */
export const ALLOWED_FILES_SENTENCE =
  "You can upload a PDF, a photo, or an audio note, up to 20 MB.";

export const DOCUMENT_TYPES = [
  "title_deed",
  "ejari",
  "tenancy_contract",
  "mortgage",
  "dewa",
  "utility",
  "insurance",
  "amc",
  "service_contract",
  "warranty",
  "visa",
  "emirates_id",
  "passport",
  "school",
  "vehicle",
  "receipt",
  "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

/** FR-012. Labels are what a client reads, so they follow the house style. */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  title_deed: "Title deed",
  ejari: "Ejari",
  tenancy_contract: "Tenancy contract",
  mortgage: "Mortgage",
  dewa: "DEWA",
  utility: "Utility",
  insurance: "Insurance",
  amc: "Maintenance contract",
  service_contract: "Service contract",
  warranty: "Warranty",
  visa: "Visa",
  emirates_id: "Emirates ID",
  passport: "Passport",
  school: "School",
  vehicle: "Vehicle",
  receipt: "Receipt",
  other: "Other",
};

export const ASSET_CATEGORIES = [
  "ac",
  "water_heater",
  "pool",
  "garden",
  "appliance",
  "vehicle",
  "security",
  "other",
] as const;
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  ac: "Air conditioning",
  water_heater: "Water heater",
  pool: "Pool",
  garden: "Garden and irrigation",
  appliance: "Appliance",
  vehicle: "Vehicle",
  security: "Security and gates",
  other: "Other",
};

export const VENDOR_CATEGORIES = [
  "ac",
  "plumbing",
  "electrical",
  "pool",
  "garden",
  "pest",
  "cleaning",
  "appliance",
  "vehicle",
  "general",
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  ac: "AC",
  plumbing: "Plumbing",
  electrical: "Electrical",
  pool: "Pool",
  garden: "Garden",
  pest: "Pest control",
  cleaning: "Cleaning",
  appliance: "Appliances",
  vehicle: "Vehicles",
  general: "General maintenance",
};

export const TASK_STATUSES = [
  "received",
  "in_progress",
  "waiting_on_client",
  "done",
  "cancelled",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  received: "Received",
  in_progress: "In progress",
  waiting_on_client: "Waiting on you",
  done: "Done",
  cancelled: "Cancelled",
};

/** What the team calls each status. FR uses "waiting on the client"; the client
 *  reads "Waiting on you". Both describe the same value. */
export const TASK_STATUS_LABELS_TEAM: Record<TaskStatus, string> = {
  ...TASK_STATUS_LABELS,
  waiting_on_client: "Waiting on client",
};

export const TASK_PRIORITIES = ["low", "normal", "high", "emergency"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  emergency: "Emergency",
};

/** One line the client reads while choosing. Plain, no jargon. */
export const TASK_PRIORITY_HINTS: Record<TaskPriority, string> = {
  low: "Whenever convenient",
  normal: "Within a few days",
  high: "Today or tomorrow",
  emergency: "Right now: leak, no power, locked out",
};

/** Lower sorts first in the queue. */
export const TASK_PRIORITY_RANK: Record<TaskPriority, number> = {
  emergency: 0,
  high: 1,
  normal: 2,
  low: 3,
};

/** A task is open until it is done or cancelled. FR-029. */
export const OPEN_TASK_STATUSES: TaskStatus[] = [
  "received",
  "in_progress",
  "waiting_on_client",
];

export const STORAGE_BUCKET = "dar-files";
