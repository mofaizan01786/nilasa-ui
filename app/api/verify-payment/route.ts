import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      console.error("[Razorpay Verify Payment] Missing RAZORPAY_KEY_SECRET in environment");
      return NextResponse.json(
        { error: "Razorpay secret key not configured on server." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const order_id = body.razorpay_order_id || body.order_id;
    const payment_id = body.razorpay_payment_id || body.payment_id;
    const signature = body.razorpay_signature || body.signature;

    // Validate all required fields
    if (!order_id || !payment_id || !signature) {
      return NextResponse.json(
        {
          error: "Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are all required."
        },
        { status: 400 }
      );
    }

    // Expected signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const signatureBuffer = Buffer.from(signature, "utf-8");

    const isAuthentic =
      expectedBuffer.length === signatureBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

    if (!isAuthentic) {
      console.warn(`[Razorpay Signature Verification Failed] Order: ${order_id}, Payment: ${payment_id}`);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Razorpay payment signature. Payment verification failed."
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      order_id,
      payment_id
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Razorpay Verify Payment Error]:", errorMsg);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during payment verification.",
        details: errorMsg
      },
      { status: 500 }
    );
  }
}
