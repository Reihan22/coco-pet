'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PixelPet, { type SkinData } from '@/components/PixelPet';
import SkinSelector from '@/components/SkinSelector';
import type { EvolutionStage, PetMood } from '@/lib/pet';

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

interface PetData {
  id: string;
  name: string;
  level: number;
  stage: string;
  equippedSkinId: string | null;
  equippedAccessoryId: string | null;
  equippedSkin: Skin | null;
  equippedAccessory: Skin | null;
}

export default function SkinsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState<PetData | null>(null);
  const [allSkins, setAllSkins] = useState<Skin[]>([]);
  const [unlockedSkins, setUnlockedSkins] = useState<Skin[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Skin[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      setPet(meData.pet);

      const [skinsRes, myRes, unlockRes] = await Promise.all([
        fetch('/api/skins'),
        fetch('/api/skins?mine=true'),
        fetch('/api/skins/check-unlocks', { method: 'POST' }),
      ]);

      if (skinsRes.ok) {
        const d = await skinsRes.json();
        setAllSkins(d.skins);
      }
      if (myRes.ok) {
        const d = await myRes.json();
        setUnlockedSkins(d.skins);
      }
      if (unlockRes.ok) {
        const d = await unlockRes.json();
        if (d.newlyUnlocked?.length > 0) {
          setNewlyUnlocked(d.newlyUnlocked);
          // Refetch unlocked list
          const refetch = await fetch('/api/skins?mine=true');
          if (refetch.ok) {
            const rd = await refetch.json();
            setUnlockedSkins(rd.skins);
          }
        }
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleEquip(skinId: string, slot: 'palette' | 'accessory') {
    const res = await fetch('/api/skins/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skinId, slot }),
    });
    if (res.ok) {
      const d = await res.json();
      setPet(d.pet);
    }
  }

  async function handleUnequip(slot: 'palette' | 'accessory') {
    const res = await fetch('/api/skins/unequip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot }),
    });
    if (res.ok) {
      const d = await res.json();
      setPet(prev => prev ? { ...prev, ...d.pet } : null);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: '#00ffd5', animation: 'pulse-glow 2s ease-in-out infinite' }}>
          Loading Skins...
        </div>
      </div>
    );
  }

  const unlockedIds = new Set(unlockedSkins.map(s => s.id));

  // Build equipped skin data for preview
  const equippedSkinData: SkinData | undefined = pet?.equippedSkin ? {
    palette: pet.equippedSkin.palette as SkinData['palette'],
    accessory: pet.equippedSkin.accessory,
    animation: pet.equippedSkin.animation,
  } : undefined;

  const equippedAccessoryData: SkinData | undefined = pet?.equippedAccessory ? {
    accessory: pet.equippedAccessory.accessory,
    animation: pet.equippedAccessory.animation,
  } : undefined;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "'Press Start 2P', monospace" }}>
      {/* Header */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/dashboard" style={{ color: '#00ffd5', textDecoration: 'none', fontSize: 10 }}>
          ← Dashboard
        </Link>
        <h1 style={{ fontSize: 14, color: '#00ffd5', margin: 0 }}>🎨 Skins Gallery</h1>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>
        {/* Newly unlocked notification */}
        {newlyUnlocked.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(57,255,20,0.1))',
            border: '1px solid #ffd700',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: '#ffd700', marginBottom: 8 }}>🎉 New Skins Unlocked!</div>
            <div style={{ fontSize: 9, color: '#aaa' }}>
              {newlyUnlocked.map(s => s.name).join(', ')}
            </div>
          </div>
        )}

        {/* Equipped skin preview */}
        {pet && (pet.equippedSkinId || pet.equippedAccessoryId) && (
          <div style={{
            background: '#12121e',
            border: '1px solid #00ffd5',
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}>
            <div style={{ minWidth: 180, display: 'flex', justifyContent: 'center' }}>
              <PixelPet
                stage={(pet.stage as EvolutionStage) ?? 'baby'}
                mood={'happy' as PetMood}
                level={pet.level}
                size="lg"
                skin={{
                  palette: equippedSkinData?.palette,
                  accessory: equippedAccessoryData?.accessory ?? equippedSkinData?.accessory,
                  animation: equippedAccessoryData?.animation ?? equippedSkinData?.animation,
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#00ffd5', marginBottom: 8 }}>Currently Equipped</div>
              {pet.equippedSkin && (
                <div style={{ fontSize: 9, color: '#fff', marginBottom: 4 }}>
                  🎨 Palette: {pet.equippedSkin.name}
                </div>
              )}
              {pet.equippedAccessory && (
                <div style={{ fontSize: 9, color: '#fff', marginBottom: 4 }}>
                  👑 Accessory: {pet.equippedAccessory.name}
                </div>
              )}
              {!pet.equippedSkin && !pet.equippedAccessory && (
                <div style={{ fontSize: 9, color: '#888' }}>No skins equipped</div>
              )}
            </div>
          </div>
        )}

        {/* Skin selector */}
        <SkinSelector
          allSkins={allSkins}
          unlockedSkinIds={unlockedIds}
          equippedSkinId={pet?.equippedSkinId ?? null}
          equippedAccessoryId={pet?.equippedAccessoryId ?? null}
          onEquip={handleEquip}
          onUnequip={handleUnequip}
        />
      </div>
    </div>
  );
}
