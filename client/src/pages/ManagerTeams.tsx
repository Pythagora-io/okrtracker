import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Team } from '../../../shared/types/user';
import { getTeamsByManager } from '@/api/teams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { Users, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ManagerTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      // In real implementation, get current user ID from auth context
      const managerId = '2'; // Mock manager ID
      const data = await getTeamsByManager(managerId);
      setTeams((data as any).teams);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Teams</h1>
        <p className="text-muted-foreground mt-1">View and manage your teams</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card
            key={team._id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => navigate(`/manager/team/${team._id}`)}
          >
            <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {team.name}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Team Members</span>
                  <Badge variant="secondary">{team.icIds.length} ICs</Badge>
                </div>
                {team.ics && team.ics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {team.ics.slice(0, 3).map((ic) => (
                      <Badge key={ic._id} variant="outline" className="text-xs">
                        {ic.name || ic.email.split('@')[0]}
                      </Badge>
                    ))}
                    {team.ics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{team.ics.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teams.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams assigned</h3>
            <p className="text-muted-foreground">
              You don't have any teams assigned yet. Contact your administrator.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};