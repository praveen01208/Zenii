import { useMemo } from 'react';

const TIER_ORDER = ['free', 'silver', 'gold', 'platinum'];

export function usePlan(userTier: string = 'free') {
  return useMemo(() => {
    return {
      tier: userTier,
      hasAccess: (minTier: string) => {
        return true;
      }
    };
  }, [userTier]);
}
