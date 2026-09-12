import React from 'react';
import { usePlan } from '../hooks/usePlan';
import { Lock } from 'lucide-react';

interface RequireTierProps {
  userTier: string;
  minTier: 'free' | 'silver' | 'gold' | 'platinum';
  children: React.ReactNode;
  fallbackMessage?: string;
  onUpgradeClick?: () => void;
}

export default function RequireTier({ userTier, minTier, children, fallbackMessage, onUpgradeClick }: RequireTierProps) {
  return <>{children}</>;
}
