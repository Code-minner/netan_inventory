type SendEmailInput = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
};

function cleanEnv(value: string | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

function zeptoErrorMessage(body: unknown, status: number) {
  const b = (body || {}) as {
    message?: string;
    error?: { message?: string; code?: string; details?: unknown };
    data?: { message?: string; error?: { message?: string } };
    details?: Array<{ message?: string; code?: string }>;
  };

  const detail =
    b.details?.map((d) => d.message || d.code).filter(Boolean).join("; ") ||
    "";

  return (
    b.error?.message ||
    b.data?.error?.message ||
    b.data?.message ||
    b.message ||
    detail ||
    `ZeptoMail error (${status})`
  );
}

export async function sendEmail({
  to,
  toName,
  subject,
  html,
  text,
}: SendEmailInput) {
  const apiKey = cleanEnv(process.env.ZEPTOMAIL_API_KEY).replace(
    /^Zoho-enczapikey\s+/i,
    "",
  );
  const from = cleanEnv(process.env.EMAIL_FROM);
  const fromName = cleanEnv(process.env.EMAIL_FROM_NAME) || "Netan";
  const apiUrl =
    cleanEnv(process.env.ZEPTOMAIL_API_URL) ||
    "https://api.zeptomail.com/v1.1/email";

  if (!apiKey || !from) {
    throw new Error(
      "Missing ZEPTOMAIL_API_KEY or EMAIL_FROM. Check your .env file.",
    );
  }

  const payload = {
    from: { address: from, name: fromName },
    to: [
      {
        email_address: {
          address: to,
          name: toName || to,
        },
      },
    ],
    subject,
    htmlbody: html,
    textbody: text || html.replace(/<[^>]+>/g, " "),
  };

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Zoho-enczapikey ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const cause =
      err instanceof Error
        ? err.message +
          (err.cause instanceof Error ? ` (${err.cause.message})` : "")
        : "Network error";
    throw new Error(`ZeptoMail unreachable: ${cause}`);
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(zeptoErrorMessage(body, response.status));
  }

  return body;
}

export function clientFormEmailHtml(opts: {
  clientName: string;
  formUrl: string;
}) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111827;max-width:560px;margin:0 auto;padding:24px;">
    <h1 style="font-size:22px;margin:0 0 12px;color:#2E2A5C;">Welcome to Netan</h1>
    <p style="margin:0 0 16px;">Hi ${opts.clientName},</p>
    <p style="margin:0 0 16px;">
      You’ve been added as a client. Please complete your onboarding form so we can set up your services.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${opts.formUrl}" style="display:inline-block;background:#2E2A5C;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">
        Complete your form
      </a>
    </p>
    <p style="margin:0;font-size:13px;color:#6B7280;">
      If the button doesn’t work, open this link:<br/>
      <a href="${opts.formUrl}" style="color:#2E2A5C;">${opts.formUrl}</a>
    </p>
  </div>`;
}

export function resetPasswordEmailHtml(opts: {
  name: string;
  resetUrl: string;
}) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111827;max-width:560px;margin:0 auto;padding:24px;">
    <h1 style="font-size:22px;margin:0 0 12px;color:#2E2A5C;">Reset your Netan password</h1>
    <p style="margin:0 0 16px;">Hi ${opts.name},</p>
    <p style="margin:0 0 16px;">
      We received a request to reset your staff account password. This link expires in 30 minutes.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${opts.resetUrl}" style="display:inline-block;background:#2E2A5C;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">
        Set a new password
      </a>
    </p>
    <p style="margin:0;font-size:13px;color:#6B7280;">
      If you didn’t ask for this, you can ignore this email.<br/>
      Or open this link:<br/>
      <a href="${opts.resetUrl}" style="color:#2E2A5C;">${opts.resetUrl}</a>
    </p>
  </div>`;
}

export function inviteMemberEmailHtml(opts: {
  name: string;
  role: string;
  inviteUrl: string;
}) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111827;max-width:560px;margin:0 auto;padding:24px;">
    <h1 style="font-size:22px;margin:0 0 12px;color:#2E2A5C;">You’re invited to Netan</h1>
    <p style="margin:0 0 16px;">Hi ${opts.name},</p>
    <p style="margin:0 0 16px;">
      You’ve been invited to join the Netan workspace as <strong>${opts.role}</strong>.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${opts.inviteUrl}" style="display:inline-block;background:#2E2A5C;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">
        Accept invite
      </a>
    </p>
    <p style="margin:0;font-size:13px;color:#6B7280;">
      Or open this link:<br/>
      <a href="${opts.inviteUrl}" style="color:#2E2A5C;">${opts.inviteUrl}</a>
    </p>
  </div>`;
}
