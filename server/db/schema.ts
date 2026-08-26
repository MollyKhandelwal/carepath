import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),

  location: varchar("location", { length: 255 }).notNull(),

  careStage: varchar("care_stage", { length: 100 }).notNull(),

  status: varchar("status", { length: 50 })
    .notNull()
    .default("feasible"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pathways = pgTable("pathways", {
  id: serial("id").primaryKey(),

  scenarioId: integer("scenario_id")
    .references(() => scenarios.id)
    .notNull(),

  hospital: varchar("hospital", { length: 255 }).notNull(),

  roomType: varchar("room_type", { length: 100 }).notNull(),

  estimatedCost: varchar("estimated_cost", {
    length: 100,
  }).notNull(),

  coverageFit: varchar("coverage_fit", {
    length: 50,
  }).notNull(),

  baseline: boolean("baseline").notNull().default(true),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const simulations = pgTable("simulations", {
  id: serial("id").primaryKey(),

  scenarioId: integer("scenario_id")
    .references(() => scenarios.id)
    .notNull(),

  input: text("input").notNull(),

  result: text("result").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});