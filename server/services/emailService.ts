import { ServerClient } from 'postmark';

class EmailService {
  private client: ServerClient | null = null;
  private fromEmail: string = '';
  private frontendUrl: string = '';
  private initialized: boolean = false;

  private initialize() {
    if (this.initialized) return;

    const apiToken = process.env.POSTMARK_API_TOKEN;
    if (!apiToken) {
      console.warn('POSTMARK_API_TOKEN not set. Email sending will be disabled.');
      this.client = null;
    } else {
      this.client = new ServerClient(apiToken);
      console.log('Postmark email service initialized successfully');
    }

    this.fromEmail = process.env.POSTMARK_FROM_EMAIL || 'noreply@okrflow.com';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    this.initialized = true;
  }

  async sendInviteEmail(email: string, role: string, inviteToken: string): Promise<void> {
    // Initialize on first use (lazy initialization)
    this.initialize();

    if (!this.client) {
      console.warn(`Email service disabled. Would have sent invite to ${email}`);
      console.log(`Invite link: ${this.frontendUrl}/setup-password?token=${inviteToken}`);
      return;
    }

    const inviteLink = `${this.frontendUrl}/setup-password?token=${inviteToken}`;

    try {
      console.log(`Sending invite email to ${email} with role ${role}`);

      await this.client.sendEmail({
        From: this.fromEmail,
        To: email,
        Subject: 'You\'ve been invited to OKRFlow',
        HtmlBody: this.getInviteEmailTemplate(email, role, inviteLink),
        TextBody: `You've been invited to join OKRFlow as a ${role}.\n\nClick the link below to set up your account:\n${inviteLink}\n\nThis link will expire in 7 days.\n\nIf you did not expect this invitation, please ignore this email.`,
        MessageStream: 'outbound',
      });

      console.log(`Successfully sent invite email to ${email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error sending invite email to ${email}:`, errorMessage, error);
      throw new Error(`Failed to send invite email: ${errorMessage}`);
    }
  }

  private getInviteEmailTemplate(email: string, role: string, inviteLink: string): string {
    const roleDisplay = role === 'ic' ? 'Individual Contributor' : role.charAt(0).toUpperCase() + role.slice(1);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to OKRFlow</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 32px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #333333;
            font-size: 24px;
            margin: 0 0 20px 0;
          }
          .content p {
            color: #666666;
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 20px 0;
          }
          .role-badge {
            display: inline-block;
            background-color: #667eea;
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
          }
          .button {
            display: inline-block;
            background-color: #667eea;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            margin: 20px 0;
            transition: background-color 0.3s ease;
          }
          .button:hover {
            background-color: #5568d3;
          }
          .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-box p {
            margin: 0;
            color: #555555;
            font-size: 14px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
          }
          .footer p {
            color: #999999;
            font-size: 14px;
            margin: 5px 0;
          }
          .link {
            color: #667eea;
            text-decoration: none;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 OKRFlow</h1>
          </div>

          <div class="content">
            <h2>Welcome to OKRFlow!</h2>

            <p>Hello,</p>

            <p>You've been invited to join OKRFlow, a powerful platform for managing your team's objectives and key results.</p>

            <p>Your role: <span class="role-badge">${roleDisplay}</span></p>

            <p>Click the button below to set up your account and create your password:</p>

            <div style="text-align: center;">
              <a href="${inviteLink}" class="button">Set Up Your Account</a>
            </div>

            <div class="info-box">
              <p><strong>⏰ Note:</strong> This invitation link will expire in 7 days. Please complete your account setup before then.</p>
            </div>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${inviteLink}" class="link">${inviteLink}</a></p>

            <p>If you did not expect this invitation, please ignore this email.</p>
          </div>

          <div class="footer">
            <p><strong>OKRFlow</strong></p>
            <p>Manage your goals, track your progress, achieve success.</p>
            <p style="margin-top: 20px;">© ${new Date().getFullYear()} OKRFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
