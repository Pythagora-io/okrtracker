import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Edit } from 'lucide-react';
import { UserRole, User } from '../../../shared/types/user';

interface EditUserDialogProps {
  user: User;
  onUpdate: (userId: string, data: { role?: UserRole; teamId?: string; name?: string }) => void;
  teams: Array<{ _id: string; name: string }>;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, onUpdate, teams }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [role, setRole] = useState<UserRole>(user.role);
  const [teamId, setTeamId] = useState<string>(user.teamId || '');

  useEffect(() => {
    if (open) {
      setName(user.name || '');
      setRole(user.role);
      setTeamId(user.teamId || '');
    }
  }, [open, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: { role?: UserRole; teamId?: string; name?: string } = {};

    if (name !== user.name) {
      updates.name = name;
    }

    if (role !== user.role) {
      updates.role = role;
    }

    // Update teamId only if role is IC
    if (role === UserRole.IC) {
      if (teamId !== user.teamId) {
        updates.teamId = teamId || undefined;
      }
    } else if (user.teamId) {
      // If changing from IC to Manager/Admin, clear teamId
      updates.teamId = undefined;
    }

    onUpdate(user._id, updates);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="User name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
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
                  <SelectValue placeholder="Select a team (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No team</SelectItem>
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
            <Button type="submit">Update User</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
