'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Download, Trash2, Badge as BadgeIcon } from 'lucide-react';

interface ProfileUser {
  email: string;
  displayName: string;
  uiLocale: string;
  learningGoal: string;
  studyFrequency: number;
  plan: string;
}

export function ProfileView({
  locale,
  user,
}: {
  locale: string;
  user: ProfileUser;
}) {
  const t = useTranslations('profile');
  const tc = useTranslations('common');
  const { toast } = useToast();
  const router = useRouter();
  const { update } = useSession() || {};

  const [displayName, setDisplayName] = useState(user.displayName);
  const [uiLocale, setUiLocale] = useState(user.uiLocale);
  const [learningGoal, setLearningGoal] = useState(user.learningGoal);
  const [studyFrequency, setStudyFrequency] = useState(String(user.studyFrequency));
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          uiLocale,
          learningGoal,
          studyFrequency: Number(studyFrequency),
        }),
      });
      if (!res.ok) throw new Error();
      toast({ description: t('saved') });
      if (update) await update({ uiLocale, displayName });
      router.refresh();
    } catch {
      toast({ description: tc('error'), variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    setSavingPassword(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) throw new Error();
      toast({ description: t('passwordChanged') });
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      toast({ description: tc('error'), variant: 'destructive' });
    } finally {
      setSavingPassword(false);
    }
  };

  const exportData = () => {
    const a = document.createElement('a');
    a.href = '/api/profile/export';
    a.download = 'nederstart-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch('/api/profile', { method: 'DELETE' });
      if (!res.ok) throw new Error();
      await signOut({ callbackUrl: `/${locale}` });
    } catch {
      toast({ description: tc('error'), variant: 'destructive' });
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 font-display text-3xl font-bold tracking-tight">
        {t('title')}
      </h1>

      {/* Account */}
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">{t('account')}</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label>{t('email')}</Label>
            <Input value={user.email} disabled className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="displayName">{t('displayName')}</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BadgeIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t('plan')}:</span>
            <span className="font-medium capitalize">{user.plan}</span>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="mt-4 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">{t('preferences')}</h2>
        <div className="space-y-4">
          <div>
            <Label>{t('uiLocale')}</Label>
            <Select value={uiLocale} onValueChange={setUiLocale}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="learningGoal">{t('learningGoal')}</Label>
            <Input
              id="learningGoal"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="studyFrequency">{t('studyFrequency')} ({tc('minutes')})</Label>
            <Input
              id="studyFrequency"
              type="number"
              min={5}
              max={120}
              value={studyFrequency}
              onChange={(e) => setStudyFrequency(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
        <Button className="mt-5" onClick={saveProfile} disabled={savingProfile}>
          {t('save')}
        </Button>
      </section>

      {/* Change password */}
      <section className="mt-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">{t('changePassword')}</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="newPassword">{t('newPassword')}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
        <Button
          className="mt-5"
          variant="secondary"
          onClick={changePassword}
          disabled={savingPassword || !currentPassword || !newPassword}
        >
          {t('changePassword')}
        </Button>
      </section>

      {/* Danger zone */}
      <section className="mt-4 rounded-2xl border border-destructive/30 bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-destructive">{t('dangerZone')}</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-1.5 h-4 w-4" />
            {t('exportData')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/5">
                <Trash2 className="mr-1.5 h-4 w-4" />
                {t('deleteAccount')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('deleteAccount')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('deleteConfirm')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t('deleteAccount')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
}
