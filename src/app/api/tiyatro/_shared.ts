import { NextResponse } from "next/server";
import { TiyatroConfigError, errorMessage } from "@/lib/tiyatro/errors";

/** Konfig hatasi -> 503, digerleri -> 500. Operator araci oldugu icin mesaj gosterilir. */
export function handleError(err: unknown, fallback = "Bir hata olustu.") {
  if (err instanceof TiyatroConfigError) {
    return NextResponse.json({ error: err.message, code: "CONFIG" }, { status: 503 });
  }
  return NextResponse.json({ error: errorMessage(err, fallback) }, { status: 500 });
}
