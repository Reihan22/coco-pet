import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Mining rate: base 1 token/hour, +0.5 per mark level
function calcMiningRate(level: number): number {
  return 1 + (level - 1) * 0.5;
}

// Claim mined tokens based on time elapsed
export async function POST() {
  const user = await requireUser();
  const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) return NextResponse.json({ error: 'No bot found' }, { status: 404 });

  const now = new Date();
  const lastMined = pet.lastMinedAt || pet.createdAt;
  const hoursElapsed = Math.max(0, (now.getTime() - lastMined.getTime()) / (1000 * 60 * 60));

  const miningRate = calcMiningRate(pet.level);
  const tokensMined = Math.floor(hoursElapsed * miningRate);

  if (tokensMined <= 0) {
    return NextResponse.json({
      mined: 0,
      balance: user.tokens,
      rate: miningRate,
      nextClaimIn: Math.ceil((1 - (hoursElapsed % 1)) * 60), // minutes until next token
      message: 'No tokens mined yet. Keep coding!',
    });
  }

  // Cap at 72 hours worth (3 days idle max)
  const cappedTokens = Math.min(tokensMined, Math.floor(72 * miningRate));

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { tokens: { increment: cappedTokens } },
    }),
    prisma.pet.update({
      where: { userId: user.id },
      data: { lastMinedAt: now },
    }),
    prisma.tokenTransaction.create({
      data: {
        userId: user.id,
        amount: cappedTokens,
        type: 'mining',
        description: `Mined ${cappedTokens} tokens (${hoursElapsed.toFixed(1)}h × ${miningRate}/h)`,
      },
    }),
  ]);

  return NextResponse.json({
    mined: cappedTokens,
    balance: updatedUser.tokens,
    rate: miningRate,
    hoursElapsed: Math.min(hoursElapsed, 72).toFixed(1),
  });
}

// Get mining status
export async function GET() {
  const user = await requireUser();
  const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) return NextResponse.json({ error: 'No bot found' }, { status: 404 });

  const now = new Date();
  const lastMined = pet.lastMinedAt || pet.createdAt;
  const hoursElapsed = (now.getTime() - lastMined.getTime()) / (1000 * 60 * 60);
  const miningRate = calcMiningRate(pet.level);
  const pendingTokens = Math.min(Math.floor(hoursElapsed * miningRate), Math.floor(72 * miningRate));

  return NextResponse.json({
    balance: user.tokens,
    rate: miningRate,
    pending: pendingTokens,
    lastMinedAt: lastMined.toISOString(),
  });
}
