import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TRAINING_OPTIONS = {
  overclock: { name: 'Overclock Core', cost: 50, stat: 'atk', boost: 2, desc: '+2 ATK duel boost' },
  firewall: { name: 'Firewall Armor', cost: 75, stat: 'def', boost: 3, desc: '+3 DEF duel boost' },
  turbo: { name: 'Turbo Legs', cost: 100, stat: 'spd', boost: 3, desc: '+3 SPD duel boost' },
  self_repair: { name: 'Self Repair', cost: 200, stat: 'hp', boost: 10, desc: '+10 HP endurance boost' },
} as const;

type TrainingKey = keyof typeof TRAINING_OPTIONS;

export async function GET() {
  const user = await requireUser();
  const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) return NextResponse.json({ error: 'No bot found' }, { status: 404 });

  return NextResponse.json({
    balance: user.tokens,
    skills: pet.skills || [],
    activeSkills: pet.activeSkills || [],
    options: TRAINING_OPTIONS,
  });
}

export async function POST(req: Request) {
  const user = await requireUser();
  const { trainingType } = await req.json() as { trainingType?: TrainingKey };

  if (!trainingType || !TRAINING_OPTIONS[trainingType]) {
    return NextResponse.json({ error: 'Invalid training type' }, { status: 400 });
  }

  const option = TRAINING_OPTIONS[trainingType];
  if (user.tokens < option.cost) {
    return NextResponse.json({ error: 'Not enough tokens', required: option.cost, balance: user.tokens }, { status: 400 });
  }

  const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) return NextResponse.json({ error: 'No bot found' }, { status: 404 });

  const skills = Array.isArray(pet.skills) ? pet.skills as any[] : [];
  if (skills.some((s) => s.id === trainingType)) {
    return NextResponse.json({ error: 'Skill already trained' }, { status: 400 });
  }

  const newSkill = {
    id: trainingType,
    name: option.name,
    stat: option.stat,
    boost: option.boost,
    desc: option.desc,
    trainedAt: new Date().toISOString(),
  };

  const activeSkills = Array.isArray(pet.activeSkills) ? pet.activeSkills as string[] : [];
  const nextActive = [...activeSkills, trainingType].slice(-3); // max 3 active skills

  const statPatch = option.stat === 'atk' ? { atk: { increment: option.boost } }
    : option.stat === 'def' ? { def: { increment: option.boost } }
    : option.stat === 'spd' ? { spd: { increment: option.boost } }
    : { hp: { increment: option.boost } };

  const [updatedUser, updatedPet] = await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { tokens: { decrement: option.cost } } }),
    prisma.pet.update({
      where: { userId: user.id },
      data: {
        skills: [...skills, newSkill],
        activeSkills: nextActive,
        ...statPatch,
      },
    }),
    prisma.tokenTransaction.create({
      data: { userId: user.id, amount: -option.cost, type: 'training', description: `AI Training: ${option.name}` },
    }),
    prisma.activity.create({
      data: { userId: user.id, type: 'training', description: `Trained ${option.name}`, xpEarned: 15 },
    }),
  ]);

  return NextResponse.json({
    success: true,
    balance: updatedUser.tokens,
    skill: newSkill,
    bot: updatedPet,
  });
}
