import nodemailer from 'nodemailer';

const statusMessages: Record<string, { subject: string; heading: string; body: string }> = {
  awaiting_payment: {
    subject: '✅ Forespørselen din er godkjent — klar for betaling',
    heading: 'Jobben er godkjent!',
    body: 'Vi har gjennomgått forespørselen din og er klare til å starte. Logg inn for å se pris og betale sikkert via Stripe.',
  },
  awaiting_changes: {
    subject: '🔄 Vi trenger litt mer info fra deg',
    heading: 'Endringer ønsket',
    body: 'Vi trenger noen justeringer før vi kan starte. Logg inn for å se hva vi trenger og svar via meldingsfeltet.',
  },
  in_progress: {
    subject: '🔧 Arbeidet er i gang!',
    heading: 'Vi jobber med saken din',
    body: 'Betalingen er mottatt og vi har startet på jobben. Du vil høre fra oss så snart den er fullført.',
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
}: {
  to: string;
  fixTitle: string;
  fixId: string;
  status: string;
  adminNote?: string;
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const msg = statusMessages[status];
  if (!msg) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://codemedic.no';
  const from = process.env.EMAIL_FROM ?? process.env.SMTP_USER;

  const noteHtml = adminNote
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
        ${noteHtml}
        <a href="${base}/fix/${fixId}" style="display:inline-block;margin-top:24px;background:#0f172a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-size:14px;font-weight:600">Se detaljer →</a>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0"/>
        <p style="font-size:12px;color:#94a3b8">CodeMedic — Premium teknisk hjelp for WordPress og nettbutikk</p>
      </div>
    `,
  });
}
