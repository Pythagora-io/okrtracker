import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UserPlus } from 'lucide-react';
import { UserRole } from '../../../shared/types/user';

interface InviteUserDialogProps {
  onInvite: (email: string, role: UserRole, teamId?: string) => void;
  teams: Array<{ _id: string; name: string }>;
}

export const InviteUserDialog: React.FC<InviteUserDialogProps> = ({ onInvite, teams }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.IC);
  const [teamId, setTeamId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && role) {
      onInvite(email, role, role === UserRole.IC ? teamId : undefined);
      setEmail('');
      setRole(UserRole.IC);
      setTeamId('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                <SelectItem value={UserRole.IC}>IC (Individual Contributor)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === UserRole.IC && (
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger id="team">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Send Invite</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};