import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiChat } from '@/lib/ai';

export async function GET() {
  try {
    const user = await requireUser();
    const pet = await prisma.pet.findUnique({ where: { userId: user.id } });

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentDesc = recentActivities.length > 0
      ? recentActivities.map(a => a.description).join('; ')
      : 'No recent activity';

    const prompt = `You are the onboard AI for a mech robot named ${pet.name}. Give a brief daily status report (3-4 sentences). Include a motivational tip and a suggested action. Pet: Level ${pet.level}, Stage ${pet.stage}, XP ${pet.xp}, Streak ${pet.streakDays} days, Challenges done: ${pet.challengesCompleted}. Recent: ${recentDesc}. Keep under 80 words.`;

    const messages = [
      { role: 'user' as const, content: prompt },
    ];

    const briefing = await aiChat(messages, 200);

    return NextResponse.json({ briefing });
  } catch (err) {
    console.error('Briefing error:', err);
    return NextResponse.json({ error: 'Briefing generation failed' }, { status: 500 });
  }
}
