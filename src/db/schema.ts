import { integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const snapshots = sqliteTable("snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceFile: text("source_file").notNull(),
  fileHash: text("file_hash").notNull().unique(),
  importedAt: text("imported_at").notNull(),
  rowCount: integer("row_count").notNull(),
});

export const lenders = sqliteTable("lenders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const programTypes = sqliteTable("program_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  blurb: text("blurb").notNull().default(""),
});

export const businessTypes = sqliteTable("business_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const specialRequirements = sqliteTable("special_requirements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull().unique(),
  ruleKey: text("rule_key").notNull(),
});

export const lenderPrograms = sqliteTable("lender_programs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  snapshotId: integer("snapshot_id").notNull().references(() => snapshots.id),
  lenderId: integer("lender_id").notNull().references(() => lenders.id),
  programTypeId: integer("program_type_id").notNull().references(() => programTypes.id),
  minAmount: integer("min_amount").notNull(),
  maxAmount: integer("max_amount").notNull(),
  minCredit: integer("min_credit").notNull(),
  creditTier: text("credit_tier").notNull(),
  minYears: integer("min_years").notNull(),
  rateMin: real("rate_min").notNull(),
  rateMax: real("rate_max").notNull(),
  maxTermMonths: integer("max_term_months").notNull(),
  sbaPct: integer("sba_pct").notNull(),
  businessTypeId: integer("business_type_id").references(() => businessTypes.id), // NULL = All
  collateral: text("collateral", { enum: ["Yes", "No", "Varies"] }).notNull(),
  maxDebtRatio: real("max_debt_ratio"), // NULL = no rule listed
  turnaroundDays: integer("turnaround_days").notNull(),
  specialRequirementId: integer("special_requirement_id").references(() => specialRequirements.id),
  lastUpdated: text("last_updated").notNull(), // ISO date
});

// --- Logins ---------------------------------------------------------------

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  name: text("name").notNull(), // "Priya SDR 1", "Sales Manager 1"
  role: text("role", { enum: ["sdr", "manager"] }).notNull(),
  password: text("password").notNull(), // plain text by decision: demo accounts only
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), // random token; doubles as the cookie value
  userId: integer("user_id").notNull().references(() => users.id),
  expiresAt: text("expires_at").notNull(),
});

// --- Traction log: one row per email draft an SDR opened -----------------

export const recommendations = sqliteTable("recommendations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  kind: text("kind", { enum: ["proposal", "comparison"] }).notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  sentAt: text("sent_at").notNull(),
});

// proposal = 1 row, comparison = 2..4 rows. "Compared to what" is a self-join on this table.
export const recommendationPrograms = sqliteTable(
  "recommendation_programs",
  {
    recommendationId: integer("recommendation_id").notNull().references(() => recommendations.id),
    lenderProgramId: integer("lender_program_id").notNull().references(() => lenderPrograms.id),
  },
  (t) => [primaryKey({ columns: [t.recommendationId, t.lenderProgramId] })],
);
