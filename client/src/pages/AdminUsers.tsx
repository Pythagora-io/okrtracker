import React, { useEffect, useState } from 'react';
import { User, Team, UserRole } from '../../../shared/types/user';
import { getUsers, inviteUser } from '@/api/users';
import { getTeams, createTeam } from '@/api/teams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { InviteUserDialog } from '@/components/InviteUserDialog';
import { CreateTeamDialog } from '@/components/CreateTeamDialog';
import { Users as UsersIcon, Mail, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, teamsData] = await Promise.all([
        getUsers(),
        getTeams()
      ]);
      setUsers((usersData as any).users);
      setTeams((teamsData as any).teams);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (email: string, role: UserRole, teamId?: string) => {
    try {
      await inviteUser({ email, role, teamId });
      toast({
        title: 'Success',
        description: 'User invitation sent successfully'
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleCreateTeam = async (name: string, managerId: string, icIds: string[]) => {
    try {
      await createTeam({ name, managerId, icIds });
      toast({
        title: 'Success',
        description: 'Team created successfully'
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-500';
      case UserRole.MANAGER:
        return 'bg-blue-500';
      case UserRole.IC:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const managers = users.filter(u => u.role === UserRole.MANAGER);
  const ics = users.filter(u => u.role === UserRole.IC && !u.teamId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage users and teams</p>
        </div>
        <div className="flex gap-3">
          <InviteUserDialog onInvite={handleInviteUser} teams={teams} />
          <CreateTeamDialog
            onCreateTeam={handleCreateTeam}
            managers={managers}
            ics={ics}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              All Users
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name || user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Teams
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team._id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{team.name}</h3>
                    <Badge variant="outline">{team.icIds.length} ICs</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manager: {team.managerName || 'Not assigned'}
                  </p>
                  {team.ics && team.ics.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {team.ics.map((ic) => (
                        <Badge key={ic._id} variant="secondary" className="text-xs">
                          {ic.name || ic.email}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};