/**
 * Mailer — Brevo HTTP REST API
 * https://api.brevo.com/v3/smtp/email  (HTTPS port 443 — never blocked by Render)
 *
 * .env: BREVO_API_KEY    — API key from Brevo → Settings → API Keys
 *       EMAIL_FROM       — verified sender email (verify in Brevo Senders tab)
 *       EMAIL_FROM_NAME  — display name (default: ZenMind)
 *
 * No SMTP, no nodemailer, no IPv6 issues. Uses Node built-in fetch (Node 18+).
 */

const _apiKey = process.env.BREVO_API_KEY;
if (!_apiKey) {
  console.warn('[Mailer] ⚠️  BREVO_API_KEY not set — emails will be skipped');
} else {
  console.log(`[Mailer] ✅ Brevo HTTP API ready — sending as ${process.env.EMAIL_FROM}`);
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' });
}
function fmtTime(d) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
}
function header(title, sub = '') {
  return `<div style="background:linear-gradient(135deg,#0d5d3a,#1a8a5a);padding:28px 32px;">
    <h2 style="margin:0;color:#fff;font-size:22px;font-weight:700;">${title}</h2>
    ${sub ? `<p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${sub}</p>` : ''}
  </div>`;
}
function footer() {
  return `<div style="background:#f7fbf8;padding:16px 32px;border-top:1px solid #e0ede6;">
    <p style="margin:0;font-size:12px;color:#8aab99;text-align:center;">&#128153; Team ZenMind &nbsp;&bull;&nbsp; Adolescent Mental Wellness Platform</p>
  </div>`;
}
function wrap(inner) {
  return `<div style="font-family:'Segoe UI',Arial,sans-serif;background:#eef6f1;padding:32px 16px;">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,93,58,0.10);">
    ${inner}
  </div>
</div>`;
}
function infoRow(label, value) {
  return `<tr>
    <td style="padding:8px 0;color:#4a7c5d;font-size:14px;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;color:#0a2617;font-size:14px;font-weight:600;">${value}</td>
  </tr>`;
}
const POLICY_HTML = `<div style="background:#f0fbf4;border-left:4px solid #0d5d3a;border-radius:0 8px 8px 0;padding:16px 20px;margin-top:20px;">
  <p style="margin:0 0 8px;font-weight:700;color:#0a2617;font-size:14px;">&#128203; Cancellation &amp; Refund Policy</p>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <tr><td style="padding:4px 8px 4px 0;color:#4a7c5d;">3+ days before</td><td style="color:#0d5d3a;font-weight:700;">100% refund</td></tr>
    <tr><td style="padding:4px 8px 4px 0;color:#4a7c5d;">2 days before</td><td style="color:#f59e0b;font-weight:700;">80% refund</td></tr>
    <tr><td style="padding:4px 8px 4px 0;color:#4a7c5d;">Within 48 hrs / immediate</td><td style="color:#ef4444;font-weight:700;">70% refund</td></tr>
    <tr><td style="padding:4px 8px 4px 0;color:#4a7c5d;">Critical window (&lt;12 min before)</td><td style="color:#dc2626;font-weight:700;">50% refund — 50% platform fee</td></tr>
  </table>
</div>
<div style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 20px;margin-top:12px;">
  <p style="margin:0;font-size:13px;color:#92400e;">&#9203; <strong>10-Minute No-Show Rule:</strong> If you don't join within 10 minutes of the session start, it will be auto-cancelled (70% refund). If the therapist doesn't join within 10 minutes, you receive a <strong>100% refund</strong>.</p>
</div>
<div style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:0 8px 8px 0;padding:14px 20px;margin-top:12px;">
  <p style="margin:0;font-size:13px;color:#991b1b;">&#9888;&#65039; <strong>Critical Time Window:</strong> If you cancel within 12 minutes of the session start time, only <strong>50% is refunded</strong> and 50% is retained as a platform fee. The vacated slot will <em>not</em> be reopened for new bookings at this stage.</p>
</div>`;

