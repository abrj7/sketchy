import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string, name: string) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Sketchy <onboarding@resend.dev>', // Use verified domain in production
            to: [email],
            subject: 'Verify your email for Sketchy',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Sketchy!</h2>
          <p>Hi ${name},</p>
          <p>Please verify your email address to get started by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #00d2be; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${verificationUrl}" style="color: #00d2be;">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The Sketchy Team</p>
        </div>
      `,
        });

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}
