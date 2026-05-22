// Battle engine — pure functions, no DB calls

export type BattleAction = 'attack' | 'defend' | 'special' | 'flee';

export interface BattleStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface FighterState {
  currentHp: number;
  maxHp: number;
  defending: boolean; // true if this fighter used Defend this turn
}

export interface TurnInput {
  challengerStats: BattleStats;
  opponentStats: BattleStats;
  challengerAction: BattleAction;
  opponentAction: BattleAction;
  challengerState: FighterState;
  opponentState: FighterState;
}

export interface TurnEvent {
  actor: 'challenger' | 'opponent';
  action: BattleAction;
  damage?: number;
  selfDamage?: number;
  success?: boolean;
  message: string;
  critical?: boolean;
}

export interface TurnResult {
  turn: number;
  events: TurnEvent[];
  challengerState: FighterState;
  opponentState: FighterState;
  winnerId: string | null; // null = no winner yet
  ended: boolean;
  fleeSuccess?: boolean;
}

const MAX_TURNS = 20;
const SPECIAL_HP_COST_PCT = 0.20;
const FLEE_BASE_CHANCE = 0.50;
const FLEE_SPD_BONUS = 0.05;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function calculateDamage(
  attackerAtk: number,
  defenderDef: number,
  action: BattleAction,
  defenderIsDefending: boolean,
): number {
  let baseDamage: number;
  let effectiveDef = defenderDef;

  if (defenderIsDefending) {
    effectiveDef = defenderDef * 2;
  }

  switch (action) {
    case 'attack':
      baseDamage = Math.max(1, attackerAtk - effectiveDef * 0.5);
      baseDamage *= randomBetween(0.8, 1.2);
      break;
    case 'special':
      // Ignores 50% of DEF
      baseDamage = attackerAtk * 1.5 * randomBetween(0.9, 1.1);
      effectiveDef = defenderDef * 0.5;
      if (defenderIsDefending) effectiveDef = defenderDef; // defending still helps
      baseDamage = Math.max(1, baseDamage - effectiveDef * 0.5);
      break;
    default:
      baseDamage = 0;
  }

  // Critical hit chance (10%, 1.5x damage)
  let critical = false;
  if ((action === 'attack' || action === 'special') && Math.random() < 0.10) {
    baseDamage *= 1.5;
    critical = true;
  }

  // Defend halves incoming damage
  if (defenderIsDefending && (action === 'attack' || action === 'special')) {
    baseDamage *= 0.5;
  }

  return { damage: Math.max(1, Math.round(baseDamage)), critical } as any;
}

export function calculateDamageWithCrit(
  attackerAtk: number,
  defenderDef: number,
  action: BattleAction,
  defenderIsDefending: boolean,
): { damage: number; critical: boolean } {
  let effectiveDef = defenderDef;

  if (defenderIsDefending) {
    effectiveDef = defenderDef * 2;
  }

  let baseDamage: number;

  switch (action) {
    case 'attack':
      baseDamage = Math.max(1, attackerAtk - effectiveDef * 0.5);
      baseDamage *= randomBetween(0.8, 1.2);
      break;
    case 'special':
      effectiveDef = defenderDef * 0.5;
      if (defenderIsDefending) effectiveDef = defenderDef;
      baseDamage = attackerAtk * 1.5 * randomBetween(0.9, 1.1);
      baseDamage = Math.max(1, baseDamage - effectiveDef * 0.5);
      break;
    default:
      baseDamage = 0;
  }

  let critical = false;
  if ((action === 'attack' || action === 'special') && Math.random() < 0.10) {
    baseDamage *= 1.5;
    critical = true;
  }

  if (defenderIsDefending && (action === 'attack' || action === 'special')) {
    baseDamage *= 0.5;
  }

  return { damage: Math.max(1, Math.round(baseDamage)), critical };
}

export function calculateFleeChance(spd: number, opponentSpd: number): number {
  const diff = spd - opponentSpd;
  return Math.min(0.95, Math.max(0.05, FLEE_BASE_CHANCE + diff * FLEE_SPD_BONUS));
}