// ─── Core send — Brevo HTTP API (HTTPS 443, never blocked) ───────────────────
async function send(to, subject, html) {
  const apiKey    = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  const fromName  = process.env.EMAIL_FROM_NAME || 'ZenMind';
  if (!apiKey) { console.warn(`[Mailer] ⚠️  BREVO_API_KEY not set — skipping "${subject}" → ${to}`); return; }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender:      { name: fromName, email: fromEmail },
      to:          [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API ${res.status}: ${err}`);
  }
  console.log(`[Mailer] ✅ "${subject}" → ${to}`);
}

// ─── OTP ────────────────────────────────────────────────────────────────────
export async function sendOtpEmail({ toEmail, toName, code }) {
  const html = wrap(`
    ${header('&#128272; ZenMind Verification')}
    <div style="padding:32px;">
      <p style="font-size:16px;color:#0a2617;margin:0 0 12px;">Hey <strong>${toName || 'there'}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 24px;">Use the code below to verify your identity. It expires in <strong>2 minutes</strong>.</p>
      <div style="text-align:center;margin:0 0 28px;">
        <div style="display:inline-block;background:#f4fbf6;border:2px solid #0d5d3a;border-radius:14px;padding:18px 40px;">
          <span style="font-size:36px;font-weight:800;color:#0d5d3a;font-family:monospace;letter-spacing:8px;padding-left:8px;">${code}</span>
        </div>
      </div>
      <p style="color:#8aab99;font-size:13px;line-height:1.6;margin:0;">If you didn't request this, you can safely ignore this email.<br/>Never share this code with anyone.</p>
    </div>
    ${footer()}`);
  await send(toEmail, 'Your ZenMind Verification Code', html);
}

// ─── WELCOME ────────────────────────────────────────────────────────────────
export async function sendWelcomeEmail({ toEmail, toName }) {
  const html = wrap(`
    ${header('Welcome to ZenMind &#127807;', 'Your personal mental wellness companion')}
    <div style="padding:32px 36px;">
      <p style="font-size:17px;color:#0a2617;margin:0 0 16px;">Hi <strong>${toName || 'there'}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 20px;">We're really glad you're here. ZenMind is a safe space designed for adolescents — where your thoughts and emotions are heard without judgment.</p>
    </div>
    ${footer()}`);
  await send(toEmail, "Welcome to ZenMind 🌿 You're not alone", html);
}

// ─── SESSION BOOKING — USER ──────────────────────────────────────────────────
export async function sendSessionBookingUser({ toEmail, userName, therapistName, therapistSpec, therapistClinic, sessionDate, sessionTime, amountPaid, sessionDuration }) {
  const refund70 = Math.round(amountPaid * 0.70);
  const html = wrap(`
    ${header('&#127881; Session Confirmed!', 'Your therapy session has been successfully booked.')}
    <div style="padding:28px 32px;">
      <p style="font-size:16px;color:#0a2617;margin:0 0 20px;">Hi <strong>${userName}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 20px;">Great news — your therapy session is confirmed. Here are your booking details:</p>
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow('&#129657; Therapist', therapistName)}
        ${infoRow('&#127919; Specialization', therapistSpec || 'General Therapy')}
        ${infoRow('&#127968; Clinic', therapistClinic || 'Online')}
        ${infoRow('&#128197; Date', sessionDate)}
        ${infoRow('&#128336; Time', sessionTime)}
        ${infoRow('&#9200; Duration', `${sessionDuration || 30} minutes`)}
        ${infoRow('&#128176; Amount Paid', `₹${amountPaid}`)}
      </table>
      <div style="background:#e6f4ea;border-radius:10px;padding:14px 18px;margin-top:20px;font-size:14px;color:#0a2617;">
        <strong>&#128279; How to Join:</strong> Log into ZenMind &rarr; My Sessions &rarr; Join your session at the scheduled time.
      </div>
      ${POLICY_HTML}
      <p style="margin-top:24px;color:#4a7c5d;font-size:14px;line-height:1.7;">We're proud to walk this journey with you. Take care, and we'll see you at the session! 💚</p>
    </div>
    ${footer()}`);
  await send(toEmail, '✅ Session Booked — ZenMind', html);
}

// ─── SESSION BOOKING — THERAPIST ─────────────────────────────────────────────
export async function sendSessionBookingTherapist({ toEmail, therapistName, userName, userPhone, sessionDate, sessionTime, sessionDuration, amountPaid }) {
  const html = wrap(`
    ${header('&#128197; New Session Booking', 'A client has booked a session with you.')}
    <div style="padding:28px 32px;">
      <p style="font-size:16px;color:#0a2617;margin:0 0 20px;">Hello <strong>${therapistName}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 20px;">You have a new session booking. Here are the details:</p>
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow('&#128100; Client', userName)}
        ${infoRow('&#128222; Phone', userPhone || 'Not provided')}
        ${infoRow('&#128197; Date', sessionDate)}
        ${infoRow('&#128336; Time', sessionTime)}
        ${infoRow('&#9200; Duration', `${sessionDuration || 30} minutes`)}
        ${infoRow('&#128176; Session Fee', `₹${amountPaid}`)}
      </table>
      <div style="background:#e6f4ea;border-radius:10px;padding:14px 18px;margin-top:20px;font-size:14px;color:#0a2617;">
        <strong>&#128279; Action Required:</strong> Log into ZenMind &rarr; Dashboard &rarr; Join the session on time.
      </div>
      <div style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 20px;margin-top:12px;">
        <p style="margin:0;font-size:13px;color:#92400e;">&#9203; Please join within <strong>10 minutes</strong> of the session start time. If you don't join within 10 minutes, the session will be auto-cancelled and the client will receive a full refund.</p>
      </div>
    </div>
    ${footer()}`);
  await send(toEmail, '📅 New Session Booking — ZenMind', html);
}

// ─── 10-MIN REMINDER — USER ──────────────────────────────────────────────────
export async function sendSessionReminderUser({ toEmail, userName, therapistName, sessionDate, sessionTime }) {
  const html = wrap(`
    ${header('&#9200; Session Starting in 10 Minutes!', 'Time to get ready for your therapy session.')}
    <div style="padding:28px 32px;">
      <p style="font-size:16px;color:#0a2617;margin:0 0 16px;">Hi <strong>${userName}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 16px;">Your session with <strong>${therapistName}</strong> begins in just <strong>10 minutes</strong>. Please be ready!</p>
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow('&#128197; Date', sessionDate)}
        ${infoRow('&#128336; Time', sessionTime)}
        ${infoRow('&#129657; Therapist', therapistName)}
      </table>
      <div style="background:#e6f4ea;border-radius:10px;padding:14px 18px;margin-top:20px;font-size:14px;color:#0a2617;">
        <strong>&#128279; Join Now:</strong> Log into ZenMind &rarr; My Sessions &rarr; Join Session
      </div>
      <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:14px 20px;margin-top:12px;">
        <p style="margin:0;font-size:13px;color:#b91c1c;">&#9888; <strong>Important:</strong> If you don't join within 10 minutes of the start time, your session will be automatically cancelled with a 70% refund.</p>
      </div>
      <p style="margin-top:20px;color:#4a7c5d;font-size:14px;">You've got this. We're with you! 💚</p>
    </div>
    ${footer()}`);
  await send(toEmail, '⏰ Your Session Starts in 10 Minutes — ZenMind', html);
}

// ─── 10-MIN REMINDER — THERAPIST ─────────────────────────────────────────────
export async function sendSessionReminderTherapist({ toEmail, therapistName, userName, sessionDate, sessionTime }) {
  const html = wrap(`
    ${header('&#9200; Session Starting in 10 Minutes!', 'Your client is waiting for you.')}
    <div style="padding:28px 32px;">
      <p style="font-size:16px;color:#0a2617;margin:0 0 16px;">Hello <strong>${therapistName}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 16px;">Your session with client <strong>${userName}</strong> begins in <strong>10 minutes</strong>. Please be prepared and join on time.</p>
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow('&#128100; Client', userName)}
        ${infoRow('&#128197; Date', sessionDate)}
        ${infoRow('&#128336; Time', sessionTime)}
      </table>
      <div style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 20px;margin-top:20px;">
        <p style="margin:0;font-size:13px;color:#92400e;">&#9203; <strong>Reminder:</strong> Failure to join within 10 minutes will result in an automatic cancellation and a full refund to the client.</p>
      </div>
    </div>
    ${footer()}`);
  await send(toEmail, '⏰ Session in 10 Minutes — ZenMind', html);
}

// ─── POST-SESSION THANK YOU — USER ───────────────────────────────────────────
export async function sendSessionCompleteUser({ toEmail, userName, therapistName }) {
  const html = wrap(`
    ${header('&#128154; Thank You for Your Session', 'We are always here for you.')}
    <div style="padding:32px 36px;">
      <p style="font-size:17px;color:#0a2617;margin:0 0 16px;">Dear <strong>${userName}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 16px;">Your session with <strong>${therapistName}</strong> has been completed. We hope it was helpful and meaningful for you.</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 16px;">Remember — taking care of your mental health is one of the bravest things you can do. You are not alone in this journey. The ZenMind team and your therapist are always here to support you.</p>
      <div style="background:#e6f4ea;border-radius:10px;padding:16px 20px;margin-top:4px;">
        <p style="margin:0;color:#0a2617;font-size:14px;line-height:1.7;">&#127775; <strong>What's Next?</strong><br/>
        &bull; Rate your session on ZenMind to help us improve<br/>
        &bull; Book your next session whenever you feel ready<br/>
        &bull; Our AI companion is available 24/7 if you need to talk</p>
      </div>
      <p style="margin-top:20px;color:#4a7c5d;font-size:14px;line-height:1.7;">With warmth and care,<br/><strong>Team ZenMind</strong> 💚</p>
    </div>
    ${footer()}`);
  await send(toEmail, '💚 Thank You — ZenMind Session Complete', html);
}

// ─── CANCELLATION — USER (user-initiated) ────────────────────────────────────
export async function sendCancellationUser({ toEmail, userName, therapistName, sessionDate, sessionTime, amountPaid, refundPct, reason }) {
  const refundAmt = Math.round(amountPaid * refundPct / 100);
  const platformFee = amountPaid - refundAmt;
  const color = refundPct === 100 ? '#0d5d3a' : refundPct === 80 ? '#f59e0b' : '#ef4444';
  const reasonText = reason === 'noshow'
    ? 'Your session was automatically cancelled because you did not join within the 10-minute grace period.'
    : reason === 'critical'
    ? 'Your session was cancelled within the 12-minute critical window before the session start time.'
    : 'Your session has been cancelled as requested.';
  const html = wrap(`
    ${header('&#128203; Session Cancellation Notice', 'Details of your refund are below.')}
    <div style="padding:28px 32px;">
      <p style="font-size:16px;color:#0a2617;margin:0 0 16px;">Hi <strong>${userName}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 20px;">${reasonText}</p>
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow('&#129657; Therapist', therapistName)}
        ${infoRow('&#128197; Date', sessionDate)}
        ${infoRow('&#128336; Time', sessionTime)}
        ${infoRow('&#128176; Amount Paid', `₹${amountPaid}`)}
        ${infoRow('&#9989; Refund Amount', `<span style="color:${color};font-size:16px;">₹${refundAmt} (${refundPct}%)</span>`)}
        ${platformFee > 0 ? infoRow('&#128683; Platform Fee', `₹${platformFee} (retained)`) : ''}
      </table>
      <div style="background:#e6f4ea;border-radius:10px;padding:14px 18px;margin-top:20px;font-size:14px;color:#0a2617;">
        <strong>&#128197; Refund Timeline:</strong> The refund of ₹${refundAmt} will be credited to your original payment method within <strong>5–7 business days</strong>.
      </div>
      ${POLICY_HTML}
      <p style="margin-top:20px;color:#4a7c5d;font-size:14px;">You can book a new session anytime. We're always here. 💚</p>
    </div>
    ${footer()}`);
  await send(toEmail, `Session Cancelled — ₹${refundAmt} Refund Initiated`, html);
}

// ─── CANCELLATION NOTIFY — THERAPIST (user cancelled their slot) ─────────────
export async function sendCancellationTherapistNotif({ toEmail, therapistName, userName, sessionDate, sessionTime }) {
  const html = wrap(`
    ${header('&#128203; Session Cancellation Notice', 'A client has cancelled their booking.')}
    <div style="padding:28px 32px;">
      <p style="font-size:16px;color:#0a2617;margin:0 0 16px;">Hello <strong>${therapistName}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 20px;">We wanted to inform you that <strong>${userName}</strong> has cancelled their upcoming session with you.</p>
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow('&#128100; Client', userName)}
        ${infoRow('&#128197; Date', sessionDate)}
        ${infoRow('&#128336; Time', sessionTime)}
      </table>
      <div style="background:#f0f9ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:14px 20px;margin-top:20px;">
        <p style="margin:0;font-size:13px;color:#1e40af;">&#128197; The slot has been freed. You can add it back to your available slots from your ZenMind dashboard.</p>
      </div>
    </div>
    ${footer()}`);
  await send(toEmail, 'Session Cancelled by Client — ZenMind', html);
}

// ─── CANCELLATION — THERAPIST NO-SHOW (user gets 100% refund) ───────────────
export async function sendTherapistNoShowUser({ toEmail, userName, therapistName, sessionDate, sessionTime, amountPaid }) {
  const html = wrap(`
    ${header('&#128679; Session Cancelled — Full Refund Issued', 'We sincerely apologize for this inconvenience.')}
    <div style="padding:28px 32px;">
      <p style="font-size:16px;color:#0a2617;margin:0 0 16px;">Dear <strong>${userName}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 20px;">We sincerely apologize. Your session with <strong>${therapistName}</strong> on <strong>${sessionDate} at ${sessionTime}</strong> was automatically cancelled because the therapist did not join within the 10-minute grace period.</p>
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow('&#128176; Amount Paid', `₹${amountPaid}`)}
        ${infoRow('&#9989; Full Refund', `<span style="color:#0d5d3a;font-size:16px;font-weight:700;">₹${amountPaid} (100%)</span>`)}
      </table>
      <div style="background:#e6f4ea;border-radius:10px;padding:14px 18px;margin-top:20px;font-size:14px;color:#0a2617;">
        Your full refund of <strong>₹${amountPaid}</strong> has been initiated and will reflect within <strong>5–7 business days</strong>. We take therapist reliability extremely seriously and this incident has been flagged for review.
      </div>
      <p style="margin-top:20px;color:#4a7c5d;font-size:14px;">Please try booking with another therapist. We're sorry this happened. 💚</p>
    </div>
    ${footer()}`);
  await send(toEmail, '⚠️ Session Cancelled — 100% Refund Issued — ZenMind', html);
}
