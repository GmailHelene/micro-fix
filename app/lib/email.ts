import nodemailer from 'nodemailer';

// ── Felles hjelpefunksjon for transporter ──────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── Admin-varsling ved ny forespørsel ──────────────────────────────────────
export async function sendAdminNotificationEmail({
  fixTitle,
  fixId,
  customerEmail,
  packageName,
  category,
}: {
  fixTitle: string;
  fixId: string;
  customerEmail: string;
  packageName?: string;
  category?: string;
}) {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !adminEmail) return;

  const transporter = createTransporter();
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://codemedic.no';
  const from = process.env.EMAIL_FROM ?? process.env.SMTP_USER;

  await transporter.sendMail({
    from: `CodeMedic <${from}>`,
    to: adminEmail,
    subject: `📬 Ny forespørsel: ${fixTitle}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#0f172a">
        <p style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:8px">CodeMedic — Ny forespørsel</p>
        <h1 style="font-size:22px;font-weight:700;margin:0 0 16px">📬 Ny forespørsel kom inn</h1>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
          <tr><td style="padding:6px 0;color:#64748b;width:120px">Tittel</td><td style="font-weight:600">${fixTitle}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Kunde</td><td>${customerEmail}</td></tr>
          ${packageName ? `<tr><td style="padding:6px 0;color:#64748b">Pakke</td><td>${packageName}</td></tr>` : ''}
          ${category ? `<tr><td style="padding:6px 0;color:#64748b">Kategori</td><td>${category}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#64748b">Saksnr.</td><td style="font-family:monospace">#${fixId.slice(0, 8).toUpperCase()}</td></tr>
        </table>
        <a href="${base}/admin/fix/${fixId}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-size:14px;font-weight:600">
          Gå til forespørselen →
        </a>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0"/>
        <p style="font-size:12px;color:#94a3b8">CodeMedic — Admin-varsling</p>
      </div>
    `,
  }).catch(() => null);
}

// ── Admin-varsling ved hendelser i flyten ─────────────────────────────────
type AdminEventType = 'offer_accepted' | 'payment_authorized' | 'access_info_shared';

const adminEventMessages: Record<AdminEventType, {
  subject: string; heading: string; body: string; cta: string; color: string;
}> = {
  offer_accepted: {
    subject: '🤝 Kunde godtok tilbudet — klar for betaling',
    heading: '🤝 Tilbudet ble godtatt!',
    body: 'Kunden har godtatt ditt custom tilbud og kan nå betale direkte via systemet. Du trenger ikke gjøre noe — betalingen kjøres automatisk med den tilpassede prisen du satte.',
    cta: 'Gå til forespørselen →',
    color: '#7c3aed',
  },
  payment_authorized: {
    subject: '💳 Betaling reservert — jobb kan starte',
    heading: '💳 Betaling reservert!',
    body: 'Kunden har reservert betalingen via Stripe. Pengene trekkes automatisk når du markerer jobben som fullført. Sjekk om kunden har delt tilgangsinformasjon — hvis ikke, vent til de gjør det.',
    cta: 'Start jobben →',
    color: '#2563eb',
  },
  access_info_shared: {
    subject: '🔑 Tilgang delt — jobb kan starte nå',
    heading: '🔑 Kunden har delt tilgang!',
    body: 'Kunden har delt tilgangsinformasjon (WP-admin, FTP e.l.). Alt er klart — du kan starte jobben nå.',
    cta: 'Se tilgang og start jobben →',
    color: '#059669',
  },
};

export async function sendAdminEventEmail({
  event,
  fixTitle,
  fixId,
  customerEmail,
  price,
}: {
  event: AdminEventType;
  fixTitle: string;
  fixId: string;
  customerEmail?: string;
  price?: number;
}) {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !adminEmail) return;

  const msg = adminEventMessages[event];
  const transporter = createTransporter();
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://codemedic.no';
  const from = process.env.EMAIL_FROM ?? process.env.SMTP_USER;

  const extraHtml = price
    ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin:12px 0;font-size:14px">
        <span style="color:#64748b">Beløp:</span> <strong>${price} kr</strong>
       </div>`
    : '';

  await transporter.sendMail({
    from: `CodeMedic <${from}>`,
    to: adminEmail,
    subject: `${msg.subject} — ${fixTitle}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#0f172a">
        <p style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:8px">CodeMedic — Admin</p>
        <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;color:${msg.color}">${msg.heading}</h1>
        <p style="font-size:14px;color:#475569;margin:0 0 4px">Oppdrag: <strong>${fixTitle}</strong></p>
        ${customerEmail ? `<p style="font-size:14px;color:#94a3b8;margin:0 0 4px">Kunde: ${customerEmail}</p>` : ''}
        <p style="font-size:14px;color:#94a3b8;margin:0 0 20px">Saksnr. #${fixId.slice(0, 8).toUpperCase()}</p>
        <p style="font-size:15px;color:#334155;line-height:1.6">${msg.body}</p>
        ${extraHtml}
        <a href="${base}/admin/fix/${fixId}" style="display:inline-block;margin-top:20px;background:${msg.color};color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-size:14px;font-weight:600">${msg.cta}</a>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0"/>
        <p style="font-size:12px;color:#94a3b8">CodeMedic — Admin-varsling</p>
      </div>
    `,
  }).catch(() => null);
}

// ── Varsling til kunde når admin sender melding ───────────────────────────
export async function sendMessageNotificationEmail({
  to,
  fixTitle,
  fixId,
  messagePreview,
}: {
  to: string;
  fixTitle: string;
  fixId: string;
  messagePreview: string;
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  const transporter = createTransporter();
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://codemedic.no';
  const from = process.env.EMAIL_FROM ?? process.env.SMTP_USER;

  await transporter.sendMail({
    from: `CodeMedic <${from}>`,
    to,
    subject: `💬 Ny melding fra CodeMedic — ${fixTitle}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#0f172a">
        <p style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:8px">CodeMedic — Melding</p>
        <h1 style="font-size:22px;font-weight:700;margin:0 0 8px">💬 Du har en ny melding</h1>
        <p style="font-size:14px;color:#475569;margin:0 0 20px">Oppdrag: <strong>${fixTitle}</strong></p>
        <div style="background:#f8fafc;border-left:4px solid #0f172a;padding:12px 16px;border-radius:4px;margin-bottom:24px">
          <p style="font-size:14px;color:#334155;margin:0;font-style:italic">"${messagePreview}"</p>
        </div>
        <a href="${base}/fix/${fixId}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-size:14px;font-weight:600">
          Se melding og svar →
        </a>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0"/>
        <p style="font-size:12px;color:#94a3b8">CodeMedic — Premium teknisk hjelp for WordPress og nettbutikk</p>
      </div>
    `,
  }).catch(() => null);
}

const statusMessages: Record<string, { subject: string; heading: string; body: string }> = {
  new_request: {
    subject: '📬 Vi har mottatt forespørselen din',
    heading: 'Forespørsel mottatt!',
    body: 'Takk for at du valgte CodeMedic! Vi har mottatt forespørselen din og starter gjennomgangen nå. Du vil høre fra oss innen 24 timer med en bekreftelse og neste steg.',
  },
  awaiting_payment: {
    subject: '✅ Forespørselen din er godkjent — klar for betaling',
    heading: 'Jobben er godkjent!',
    body: 'Vi har gjennomgått forespørselen din og er klare til å starte. Logg inn for å se pris og reservere betalingen sikkert via Stripe.',
  },
  awaiting_offer_approval: {
    subject: '💬 Vi har sendt deg et custom tilbud',
    heading: 'Custom tilbud fra CodeMedic',
    body: 'Vi har vurdert forespørselen din og sendt deg et tilbud med tilpasset pris. Logg inn for å se tilbudet og velge om du vil godta eller avslå.',
  },
  awaiting_changes: {
    subject: '🔄 Vi trenger litt mer info fra deg',
    heading: 'Endringer ønsket',
    body: 'Vi trenger noen justeringer før vi kan starte. Logg inn for å se hva vi trenger og svar via meldingsfeltet.',
  },
  in_progress: {
    subject: '🔧 Betaling bekreftet — del tilgang for å starte',
    heading: 'Betaling reservert!',
    body: 'Betalingen er reservert og vi er klare til å starte. <strong>For at vi skal komme i gang trenger vi tilgang til WordPress-siden din.</strong> Logg inn, gå til oppdraget og legg inn tilgangsinformasjon (WP Application Password, midlertidig admin-bruker eller FTP). Vi starter så snart vi har tilgang.',
  },
  completed: {
    subject: '🎉 Jobben er fullført!',
    heading: 'Ferdig levert',
    body: 'Vi har løst problemet ditt. Logg inn for å se oppsummeringen og bekrefte at alt er i orden.',
  },
  cancelled: {
    subject: 'ℹ️ Forespørselen din er avbrutt',
    heading: 'Forespørsel avbrutt',
    body: 'Forespørselen din ble dessverre avbrutt. Har du spørsmål? Ta kontakt så hjelper vi deg.',
  },
};

export async function sendStatusEmail({
  to,
  fixTitle,
  fixId,
  status,
  adminNote,
  price,
}: {
  to: string;
  fixTitle: string;
  fixId: string;
  status: string;
  adminNote?: string;
  price?: number;
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const msg = statusMessages[status];
  if (!msg) return;

  const transporter = createTransporter();

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://codemedic.no';
  const from = process.env.EMAIL_FROM ?? process.env.SMTP_USER;

  // For custom offer: show explanation + price prominently
  const offerHtml = status === 'awaiting_offer_approval'
    ? `<div style="background:#f5f3ff;border:1px solid #c4b5fd;border-radius:8px;padding:16px;margin:16px 0">
        ${adminNote ? `<p style="font-size:14px;color:#4c1d95;margin:0 0 12px"><strong>Fra CodeMedic:</strong><br/>${adminNote}</p>` : ''}
        ${price ? `<p style="font-size:24px;font-weight:700;color:#4c1d95;margin:0">Tilbudspris: ${price} kr</p>` : ''}
        <p style="font-size:12px;color:#7c3aed;margin:8px 0 0">Logg inn for å godta eller avslå tilbudet.</p>
      </div>`
    : '';

  const noteHtml = adminNote && status !== 'awaiting_offer_approval'
    ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:14px;color:#9a3412"><strong>Melding fra CodeMedic:</strong><br/>${adminNote}</div>`
    : '';

  await transporter.sendMail({
    from: `CodeMedic <${from}>`,
    to,
    subject: `${msg.subject} — ${fixTitle}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#0f172a">
        <p style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:8px">CodeMedic</p>
        <h1 style="font-size:22px;font-weight:700;margin:0 0 8px">${msg.heading}</h1>
        <p style="font-size:14px;color:#475569;margin:0 0 4px">Oppdrag: <strong>${fixTitle}</strong></p>
        <p style="font-size:14px;color:#94a3b8;margin:0 0 20px">Saksnr. #${fixId.slice(0, 8).toUpperCase()}</p>
        <p style="font-size:15px;color:#334155;line-height:1.6">${msg.body}</p>
        ${offerHtml}
        ${noteHtml}
        <a href="${base}/fix/${fixId}" style="display:inline-block;margin-top:24px;background:#0f172a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-size:14px;font-weight:600">Se detaljer →</a>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0"/>
        <p style="font-size:12px;color:#94a3b8">CodeMedic — Premium teknisk hjelp for WordPress og nettbutikk</p>
      </div>
    `,
  });
}
