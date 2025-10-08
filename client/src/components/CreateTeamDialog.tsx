import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Users } from 'lucide-react';
import { User, UserRole } from '../../../shared/types/user';
import { Checkbox } from './ui/checkbox';

interface CreateTeamDialogProps {
  onCreateTeam: (name: string, managerId: string, icIds: string[]) => void;
  managers: User[];
  ics: User[];
}

export const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({
  onCreateTeam,
  managers,
  ics
}) => {
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [managerId, setManagerId] = useState('');
  const [selectedICs, setSelectedICs] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName && managerId) {
      onCreateTeam(teamName, managerId, selectedICs);
      setTeamName('');
      setManagerId('');
      setSelectedICs([]);
      setOpen(false);
    }
  };

  const toggleIC = (icId: string) => {
    setSelectedICs(prev =>
      prev.includes(icId)
        ? prev.filter(id => id !== icId)
        : [...prev, icId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Users className="h-4 w-4" />
          Create New Team
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager">Assign Manager</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger id="manager">
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                {managers.map((manager) => (
                  <SelectItem key={manager._id} value={manager._id}>
                    {manager.name || manager.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Add ICs</Label>
            <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto space-y-2">
              {ics.length === 0 ? (
                <p className="text-sm text-muted-foreground">No ICs available</p>
              ) : (
                ics.map((ic) => (
                  <div key={ic._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={ic._id}
                      checked={selectedICs.includes(ic._id)}
                      onCheckedChange={() => toggleIC(ic._id)}
                    />
                    <label
                      htmlFor={ic._id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {ic.name || ic.email}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Team</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};