import nodemailer from 'nodemailer';

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || '"Fordo App" <noreply@example.com>';

  // Check if SMTP is configured with actual non-placeholder values
  const isSmtpConfigured = 
    host && 
    host !== 'smtp.example.com' && 
    user && 
    user !== 'your-smtp-username' && 
    pass && 
    pass !== 'your-smtp-password';

  if (!isSmtpConfigured) {
    console.log('\n==================================================');
    console.log('📬 [EMAIL SIMULATOR - SMTP NOT CONFIGURED]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Content:\n${html}`);
    console.log('==================================================\n');
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log(`✉️ [EMAIL SENT] MessageId: ${info.messageId}`);
    return { success: true, info };
  } catch (error) {
    console.error('❌ [EMAIL ERROR] Failed to send email:', error);
    throw error;
  }
}
