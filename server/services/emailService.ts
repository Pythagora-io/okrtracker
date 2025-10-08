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

  async sendGoalsSubmittedEmail(
    managerEmail: string,
    managerName: string,
    icName: string,
    weekStart: Date,
    weekEnd: Date,
    icId: string
  ): Promise<void> {
    this.initialize();

    if (!this.client) {
      console.warn(`Email service disabled. Would have sent goals submitted notification to ${managerEmail}`);
      return;
    }

    const viewLink = `${this.frontendUrl}/manager/ic/${icId}`;

    try {
      console.log(`Sending goals submitted email to ${managerEmail}`);

      await this.client.sendEmail({
        From: this.fromEmail,
        To: managerEmail,
        Subject: `${icName} has submitted their weekly goals`,
        HtmlBody: this.getGoalsSubmittedEmailTemplate(managerName, icName, weekStart, weekEnd, viewLink),
        TextBody: `Hi ${managerName},\n\n${icName} has submitted their goals for the week of ${weekStart.toDateString()} to ${weekEnd.toDateString()}.\n\nView their goals: ${viewLink}\n\nBest regards,\nOKRFlow Team`,
        MessageStream: 'outbound',
      });

      console.log(`Successfully sent goals submitted email to ${managerEmail}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error sending goals submitted email:`, errorMessage, error);
      throw new Error(`Failed to send goals submitted email: ${errorMessage}`);
    }
  }

  async sendResultsSubmittedEmail(
    managerEmail: string,
    managerName: string,
    icName: string,
    weekStart: Date,
    weekEnd: Date,
    icId: string
  ): Promise<void> {
    this.initialize();

    if (!this.client) {
      console.warn(`Email service disabled. Would have sent results submitted notification to ${managerEmail}`);
      return;
    }

    const viewLink = `${this.frontendUrl}/manager/ic/${icId}`;

    try {
      console.log(`Sending results submitted email to ${managerEmail}`);

      await this.client.sendEmail({
        From: this.fromEmail,
        To: managerEmail,
        Subject: `${icName} has submitted their weekly results`,
        HtmlBody: this.getResultsSubmittedEmailTemplate(managerName, icName, weekStart, weekEnd, viewLink),
        TextBody: `Hi ${managerName},\n\n${icName} has submitted their results for the week of ${weekStart.toDateString()} to ${weekEnd.toDateString()}.\n\nView their results: ${viewLink}\n\nBest regards,\nOKRFlow Team`,
        MessageStream: 'outbound',
      });

      console.log(`Successfully sent results submitted email to ${managerEmail}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error sending results submitted email:`, errorMessage, error);
      throw new Error(`Failed to send results submitted email: ${errorMessage}`);
    }
  }

  async sendCommentNotificationEmail(
    recipientEmail: string,
    recipientName: string,
    commenterName: string,
    commentText: string,
    weekStart: Date,
    weekEnd: Date,
    type: 'goal' | 'result',
    icId: string,
    recipientRole: string
  ): Promise<void> {
    this.initialize();

    if (!this.client) {
      console.warn(`Email service disabled. Would have sent comment notification to ${recipientEmail}`);
      return;
    }

    // If recipient is manager, link to IC detail page; if recipient is IC, link to their goals page
    const viewLink = recipientRole === 'manager'
      ? `${this.frontendUrl}/manager/ic/${icId}`
      : `${this.frontendUrl}/ic/goals`;

    try {
      console.log(`Sending comment notification email to ${recipientEmail}`);

      await this.client.sendEmail({
        From: this.fromEmail,
        To: recipientEmail,
        Subject: `${commenterName} commented on your ${type}s`,
        HtmlBody: this.getCommentNotificationEmailTemplate(recipientName, commenterName, commentText, weekStart, weekEnd, type, viewLink),
        TextBody: `Hi ${recipientName},\n\n${commenterName} commented on your ${type}s for the week of ${weekStart.toDateString()} to ${weekEnd.toDateString()}.\n\nComment: "${commentText}"\n\nView and respond: ${viewLink}\n\nBest regards,\nOKRFlow Team`,
        MessageStream: 'outbound',
      });

      console.log(`Successfully sent comment notification email to ${recipientEmail}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error sending comment notification email:`, errorMessage, error);
      throw new Error(`Failed to send comment notification email: ${errorMessage}`);
    }
  }

  async sendReplyNotificationEmail(
    recipientEmail: string,
    recipientName: string,
    replierName: string,
    replyText: string,
    originalComment: string,
    weekStart: Date,
    weekEnd: Date,
    icId: string,
    recipientRole: string
  ): Promise<void> {
    this.initialize();

    if (!this.client) {
      console.warn(`Email service disabled. Would have sent reply notification to ${recipientEmail}`);
      return;
    }

    // If recipient is manager, link to IC detail page; if recipient is IC, link to their goals page
    const viewLink = recipientRole === 'manager'
      ? `${this.frontendUrl}/manager/ic/${icId}`
      : `${this.frontendUrl}/ic/goals`;

    try {
      console.log(`Sending reply notification email to ${recipientEmail}`);

      await this.client.sendEmail({
        From: this.fromEmail,
        To: recipientEmail,
        Subject: `${replierName} replied to your comment`,
        HtmlBody: this.getReplyNotificationEmailTemplate(recipientName, replierName, replyText, originalComment, weekStart, weekEnd, viewLink),
        TextBody: `Hi ${recipientName},\n\n${replierName} replied to your comment for the week of ${weekStart.toDateString()} to ${weekEnd.toDateString()}.\n\nYour comment: "${originalComment}"\nReply: "${replyText}"\n\nView and respond: ${viewLink}\n\nBest regards,\nOKRFlow Team`,
        MessageStream: 'outbound',
      });

      console.log(`Successfully sent reply notification email to ${recipientEmail}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error sending reply notification email:`, errorMessage, error);
      throw new Error(`Failed to send reply notification email: ${errorMessage}`);
    }
  }

  async sendWeeklyGoalReminderEmail(
    icEmail: string,
    icName: string
  ): Promise<void> {
    this.initialize();

    if (!this.client) {
      console.warn(`Email service disabled. Would have sent weekly reminder to ${icEmail}`);
      return;
    }

    const goalsLink = `${this.frontendUrl}/ic/goals`;

    try {
      console.log(`Sending weekly goal reminder email to ${icEmail}`);

      await this.client.sendEmail({
        From: this.fromEmail,
        To: icEmail,
        Subject: 'Time to set your weekly goals',
        HtmlBody: this.getWeeklyReminderEmailTemplate(icName, goalsLink),
        TextBody: `Hi ${icName},\n\nIt's time to set your goals for the upcoming week.\n\nSet your goals: ${goalsLink}\n\nBest regards,\nOKRFlow Team`,
        MessageStream: 'outbound',
      });

      console.log(`Successfully sent weekly reminder email to ${icEmail}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error sending weekly reminder email:`, errorMessage, error);
      throw new Error(`Failed to send weekly reminder email: ${errorMessage}`);
    }
  }

  private getEmailStyles(): string {
    return `
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
      .comment-box {
        background-color: #f8f9fa;
        padding: 16px;
        margin: 20px 0;
        border-radius: 4px;
        border-left: 4px solid #667eea;
      }
      .comment-box p {
        margin: 0;
        color: #333333;
        font-size: 14px;
        font-style: italic;
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
    `;
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
        <style>${this.getEmailStyles()}</style>
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

  private getGoalsSubmittedEmailTemplate(
    managerName: string,
    icName: string,
    weekStart: Date,
    weekEnd: Date,
    viewLink: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Goals Submitted</title>
        <style>${this.getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 OKRFlow</h1>
          </div>

          <div class="content">
            <h2>New Goals Submitted</h2>

            <p>Hi ${managerName},</p>

            <p><strong>${icName}</strong> has submitted their goals for the week of:</p>
            <p><strong>${weekStart.toDateString()} - ${weekEnd.toDateString()}</strong></p>

            <div style="text-align: center;">
              <a href="${viewLink}" class="button">View Goals</a>
            </div>

            <p>Review their goals and provide feedback to help them succeed this week.</p>
          </div>

          <div class="footer">
            <p><strong>OKRFlow</strong></p>
            <p>© ${new Date().getFullYear()} OKRFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getResultsSubmittedEmailTemplate(
    managerName: string,
    icName: string,
    weekStart: Date,
    weekEnd: Date,
    viewLink: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Results Submitted</title>
        <style>${this.getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 OKRFlow</h1>
          </div>

          <div class="content">
            <h2>Weekly Results Submitted</h2>

            <p>Hi ${managerName},</p>

            <p><strong>${icName}</strong> has submitted their results for the week of:</p>
            <p><strong>${weekStart.toDateString()} - ${weekEnd.toDateString()}</strong></p>

            <div style="text-align: center;">
              <a href="${viewLink}" class="button">View Results</a>
            </div>

            <p>Review their accomplishments and provide recognition for their work.</p>
          </div>

          <div class="footer">
            <p><strong>OKRFlow</strong></p>
            <p>© ${new Date().getFullYear()} OKRFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getCommentNotificationEmailTemplate(
    recipientName: string,
    commenterName: string,
    commentText: string,
    weekStart: Date,
    weekEnd: Date,
    type: string,
    viewLink: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Comment</title>
        <style>${this.getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 OKRFlow</h1>
          </div>

          <div class="content">
            <h2>New Comment on Your ${type.charAt(0).toUpperCase() + type.slice(1)}s</h2>

            <p>Hi ${recipientName},</p>

            <p><strong>${commenterName}</strong> commented on your ${type}s for the week of:</p>
            <p><strong>${weekStart.toDateString()} - ${weekEnd.toDateString()}</strong></p>

            <div class="comment-box">
              <p>"${commentText}"</p>
            </div>

            <div style="text-align: center;">
              <a href="${viewLink}" class="button">View & Respond</a>
            </div>
          </div>

          <div class="footer">
            <p><strong>OKRFlow</strong></p>
            <p>© ${new Date().getFullYear()} OKRFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getReplyNotificationEmailTemplate(
    recipientName: string,
    replierName: string,
    replyText: string,
    originalComment: string,
    weekStart: Date,
    weekEnd: Date,
    viewLink: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Reply</title>
        <style>${this.getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 OKRFlow</h1>
          </div>

          <div class="content">
            <h2>New Reply to Your Comment</h2>

            <p>Hi ${recipientName},</p>

            <p><strong>${replierName}</strong> replied to your comment for the week of:</p>
            <p><strong>${weekStart.toDateString()} - ${weekEnd.toDateString()}</strong></p>

            <div class="comment-box">
              <p><strong>Your comment:</strong> "${originalComment}"</p>
            </div>

            <div class="comment-box">
              <p><strong>Reply:</strong> "${replyText}"</p>
            </div>

            <div style="text-align: center;">
              <a href="${viewLink}" class="button">View Conversation</a>
            </div>
          </div>

          <div class="footer">
            <p><strong>OKRFlow</strong></p>
            <p>© ${new Date().getFullYear()} OKRFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWeeklyReminderEmailTemplate(icName: string, goalsLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Goal Reminder</title>
        <style>${this.getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 OKRFlow</h1>
          </div>

          <div class="content">
            <h2>Time to Set Your Weekly Goals</h2>

            <p>Hi ${icName},</p>

            <p>It's time to plan your week and set your goals for success! 🚀</p>

            <p>Take a moment to reflect on:</p>
            <ul>
              <li>What do you want to accomplish this week?</li>
              <li>What are your key priorities?</li>
              <li>How will you measure success?</li>
            </ul>

            <div style="text-align: center;">
              <a href="${goalsLink}" class="button">Set Your Goals</a>
            </div>

            <div class="info-box">
              <p><strong>💡 Tip:</strong> Clear goals lead to better results. Be specific and actionable!</p>
            </div>
          </div>

          <div class="footer">
            <p><strong>OKRFlow</strong></p>
            <p>© ${new Date().getFullYear()} OKRFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
