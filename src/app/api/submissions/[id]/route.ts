import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!GOOGLE_SCRIPT_URL) {
      return NextResponse.json(
        {
          success: false,
          error: "GOOGLE_SCRIPT_URL is missing",
        },
        { status: 500 }
      );
    }

    const url =
      `${GOOGLE_SCRIPT_URL}?action=status&id=` +
      encodeURIComponent(id);

    const response = await fetch(url, {
      cache: "no-store",
    });

    const text = await response.text();

    console.log("Apps Script status:", response.status);
    console.log("Apps Script response:", text);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Apps Script request failed",
        },
        { status: 502 }
      );
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response from Apps Script",
        },
        { status: 502 }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Submission not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        status: data.status,
        verificationLink: data.verificationLink || "",
      },
    });
  } catch (error) {
    console.error("Status API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to check submission status",
      },
      { status: 500 }
    );
  }
}