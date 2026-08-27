import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedA0Content } from './seed-content';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Hidden test admin account (mandatory) ---
  const testEmail = 'abacus-76ed6a53@example.com';
  const testPassword = 'YKBcOwU7#0';
  const hashedTestPassword = await bcrypt.hash(testPassword, 12);

  await prisma.user.upsert({
    where: { email: testEmail },
    update: {
      hashedPassword: hashedTestPassword,
      role: 'admin',
      onboardingCompleted: true,
    },
    create: {
      email: testEmail,
      hashedPassword: hashedTestPassword,
      displayName: 'Admin',
      role: 'admin',
      onboardingCompleted: true,
      uiLocale: 'en',
    },
  });

  // --- Plans ---
  await prisma.plan.upsert({
    where: { code: 'free' },
    update: {},
    create: {
      code: 'free',
      priceMonthlyEur: 0,
      priceYearlyEur: 0,
      isActive: true,
    },
  });

  await prisma.plan.upsert({
    where: { code: 'plus' },
    update: {},
    create: {
      code: 'plus',
      priceMonthlyEur: 9.99,
      priceYearlyEur: 89.99,
      isActive: true,
    },
  });

  await prisma.plan.upsert({
    where: { code: 'pro' },
    update: {},
    create: {
      code: 'pro',
      priceMonthlyEur: 19.99,
      priceYearlyEur: 179.99,
      isActive: true,
    },
  });

  // --- Levels ---
  const levelA0 = await prisma.level.upsert({
    where: { code: 'A0' },
    update: {},
    create: {
      code: 'A0',
      sortOrder: 1,
      isPublished: true,
      xpRequired: 0,
    },
  });

  await prisma.level.upsert({
    where: { code: 'A1' },
    update: {},
    create: { code: 'A1', sortOrder: 2, isPublished: false, xpRequired: 500 },
  });

  await prisma.level.upsert({
    where: { code: 'A2' },
    update: {},
    create: { code: 'A2', sortOrder: 3, isPublished: false, xpRequired: 1500 },
  });

  await prisma.level.upsert({
    where: { code: 'B1' },
    update: {},
    create: { code: 'B1', sortOrder: 4, isPublished: false, xpRequired: 3000 },
  });

  await prisma.level.upsert({
    where: { code: 'B2' },
    update: {},
    create: { code: 'B2', sortOrder: 5, isPublished: false, xpRequired: 5000 },
  });

  // --- Level translations ---
  const levelTranslations = [
    { levelCode: 'A0', locale: 'en', title: 'Absolute Beginner', description: 'First contact with Dutch. Learn basic greetings and essential words.' },
    { levelCode: 'A0', locale: 'pt', title: 'Iniciante Absoluto', description: 'Primeiro contacto com holand\u00eas. Aprenda sauda\u00e7\u00f5es b\u00e1sicas e palavras essenciais.' },
    { levelCode: 'A1', locale: 'en', title: 'Beginner', description: 'Basic daily communication. Simple sentences and common expressions.' },
    { levelCode: 'A1', locale: 'pt', title: 'Iniciante', description: 'Comunica\u00e7\u00e3o di\u00e1ria b\u00e1sica. Frases simples e express\u00f5es comuns.' },
    { levelCode: 'A2', locale: 'en', title: 'Elementary', description: 'Routine tasks and direct exchanges on familiar topics.' },
    { levelCode: 'A2', locale: 'pt', title: 'Elementar', description: 'Tarefas rotineiras e trocas diretas sobre temas familiares.' },
    { levelCode: 'B1', locale: 'en', title: 'Intermediate', description: 'Deal with most situations when travelling in Dutch-speaking regions.' },
    { levelCode: 'B1', locale: 'pt', title: 'Intermedi\u00e1rio', description: 'Lidar com a maioria das situa\u00e7\u00f5es ao viajar em regi\u00f5es de l\u00edngua holandesa.' },
    { levelCode: 'B2', locale: 'en', title: 'Upper Intermediate', description: 'Interact fluently with native speakers and understand complex texts.' },
    { levelCode: 'B2', locale: 'pt', title: 'Intermedi\u00e1rio Superior', description: 'Interagir fluentemente com nativos e compreender textos complexos.' },
  ];

  for (const lt of levelTranslations) {
    const level = await prisma.level.findUnique({ where: { code: lt.levelCode } });
    if (level) {
      await prisma.levelTranslation.upsert({
        where: { levelId_locale: { levelId: level.id, locale: lt.locale } },
        update: { title: lt.title, description: lt.description },
        create: { levelId: level.id, locale: lt.locale, title: lt.title, description: lt.description },
      });
    }
  }

  // --- Achievements ---
  const achievementData = [
    { code: 'first_lesson', icon: '\u2b50', xpBonus: 25, en: { title: 'First Steps', description: 'Completed your first lesson' }, pt: { title: 'Primeiros Passos', description: 'Completou a sua primeira li\u00e7\u00e3o' } },
    { code: 'streak_7', icon: '\ud83d\udd25', xpBonus: 50, en: { title: 'Week Warrior', description: '7-day learning streak' }, pt: { title: 'Guerreiro da Semana', description: 'Sequ\u00eancia de 7 dias de aprendizagem' } },
    { code: 'streak_30', icon: '\ud83c\udfc6', xpBonus: 200, en: { title: 'Monthly Master', description: '30-day learning streak' }, pt: { title: 'Mestre Mensal', description: 'Sequ\u00eancia de 30 dias de aprendizagem' } },
    { code: 'a0_complete', icon: '\ud83c\udf93', xpBonus: 100, en: { title: 'A0 Graduate', description: 'Completed all A0 lessons' }, pt: { title: 'Graduado A0', description: 'Completou todas as li\u00e7\u00f5es A0' } },
  ];

  for (const ach of achievementData) {
    const achievement = await prisma.achievement.upsert({
      where: { code: ach.code },
      update: { icon: ach.icon, xpBonus: ach.xpBonus },
      create: { code: ach.code, icon: ach.icon, xpBonus: ach.xpBonus },
    });

    await prisma.achievementTranslation.upsert({
      where: { achievementId_locale: { achievementId: achievement.id, locale: 'en' } },
      update: { title: ach.en.title, description: ach.en.description },
      create: { achievementId: achievement.id, locale: 'en', title: ach.en.title, description: ach.en.description },
    });

    await prisma.achievementTranslation.upsert({
      where: { achievementId_locale: { achievementId: achievement.id, locale: 'pt' } },
      update: { title: ach.pt.title, description: ach.pt.description },
      create: { achievementId: achievement.id, locale: 'pt', title: ach.pt.title, description: ach.pt.description },
    });
  }

  // --- A0 course content (modules, lessons, vocabulary, exercises) ---
  await seedA0Content(prisma);

  console.log('Database seeded successfully!');
}

main()
  .catch((e: any) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
