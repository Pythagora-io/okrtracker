import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { Lock, CheckCircle2 } from 'lucide-react';
import { verifyInviteToken, signupWithInvite } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';

export const SetupPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: '', color: '' };
    if (pwd.length < 6) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
    if (pwd.length < 10) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
    if (pwd.length < 14) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast({
          title: 'Error',
          description: 'Invalid invite link',
          variant: 'destructive'
        });
        navigate('/login');
        return;
      }

      try {
        setVerifying(true);
        const result = await verifyInviteToken(token);
        if (result.valid) {
          setInviteEmail(result.email);
          setInviteRole(result.role);
        } else {
          toast({
            title: 'Error',
            description: 'Invalid or expired invite link',
            variant: 'destructive'
          });
          navigate('/login');
        }
      } catch (error) {
        const err = error as Error;
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive'
        });
        navigate('/login');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive'
      });
      return;
    }

    if (!token) {
      toast({
        title: 'Error',
        description: 'Invalid invite token',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await signupWithInvite(token, password, name);

      // Login the user with auth context
      authLogin(result);

      toast({
        title: 'Success',
        description: 'Account setup complete. Redirecting...'
      });

      setTimeout(() => {
        navigate('/');
      }, 1000);
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

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Verifying invite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Set Your Password</CardTitle>
          <CardDescription className="text-center">
            Complete your account setup for {inviteEmail}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength.strength < 50 ? 'text-red-500' :
                      passwordStrength.strength < 75 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
              {confirmPassword && (
                <div className="flex items-center gap-2 text-xs">
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">Passwords match</span>
                    </>
                  ) : (
                    <span className="text-red-500">Passwords do not match</span>
                  )}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting Password...
                </>
              ) : (
                'Set Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};