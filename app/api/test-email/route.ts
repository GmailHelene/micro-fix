import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Kun tilgjengelig i development — blokkert i produksjon
export async function GET() {
  const config = {
    SMTP_HOST: process.env.SMTP_HOST ?? '(ikke satt)',
    SMTP_PORT: process.env.SMTP_PORT ?? '(ikke satt)',
    SMTP_USER: process.env.SMTP_USER ? process.env.SMTP_USER.slice(0, 4) + '****' : '(ikke satt)',
    SMTP_PASS: process.env.SMTP_PASS ? '****' : '(ikke satt)',
    EMAIL_FROM: process.env.EMAIL_FROM ?? '(ikke satt)',
    NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '(ikke satt)',
  };

  const missing = Object.entries(config)
    .filter(([, v]) => v === '(ikke satt)')
    .map(([k]) => k);

  if (missing.length > 0) {
    return NextResponse.json({
      ok: false,
      error: 'Mangler miljøvariabler',
      missing,
      config,
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL!;
    const from = process.env.EMAIL_FROM ?? process.env.SMTP_USER!;

    await transporter.sendMail({
      from: `CodeMedic <${from}>`,
      to: adminEmail,
      subject: '✅ Test-e-post fra CodeMedic',
      html: `<p>SMTP-oppsett fungerer! Sendt til: <strong>${adminEmail}</strong></p><p>Fra: <strong>${from}</strong></p>`,
    });

    return NextResponse.json({
      ok: true,
      message: `Test-e-post sendt til ${adminEmail}`,
      config,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: false,
      error: message,
      config,
    });
  }
}
