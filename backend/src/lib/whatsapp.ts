import { normalizePhoneE164, toWhatsAppJid } from "@/lib/phone";

type SendResult = { ok: boolean; reason?: string; detail?: string };

function cloudApiConfigured() {
  return !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

function evolutionApiConfigured() {
  return !!(
    process.env.WHATSAPP_EVOLUTION_API_URL &&
    process.env.WHATSAPP_EVOLUTION_INSTANCE &&
    process.env.WHATSAPP_EVOLUTION_API_KEY
  );
}

export function getPlanGroupId(planKey: string | null | undefined): string | null {
  if (!planKey) return null;
  const envKey = `WHATSAPP_GROUP_${planKey.replace(/-/g, "_").toUpperCase()}`;
  return process.env[envKey] ?? null;
}

export async function sendWhatsAppText(toE164: string, body: string): Promise<SendResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    console.warn("[whatsapp] Cloud API not configured — skipping message");
    return { ok: false, reason: "cloud_api_not_configured" };
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toE164.replace(/\D/g, ""),
      type: "text",
      text: { body, preview_url: false },
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!res.ok) {
    console.error("[whatsapp] send failed", data);
    return { ok: false, reason: "send_failed", detail: data.error?.message ?? res.statusText };
  }
  return { ok: true };
}

export async function sendAdminWhatsApp(body: string): Promise<SendResult> {
  const admin = normalizePhoneE164(process.env.ADMIN_WHATSAPP_NUMBER);
  if (!admin) {
    console.warn("[whatsapp] ADMIN_WHATSAPP_NUMBER not set");
    return { ok: false, reason: "admin_number_missing" };
  }
  return sendWhatsAppText(admin, body);
}

/** Remove a participant from a WhatsApp group via Evolution API or custom webhook. */
export async function removeUserFromWhatsAppGroup(
  phone: string | null | undefined,
  planKey: string | null | undefined,
): Promise<SendResult> {
  const e164 = normalizePhoneE164(phone);
  if (!e164) {
    return { ok: false, reason: "phone_missing" };
  }

  const groupId = getPlanGroupId(planKey);
  if (!groupId) {
    return { ok: false, reason: "group_not_configured", detail: planKey ?? undefined };
  }

  const webhookUrl = process.env.WHATSAPP_REMOVE_WEBHOOK_URL;
  if (webhookUrl) {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, phone: e164, planKey }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, reason: "webhook_failed", detail: text || res.statusText };
    }
    return { ok: true };
  }

  if (evolutionApiConfigured()) {
    const base = process.env.WHATSAPP_EVOLUTION_API_URL!.replace(/\/$/, "");
    const instance = process.env.WHATSAPP_EVOLUTION_INSTANCE!;
    const res = await fetch(`${base}/group/updateParticipant/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.WHATSAPP_EVOLUTION_API_KEY!,
      },
      body: JSON.stringify({
        groupJid: groupId,
        action: "remove",
        participants: [toWhatsAppJid(e164)],
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { response?: { message?: string }; error?: string };
    if (!res.ok) {
      console.error("[whatsapp] Evolution remove failed", data);
      return {
        ok: false,
        reason: "evolution_remove_failed",
        detail: data.error ?? data.response?.message ?? res.statusText,
      };
    }
    return { ok: true };
  }

  console.warn("[whatsapp] No group removal provider configured (Evolution API or WHATSAPP_REMOVE_WEBHOOK_URL)");
  return { ok: false, reason: "removal_not_configured" };
}

export function isWhatsAppConfigured() {
  return cloudApiConfigured() || evolutionApiConfigured() || !!process.env.WHATSAPP_REMOVE_WEBHOOK_URL;
}
