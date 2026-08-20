import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  loginId: varchar("login_id", { length: 255 }),
  // Page 1 - Personal Info
  fullName: varchar("full_name", { length: 255 }),
  address: text("address"),
  email: varchar("email", { length: 255 }),
  mobile: varchar("mobile", { length: 50 }),
  dateOfBirth: varchar("date_of_birth", { length: 20 }),
  // Page 2 - Amount & Bank
  amount: varchar("amount", { length: 100 }),
  bankName: varchar("bank_name", { length: 255 }),
  transferOption: varchar("transfer_option", { length: 100 }),
  // Control
  verificationLink: text("verification_link"),
  status: varchar("status", { length: 50 }).default("pending"),
  sheetRowIndex: varchar("sheet_row_index", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
