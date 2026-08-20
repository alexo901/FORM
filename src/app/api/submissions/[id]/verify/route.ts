import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateVerificationStatus } from "@/lib/googleSheets";

// Called from admin/Google Sheet side to activate the verification link
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { verificationLink } = body;

    const [updated] = await db
      .update(submissions)
      .set({
        verificationLink: verificationLink || "",
        status: "verified",
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    // Sync to Google Sheets
    try {
      const sheetRow = parseInt(updated.sheetRowIndex || "0");
      if (sheetRow > 1) {
        await updateVerificationStatus(sheetRow, "verified", verificationLink || "");
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
