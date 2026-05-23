'use client';

import { useState } from 'react';
import { type SkinData } from '@/components/PixelPet';
import SkinPreview from '@/components/SkinPreview';

interface Skin {
  id: string;
  name: string;
  description: string | null;
  category: string;
  rarity: string;
  palette: Record<string, string>;
  accessory: string | null;
  animation: string | null;
  unlockType: string;
  unlockValue: number;
}

interface SkinSelectorProps {
  allSkins: Skin[];
  unlockedSkinIds: Set<string>;
  equippedSkinId: string | null;
  equippedAccessoryId: string | null;
  onEquip: (skinId: string, slot: 'palette' | 'accessory') => void;
  onUnequip: (slot: 'palette' | 'accessory') => void;
}

const rarityColors: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#39ff14',
  rare: '#3b82f6',
  epic: '#b44dff',
  legendary: '#ffd700',
};

function unlockLabel(skin: Skin): string {
  switch (skin.unlockType) {
    case 'level': return `Reach level ${skin.unlockValue}`;
    case 'streak': return `${skin.unlockValue}-day streak`;
    case 'achievement': return `${skin.unlockValue} challenges`;
    case 'battle': return `${skin.unlockValue} duel wins`;
    case 'guild_war': return `${skin.unlockValue} squad wars`;
    case 'special': return 'Special unlock';
    default: return skin.unlockType;
  }
}

export default function SkinSelector({
  allSkins,
  unlockedSkinIds,
  equippedSkinId,
  equippedAccessoryId,
  onEquip,
  onUnequip,
}: SkinSelectorProps) {
  const [filter, setFilter] = useState<'all' | 'palette' | 'accessory'>('all');

  const filtered = allSkins.filter(skin => {
    if (filter === 'all') return true;
    if (filter === 'palette') return skin.category === 'palette' || skin.category === 'both';
    if (filter === 'accessory') return skin.category === 'accessory' || skin.category === 'both';
    return true;
  });

  function getSlot(skin: Skin): 'palette' | 'accessory' {
    if (skin.category === 'palette') return 'palette';
    if (skin.category === 'accessory') return 'accessory';
    if (skin.accessory) return 'accessory';
    return 'palette';
  }

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'palette', 'accessory'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '8px 20px',
              fontFamily: "var(--font-pixel)",
              fontSize: 10,
              background: filter === tab ? '#00ffd5' : '#1a1a2e',
              color: filter === tab ? '#0a0a0f' : '#888',
              border: `1px solid ${filter === tab ? '#00ffd5' : '#333'}`,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'all' ? 'All Skins' : tab === 'palette' ? '🎨 Palettes' : '👑 Accessories'}
          </button>
        ))}
      </div>

      {/* Skin grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {filtered.map(skin => {
          const isUnlocked = unlockedSkinIds.has(skin.id);
          const slot = getSlot(skin);
          const isEquipped = slot === 'palette'
            ? equippedSkinId === skin.id
            : equippedAccessoryId === skin.id;
          const rColor = rarityColors[skin.rarity] ?? '#9ca3af';

          const skinData: SkinData = {
            palette: skin.palette as SkinData['palette'],
            accessory: skin.accessory,
            animation: skin.animation,
          };

          return (
            <div
              key={skin.id}
              onClick={() => {
                if (!isUnlocked) return;
                if (isEquipped) {
                  onUnequip(slot);
                } else {
                  onEquip(skin.id, slot);
                }
              }}
              style={{
                background: isEquipped
                  ? 'rgba(0,255,213,0.1)'
                  : isUnlocked
                    ? '#12121e'
                    : '#0d0d16',
                border: `1px solid ${isEquipped ? '#00ffd5' : '#222'}`,
                borderRadius: 12,
                padding: 16,
                cursor: isUnlocked ? 'pointer' : 'default',
                opacity: isUnlocked ? 1 : 0.5,
                transition: 'all 0.2s',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {/* Rarity badge */}
              <div style={{
                position: 'absolute', top: 8, right: 8,
                fontSize: 8,
                fontFamily: "var(--font-pixel)",
                color: rColor,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                {skin.rarity}
              </div>

              {/* Preview */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, minHeight: 80, alignItems: 'center' }}>
                <SkinPreview skin={skinData} size="sm" />
              </div>

              {/* Name */}
              <div style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 9,
                color: '#fff',
                marginBottom: 4,
              }}>
                {skin.name}
              </div>

              {/* Description */}
              <div style={{ fontSize: 11, color: '#888', marginBottom: 8, lineHeight: 1.4 }}>
                {skin.description || skin.category}
              </div>

              {/* Status */}
              {isEquipped && (
                <div style={{
                  background: '#00ffd5',
                  color: '#0a0a0f',
                  fontFamily: "var(--font-pixel)",
                  fontSize: 8,
                  padding: '4px 12px',
                  display: 'inline-block',
                }}>
                  ✅ Equipped
                </div>
              )}
              {!isUnlocked && (
                <div style={{
                  color: '#ff4444',
                  fontSize: 10,
                  fontFamily: "var(--font-pixel)",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}>
                  🔒 {unlockLabel(skin)}
                </div>
              )}
              {isUnlocked && !isEquipped && (
                <div style={{
                  color: '#888',
                  fontSize: 10,
                  fontFamily: "var(--font-pixel)",
                }}>
                  Click to equip
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 40,
          color: '#555',
          fontFamily: "var(--font-pixel)",
          fontSize: 11,
        }}>
          No skins in this category
        </div>
      )}
    </div>
  );
}
