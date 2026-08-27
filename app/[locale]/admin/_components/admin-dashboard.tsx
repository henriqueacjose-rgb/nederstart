'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { AdminStats, AdminLevel, AdminUser } from '@/lib/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { SafeDate } from '@/components/safe-format';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Users, BookOpen, GraduationCap, Puzzle, CheckCircle2 } from 'lucide-react';

export function AdminDashboard({
  locale,
  stats,
  content,
  users,
}: {
  locale: string;
  stats: AdminStats;
  content: AdminLevel[];
  users: AdminUser[];
}) {
  const t = useTranslations('admin');
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const togglePublish = async (
    type: 'level' | 'module' | 'lesson',
    id: number,
    isPublished: boolean
  ) => {
    const key = `${type}-${id}`;
    setBusy(key);
    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, isPublished }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast({ description: 'Error', variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const statCards = [
    { icon: <Users className="h-5 w-5 text-primary" />, value: stats.totalUsers, label: t('totalUsers') },
    { icon: <GraduationCap className="h-5 w-5 text-primary" />, value: stats.publishedLessons, label: t('totalLessons') },
    { icon: <BookOpen className="h-5 w-5 text-primary" />, value: stats.totalVocab, label: t('totalVocab') },
    { icon: <Puzzle className="h-5 w-5 text-primary" />, value: stats.totalExercises, label: t('exercises') },
    { icon: <CheckCircle2 className="h-5 w-5 text-primary" />, value: stats.completions, label: t('lessons') },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight">
        {t('title')}
      </h1>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('dashboard')}</TabsTrigger>
          <TabsTrigger value="content">{t('lessons')}</TabsTrigger>
          <TabsTrigger value="users">{t('users')}</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          <h2 className="mb-3 font-semibold">{t('stats')}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {statCards.map((s, i) => (
              <div key={i} className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  {s.icon}
                </div>
                <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Content management */}
        <TabsContent value="content" className="mt-6 space-y-6">
          {content.map((lvl) => (
            <div key={lvl.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                    {lvl.code}
                  </span>
                  <span className="font-semibold">{lvl.title}</span>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  {lvl.isPublished ? t('published') : t('draft')}
                  <Switch
                    checked={lvl.isPublished}
                    disabled={busy === `level-${lvl.id}`}
                    onCheckedChange={(v) => togglePublish('level', lvl.id, v)}
                  />
                </label>
              </div>

              {lvl.modules.map((mod) => (
                <div key={mod.id} className="mt-4 rounded-xl border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {t('modules')} {mod.sortOrder}: {mod.title}
                    </span>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      {mod.isPublished ? t('published') : t('draft')}
                      <Switch
                        checked={mod.isPublished}
                        disabled={busy === `module-${mod.id}`}
                        onCheckedChange={(v) => togglePublish('module', mod.id, v)}
                      />
                    </label>
                  </div>
                  <div className="mt-3 space-y-2">
                    {mod.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm">{lesson.title}</span>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {lesson.lessonCode}
                          </Badge>
                          {lesson.isFree && (
                            <Badge variant="secondary" className="shrink-0 text-xs">
                              Free
                            </Badge>
                          )}
                        </div>
                        <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                          {lesson.isPublished ? t('published') : t('draft')}
                          <Switch
                            checked={lesson.isPublished}
                            disabled={busy === `lesson-${lesson.id}`}
                            onCheckedChange={(v) =>
                              togglePublish('lesson', lesson.id, v)
                            }
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="mt-6">
          <div className="rounded-2xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users')}</TableHead>
                  <TableHead>{t('title')}</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.displayName || '—'}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.role === 'admin' ? 'default' : 'secondary'}
                        className="text-xs capitalize"
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{u.plan}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      <SafeDate
                        date={u.createdAt}
                        locale={locale === 'pt' ? 'pt-BR' : 'en-US'}
                        options={{ year: 'numeric', month: 'short', day: 'numeric' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
