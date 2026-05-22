'use client';

import PixelPet, { type SkinData } from '@/components/PixelPet';

interface SkinPreviewProps {
  skin: SkinData;
  size?: 'sm' | 'md' | 'lg';
}

export default function SkinPreview({ skin, size = 'sm' }: SkinPreviewProps) {
  return (
    <PixelPet
      stage="baby"
      mood="happy"
      level={1}
      size={size}
      skin={skin}
    />
  );
}
