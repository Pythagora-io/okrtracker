import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Team, User } from '../../../shared/types/user';
import { getTeamById } from '@/api/teams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft, User as UserIcon, ChevronRight, Mail } from 'lucide-react';
import { format } from 'date-fns';

export const ManagerTeamDetail: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (teamId) {
      loadTeam();
    }
  }, [teamId]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const data = await getTeamById(teamId!);
      setTeam((data as { team: Team }).team);
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Error',
        description: err.message,
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

  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Team not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/manager/teams')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          <p className="text-muted-foreground mt-1">Team members and their progress</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(team.icIds) && team.icIds.length > 0 && team.icIds.map((ic: User | string) => {
          // Handle both populated and unpopulated icIds
          if (typeof ic === 'string') return null;

          return (
            <Card
              key={ic._id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => navigate(`/manager/ic/${ic._id}`)}
            >
              <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-base">{ic.name || ic.email.split('@')[0]}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {ic.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last activity: {format(new Date(ic.updatedAt), 'MMM d, yyyy')}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!team.icIds || team.icIds.length === 0) && (
        <Card className="p-12">
          <div className="text-center">
            <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team members</h3>
            <p className="text-muted-foreground">
              This team doesn't have any ICs assigned yet.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};