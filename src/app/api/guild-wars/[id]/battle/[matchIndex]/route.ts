import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveWarBattle, calculateWarWinner, awardWarRewards, findMvp, type WarMatchResult, type ChampionPick } from '@/lib/guild-war';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; matchIndex: string }> },
) {
  try {
    const user = await requireUser();
    const { id, matchIndex: matchIndexStr } = await params;
    const matchIndex = parseInt(matchIndexStr, 10);

    const war = await prisma.guildWar.findUnique({ where: { id } });
    if (!war) {
      return NextResponse.json({ error: 'War not found' }, { status: 404 });
    }

    if (war.status !== 'active') {
      return NextResponse.json({ error: 'War is not active' }, { status: 400 });
    }

    // Check permission — must be member of either guild
    const membership = await prisma.guildMember.findUnique({
      where: { userId: user.id },
    });
    if (!membership || (membership.guildId !== war.guild1Id && membership.guildId !== war.guild2Id)) {
      return NextResponse.json({ error: 'Not a participant guild member' }, { status: 403 });
    }

    const champions1Ids = war.champions1 as string[];
    const champions2Ids = war.champions2 as string[];
    const existingBattles = war.battles as unknown as WarMatchResult[];

    if (matchIndex < 0 || matchIndex >= war.bestOf) {
      return NextResponse.json({ error: `Match index must be 0-${war.bestOf - 1}` }, { status: 400 });
    }

    if (matchIndex < existingBattles.length) {
      return NextResponse.json({ error: 'This match has already been resolved' }, { status: 400 });
    }

    if (matchIndex > existingBattles.length) {
      return NextResponse.json({ error: 'Resolve previous matches first' }, { status: 400 });
    }

    // Pick champions for this match (cycle if fewer champions than bestOf)
    const c1UserId = champions1Ids[matchIndex % champions1Ids.length];
    const c2UserId = champions2Ids[matchIndex % champions2Ids.length];

    // Fetch champion pets
    const [c1User, c2User] = await Promise.all([
      prisma.user.findUnique({
        where: { id: c1UserId },
        select: { id: true, username: true, pet: { select: { level: true, stage: true, hp: true, atk: true, def: true, spd: true } } },
      }),
      prisma.user.findUnique({
        where: { id: c2UserId },
        select: { id: true, username: true, pet: { select: { level: true, stage: true, hp: true, atk: true, def: true, spd: true } } },
      }),
    ]);

    if (!c1User?.pet || !c2User?.pet) {
      return NextResponse.json({ error: 'Champion pet data missing' }, { status: 400 });
    }

    const champion1: ChampionPick = {
      userId: c1User.id,
      username: c1User.username,
      level: c1User.pet.level,
      stage: c1User.pet.stage,
      hp: c1User.pet.hp,
      atk: c1User.pet.atk,
      def: c1User.pet.def,
      spd: c1User.pet.spd,
    };

    const champion2: ChampionPick = {
      userId: c2User.id,
      username: c2User.username,
      level: c2User.pet.level,
      stage: c2User.pet.stage,
      hp: c2User.pet.hp,
      atk: c2User.pet.atk,
      def: c2User.pet.def,
      spd: c2User.pet.spd,
    };

    // Resolve the battle
    const result = resolveWarBattle(champion1, champion2);

    const matchResult: WarMatchResult = {
      matchIndex,
      champion1,
      champion2,
      winner: result.winner,
      champion1RemainingHp: result.c1Hp,
      champion2RemainingHp: result.c2Hp,
      rounds: result.rounds,
    };

    const updatedBattles = [...existingBattles, matchResult];

    // Calculate scores
    const { winner, score1, score2, totalHp1, totalHp2 } = calculateWarWinner(updatedBattles);
    const allDone = updatedBattles.length >= war.bestOf;

    // Build update data
    const updateData: Record<string, unknown> = {
      battles: updatedBattles,
      score1,
      score2,
    };

    if (allDone) {
      // Determine winner guild
      const winnerGuildId = winner === 1 ? war.guild1Id : war.guild2Id;

      // Find MVP
      const mvp = findMvp(updatedBattles);
      const allParticipantIds = [
        ...champions1Ids,
        ...champions2Ids,
      ];

      // Award rewards in transaction
      const rewardPlan = awardWarRewards(id, winnerGuildId, mvp?.userId || '', allParticipantIds);

      await prisma.$transaction(async (tx) => {
        // Update war as finished
        await tx.guildWar.update({
          where: { id },
          data: {
            ...updateData,
            status: 'finished',
            winnerGuildId,
            finishedAt: new Date(),
          },
        });

        // Award guild XP
        await tx.guild.update({
          where: { id: rewardPlan.guildId },
          data: { xp: { increment: rewardPlan.guildXp } },
        });

        // Award MVP XP
        if (rewardPlan.mvpUserId) {
          await tx.pet.update({
            where: { userId: rewardPlan.mvpUserId },
            data: { xp: { increment: rewardPlan.mvpXp } },
          });
          await tx.activity.create({
            data: {
              userId: rewardPlan.mvpUserId,
              type: 'guild_war',
              description: `MVP of guild war! +${rewardPlan.mvpXp} XP`,
              xpEarned: rewardPlan.mvpXp,
            },
          });
        }

        // Award participant XP
        for (const pid of rewardPlan.participantUserIds) {
          if (pid === rewardPlan.mvpUserId) continue; // MVP already got XP
          await tx.pet.update({
            where: { userId: pid },
            data: { xp: { increment: rewardPlan.participantXp } },
          });
          await tx.activity.create({
            data: {
              userId: pid,
              type: 'guild_war',
              description: `Participated in guild war. +${rewardPlan.participantXp} XP`,
              xpEarned: rewardPlan.participantXp,
            },
          });
        }
      });

      const finalWar = await prisma.guildWar.findUnique({
        where: { id },
        include: {
          guild1: { select: { id: true, name: true } },
          guild2: { select: { id: true, name: true } },
          winnerGuild: { select: { id: true, name: true } },
        },
      });

      return NextResponse.json({
        war: finalWar,
        match: matchResult,
        warFinished: true,
        winner: winner === 1 ? 'guild1' : 'guild2',
        mvp: mvp,
        rewards: {
          guildXp: 1000,
          mvpXp: 100,
          participantXp: 50,
        },
      });
    }

    // Not finished — just update battles and scores
    const updatedWar = await prisma.guildWar.update({
      where: { id },
      data: updateData,
      include: {
        guild1: { select: { id: true, name: true } },
        guild2: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      war: updatedWar,
      match: matchResult,
      warFinished: false,
      currentScore: `${score1}-${score2}`,
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
