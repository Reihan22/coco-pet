import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiChat } from '@/lib/ai';

export async function GET() {
  try {
    const user = await requireUser();
    const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
    if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });

    // Check if today's challenge already exists
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await prisma.challenge.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: today, lt: tomorrow },
        type: 'daily',
      },
    });

    if (existing) {
      return NextResponse.json({ challenge: existing });
    }

    // Generate new daily challenge via AI
    const prompt = `Generate a coding challenge for a level ${pet.level} mech bot. Make it fun and themed around robots/mechs/coding. Return JSON: {"title": "...", "description": "...", "difficulty": "easy|medium|hard", "xpReward": 50-200, "tokenReward": 10-50}. Keep description under 100 words.`;

    const response = await aiChat([{ role: 'user', content: prompt }], 500);
    
    let challengeData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      challengeData = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch {
      challengeData = {
        title: `Daily Mech Challenge #${today.getDate()}`,
        description: `Complete a coding task to boost your mech's power! Today's focus: optimize your bot's combat algorithms.`,
        difficulty: pet.level > 10 ? 'hard' : pet.level > 5 ? 'medium' : 'easy',
        xpReward: 50 + pet.level * 10,
        tokenReward: 10 + pet.level * 5,
      };
    }

    const challenge = await prisma.challenge.create({
      data: {
        userId: user.id,
        title: challengeData.title,
        description: challengeData.description,
        difficulty: challengeData.difficulty || 'medium',
        xpReward: challengeData.xpReward || 100,
        tokenReward: challengeData.tokenReward || 20,
        type: 'daily',
        status: 'active',
      },
    });

    return NextResponse.json({ challenge });
  } catch (err) {
    console.error('Daily challenge error:', err);
    return NextResponse.json({ error: 'Failed to get daily challenge' }, { status: 500 });
  }
}
