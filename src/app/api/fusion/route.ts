import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const FUSION_COSTS = { standard: 500, rare: 750, epic: 1000 } as const;
type FusionType = keyof typeof FUSION_COSTS;

// How fusion works: user spends tokens to fuse their bot → stats get a permanent boost
// Self-fusion (no partner) = standard cost, +15% stats
// Partner fusion = both users pay cost, combined stats avg + rare bonus
// Epic fusion: combine two bots at Mk.III+ for massive boost

export async function GET() {
  const user = await requireUser();
  const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) return NextResponse.json({ error: 'No bot found' }, { status: 404 });

  return NextResponse.json({
    balance: user.tokens,
    botLevel: pet.level,
    botStage: pet.stage,
    costs: FUSION_COSTS,
    stats: { hp: pet.hp, atk: pet.atk, def: pet.def, spd: pet.spd },
  });
}

export async function POST(req: Request) {
  const user = await requireUser();
  const { fusionType, partnerUsername } = await req.json() as {
    fusionType?: FusionType;
    partnerUsername?: string;
  };

  if (!fusionType || !FUSION_COSTS[fusionType]) {
    return NextResponse.json({ error: 'Invalid fusion type' }, { status: 400 });
  }

  const cost = FUSION_COSTS[fusionType];
  if (user.tokens < cost) {
    return NextResponse.json({ error: 'Not enough tokens', required: cost, balance: user.tokens }, { status: 400 });
  }

  const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) return NextResponse.json({ error: 'No bot found' }, { status: 404 });

  if (fusionType === 'epic' && pet.level < 15) {
    return NextResponse.json({ error: 'Epic fusion requires Mk.III (level 15+)' }, { status: 400 });
  }

  // Calculate stat boost based on fusion type
  const boostMult = fusionType === 'standard' ? 0.15 : fusionType === 'rare' ? 0.25 : 0.40;
  let bonusHp = Math.floor(pet.hp * boostMult);
  let bonusAtk = Math.floor(pet.atk * boostMult);
  let bonusDef = Math.floor(pet.def * boostMult);
  let bonusSpd = Math.floor(pet.spd * boostMult);

  // Partner fusion: additional +5 to all stats if partner has high level
  let partnerPet = null;
  if (partnerUsername && fusionType !== 'standard') {
    const partner = await prisma.user.findUnique({
      where: { username: partnerUsername },
      include: { pet: true },
    });
    if (!partner?.pet) {
      return NextResponse.json({ error: `Partner "${partnerUsername}" not found or has no bot` }, { status: 400 });
    }
    partnerPet = partner.pet;
    bonusHp += Math.floor(partnerPet.hp * 0.10);
    bonusAtk += Math.floor(partnerPet.atk * 0.10);
    bonusDef += Math.floor(partnerPet.def * 0.10);
    bonusSpd += Math.floor(partnerPet.spd * 0.10);
  }

  const [updatedUser, updatedPet] = await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { tokens: { decrement: cost } } }),
    prisma.pet.update({
      where: { userId: user.id },
      data: {
        hp: { increment: bonusHp },
        atk: { increment: bonusAtk },
        def: { increment: bonusDef },
        spd: { increment: bonusSpd },
        xp: { increment: 100 },
      },
    }),
    prisma.tokenTransaction.create({
      data: {
        userId: user.id,
        amount: -cost,
        type: 'fusion',
        description: `${fusionType} fusion${partnerUsername ? ` with ${partnerUsername}` : ''}`,
      },
    }),
    prisma.activity.create({
      data: {
        userId: user.id,
        type: 'fusion',
        description: `MiMo Fusion Lab: ${fusionType} fusion${partnerUsername ? ` with ${partnerUsername}` : ''} → +${bonusHp}HP +${bonusAtk}ATK +${bonusDef}DEF +${bonusSpd}SPD`,
        xpEarned: 50,
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    balance: updatedUser.tokens,
    fusion: {
      type: fusionType,
      partner: partnerUsername || null,
      bonus: { hp: bonusHp, atk: bonusAtk, def: bonusDef, spd: bonusSpd },
    },
    newStats: { hp: updatedPet.hp, atk: updatedPet.atk, def: updatedPet.def, spd: updatedPet.spd },
    message: `MiMo Fusion complete! +${bonusHp}HP +${bonusAtk}ATK +${bonusDef}DEF +${bonusSpd}SPD`,
  });
}
