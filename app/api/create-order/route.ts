import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error("[Razorpay Create Order] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment");
      return NextResponse.json(
        { error: "Razorpay credentials not configured on server." },
        { status: 401 }
      );
    }

    const body = await req.json();
    let amountInPaise: number;

    // Support both direct amount in rupees or amount in paise
    if (typeof body.amount === "number") {
      // If amount is >= 100 and likely already in paise, or in rupees:
      // The task specification: Request has amount in paise, min 100 paise.
      // If user passes amount in rupees (e.g. 6490), multiply by 100 unless body.isPaise is true or amount >= 100000.
      amountInPaise = body.isPaise ? Math.round(body.amount) : Math.round(body.amount * 100);
    } else {
      return NextResponse.json(
        { error: "Amount is required and must be a valid number." },
        { status: 400 }
      );
    }

    // Minimum amount: 100 paise (1 INR)
    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (₹1.00)." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret
    });

    const currency = body.currency || "INR";
    const receipt = body.receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const options = {
      amount: amountInPaise,
      currency,
      receipt,
      notes: body.notes || {
        store: "Nilasa Artisanal Wear"
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: key_id
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Razorpay Create Order Error]:", errorMsg);
    return NextResponse.json(
      {
        error: "Failed to create Razorpay order.",
        details: errorMsg
      },
      { status: 500 }
    );
  }
}