function resolveAction(
  actor: 'challenger' | 'opponent',
  action: BattleAction,
  actorStats: BattleStats,
  opponentStats: BattleStats,
  actorState: FighterState,
  opponentState: FighterState,
): { event: TurnEvent; newActorState: FighterState; newOpponentState: FighterState; fleeSuccess?: boolean } {
  switch (action) {
    case 'attack': {
      const { damage, critical } = calculateDamageWithCrit(actorStats.atk, opponentStats.def, 'attack', opponentState.defending);
      const newOpponentHp = Math.max(0, opponentState.currentHp - damage);
      return {
        event: {
          actor,
          action: 'attack',
          damage,
          critical,
          message: critical
            ? `${actor} attacks for ${damage} damage! CRITICAL HIT!`
            : `${actor} attacks for ${damage} damage!`,
        },
        newActorState: { ...actorState, defending: false },
        newOpponentState: { ...opponentState, currentHp: newOpponentHp, defending: false },
      };
    }
    case 'defend': {
      return {
        event: {
          actor,
          action: 'defend',
          message: `${actor} raises their guard! DEF doubled this turn.`,
        },
        newActorState: { ...actorState, defending: true },
        newOpponentState: { ...opponentState, defending: false },
      };
    }
    case 'special': {
      const hpCost = Math.round(actorState.maxHp * SPECIAL_HP_COST_PCT);
      const newActorHp = Math.max(1, actorState.currentHp - hpCost);
      const { damage, critical } = calculateDamageWithCrit(actorStats.atk, opponentStats.def, 'special', opponentState.defending);
      const newOpponentHp = Math.max(0, opponentState.currentHp - damage);
      return {
        event: {
          actor,
          action: 'special',
          damage,
          selfDamage: hpCost,
          critical,
          message: critical
            ? `${actor} unleashes a special attack for ${damage} damage! (-${hpCost} HP) CRITICAL!`
            : `${actor} unleashes a special attack for ${damage} damage! (-${hpCost} HP)`,
        },
        newActorState: { ...actorState, currentHp: newActorHp, defending: false },
        newOpponentState: { ...opponentState, currentHp: newOpponentHp, defending: false },
      };
    }
    case 'flee': {
      const chance = calculateFleeChance(actorStats.spd, opponentStats.spd);
      const success = Math.random() < chance;
      return {
        event: {
          actor,
          action: 'flee',
          success,
          message: success
            ? `${actor} fled the battle!`
            : `${actor} tried to flee but failed!`,
        },
        newActorState: { ...actorState, defending: false },
        newOpponentState: { ...opponentState, defending: false },
        fleeSuccess: success,
      };
    }
  }
}

export function resolveTurn(input: TurnInput & { turn: number }): TurnResult {
  const {
    challengerStats,
    opponentStats,
    challengerAction,
    opponentAction,
    challengerState,
    opponentState,
    turn,
  } = input;

  const events: TurnEvent[] = [];
  let cState = { ...challengerState };
  let oState = { ...opponentState };

  // Determine order by SPD (higher goes first)
  const challengerFirst = challengerStats.spd >= opponentStats.spd;

  const order: ('challenger' | 'opponent')[] = challengerFirst
    ? ['challenger', 'opponent']
    : ['opponent', 'challenger'];

  for (const actor of order) {
    const action = actor === 'challenger' ? challengerAction : opponentAction;
    const actorStats = actor === 'challenger' ? challengerStats : opponentStats;
    const defStats = actor === 'challenger' ? opponentStats : challengerStats;
    const actorState = actor === 'challenger' ? cState : oState;
    const defState = actor === 'challenger' ? oState : cState;

    // Skip if actor is already dead
    if (actorState.currentHp <= 0) continue;

    const result = resolveAction(actor, action, actorStats, defStats, actorState, defState);
    events.push(result.event);

    if (actor === 'challenger') {
      cState = result.newActorState;
      oState = result.newOpponentState;
    } else {
      oState = result.newActorState;
      cState = result.newOpponentState;
    }

    // Check flee
    if (result.fleeSuccess) {
      return {
        turn,
        events,
        challengerState: cState,
        opponentState: oState,
        winnerId: null, // flee = other player wins
        ended: true,
        fleeSuccess: true,
      };
    }
  }

  // Check for winner
  let winnerId: string | null = null;
  let ended = false;

  if (cState.currentHp <= 0 && oState.currentHp <= 0) {
    // Draw — challenger wins by default
    ended = true;
    winnerId = 'draw';
  } else if (cState.currentHp <= 0) {
    ended = true;
    winnerId = 'opponent';
  } else if (oState.currentHp <= 0) {
    ended = true;
    winnerId = 'challenger';
  } else if (turn >= MAX_TURNS) {
    ended = true;
    // Higher HP% wins
    const cPct = cState.currentHp / cState.maxHp;
    const oPct = oState.currentHp / oState.maxHp;
    if (cPct > oPct) winnerId = 'challenger';
    else if (oPct > cPct) winnerId = 'opponent';
    else winnerId = 'draw';
  }

  return {
    turn,
    events,
    challengerState: cState,
    opponentState: oState,
    winnerId,
    ended,
  };
}

export function initFighterState(maxHp: number): FighterState {
  return {
    currentHp: maxHp,
    maxHp,
    defending: false,
  };
}

export { MAX_TURNS };
