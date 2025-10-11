import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function processStripe(event: any) { return true; }
async function processPayPal(event: any) { return true; }

export async function POST(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const evt = await prisma.webhookEvent.findUnique({ where: { id } });
  if (!evt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (evt.processed) return NextResponse.json({ ok: true, message: "Already processed" });

  const ok = evt.provider === "STRIPE"
    ? await processStripe(evt.raw)
    : await processPayPal(evt.raw);

  if (ok) {
    await prisma.webhookEvent.update({ where: { id }, data: { processed: true } });
  }
  return NextResponse.json({ ok });
}
