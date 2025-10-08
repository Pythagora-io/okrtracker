import { randomBytes } from 'crypto';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import emailService from './emailService';

interface InviteUserData {
  email: string;
  role: string;
  teamId?: string;
  invitedBy: string;
}

class InviteService {
  static generateInviteToken(): string {
    return randomBytes(32).toString('hex');
  }

  static async createInvite({ email, role, teamId, invitedBy }: InviteUserData): Promise<IUser> {
    if (!email) throw new Error('Email is required');
    if (!role) throw new Error('Role is required');
    if (!invitedBy) throw new Error('InvitedBy is required');

    try {
      console.log(`Creating invite for email: ${email} with role: ${role}`);

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Verify inviter exists
      const inviter = await User.findById(invitedBy);
      if (!inviter) {
        throw new Error('Inviter not found');
      }

      // Generate invite token (valid for 7 days)
      const inviteToken = this.generateInviteToken();
      const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Create user with temporary password (will be set during signup)
      const temporaryPassword = randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      const userData: Partial<IUser> = {
        email,
        password: hashedPassword,
        role,
        inviteToken,
        inviteExpires,
        invitedBy: new mongoose.Types.ObjectId(invitedBy),
        isActive: false, // User is not active until they complete signup
      };

      if (teamId) {
        userData.teamId = new mongoose.Types.ObjectId(teamId);
      }

      const user = new User(userData);

      await user.save();

      console.log(`Successfully created invite for ${email} with token ${inviteToken}`);

      // Send invite email
      try {
        await emailService.sendInviteEmail(email, role, inviteToken);
      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
        console.error('Failed to send invite email, but user was created:', errorMessage);
        // Don't throw - user was created successfully, email is just a notification
        console.log(`Invite link (email failed): ${process.env.FRONTEND_URL || 'http://localhost:5173'}/setup-password?token=${inviteToken}`);
      }

      return user;
    } catch (err) {
      console.error('Error creating invite:', err);
      throw new Error(`Error while creating invite: ${err}`);
    }
  }

  static async getInviteByToken(token: string): Promise<IUser | null> {
    try {
      console.log(`Looking up invite with token: ${token}`);

      const user = await User.findOne({
        inviteToken: token,
        inviteExpires: { $gt: new Date() },
      });

      if (!user) {
        console.log('Invite not found or expired');
        return null;
      }

      console.log(`Found valid invite for ${user.email}`);
      return user;
    } catch (err) {
      console.error('Error getting invite by token:', err);
      throw new Error(`Error while getting invite: ${err}`);
    }
  }

  static async completeInviteSignup(token: string, password: string, name?: string): Promise<IUser> {
    if (!token) throw new Error('Invite token is required');
    if (!password) throw new Error('Password is required');

    try {
      console.log(`Completing invite signup for token: ${token}`);

      const user = await this.getInviteByToken(token);
      if (!user) {
        throw new Error('Invalid or expired invite token');
      }

      // Set password
      user.password = await bcrypt.hash(password, 10);

      // Update user details
      if (name) {
        user.name = name;
      }
      user.isActive = true;
      user.inviteToken = undefined;
      user.inviteExpires = undefined;

      await user.save();

      console.log(`Successfully completed signup for ${user.email}`);
      return user;
    } catch (err) {
      console.error('Error completing invite signup:', err);
      throw new Error(`Error while completing signup: ${err}`);
    }
  }

  static async resendInvite(userId: string): Promise<IUser> {
    try {
      console.log(`Resending invite for user ID: ${userId}`);

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isActive) {
        throw new Error('User is already active');
      }

      // Generate new token and expiry
      user.inviteToken = this.generateInviteToken();
      user.inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await user.save();

      console.log(`Successfully resent invite for ${user.email}`);

      // Send invite email
      try {
        await emailService.sendInviteEmail(user.email, user.role, user.inviteToken!);
      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
        console.error('Failed to send invite email:', errorMessage);
        // Don't throw - just log the link
        console.log(`Invite link (email failed): ${process.env.FRONTEND_URL || 'http://localhost:5173'}/setup-password?token=${user.inviteToken}`);
      }

      return user;
    } catch (err) {
      console.error('Error resending invite:', err);
      throw new Error(`Error while resending invite: ${err}`);
    }
  }
}

export default InviteService;
