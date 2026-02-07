import { areas, type Area } from "@/data/area";
import { weapons, type Weapons } from "@/data/weapons";

export type LockedTagResult = {
  lockedTag: string;
  perfectCount: number;
  weaponsByMain: Record<string, Weapons[]>;
};

export type BestAreaResult = {
  area: Area;
  lockedTags: LockedTagResult[];
};

export function getBestAreaAndAlternatives(
  selectedWeapon: Weapons,
): BestAreaResult | null {
  const [mainTag, statTag, skillTag] = selectedWeapon.tags;

  let bestResult: BestAreaResult | null = null;
  let bestPerfectTotal = -1;

  for (const area of areas) {
    const [mainTags, statTags, skillTags] = area.tagSlots;

    // ✅ Area must support ALL 3 tags
    if (
      !mainTags.includes(mainTag) ||
      (!statTags.includes(statTag) && !skillTags.includes(statTag)) ||
      (!skillTags.includes(skillTag) && !statTags.includes(skillTag))
    ) {
      continue;
    }

    const lockCandidates = [statTag, skillTag];

    const lockedTagResults: LockedTagResult[] = lockCandidates.map(
      (lockedTag) => {
        const weaponsByMain: Record<string, Weapons[]> = {};
        let perfectCount = 0;

        for (const mainChoice of mainTags) {
          const matches = weapons
            .filter((w) => {
              if (w.id === selectedWeapon.id) return false;

              const [wMain, wStat, wSkill] = w.tags;

              if (wMain !== mainChoice) return false;

              // 🔒 locked tag must match
              const hasLocked = wStat === lockedTag || wSkill === lockedTag;
              if (!hasLocked) return false;

              // ✅ other tag must be farmable in area
              const otherTag = wStat === lockedTag ? wSkill : wStat;

              return (
                statTags.includes(otherTag) || skillTags.includes(otherTag)
              );
            })
            .map((w) => {
              const [, wStat, wSkill] = w.tags;
              const isPerfect = wStat === statTag && wSkill === skillTag;

              if (isPerfect) perfectCount++;

              return {
                weapon: w,
                score: isPerfect ? 2 : 1,
              };
            })
            .sort((a, b) => b.score - a.score)
            .map((e) => e.weapon);

          if (matches.length > 0) {
            weaponsByMain[mainChoice] = matches;
          }
        }

        return {
          lockedTag,
          perfectCount,
          weaponsByMain,
        };
      },
    );

    const areaPerfectTotal = lockedTagResults.reduce(
      (sum, lt) => sum + lt.perfectCount,
      0,
    );

    if (areaPerfectTotal > bestPerfectTotal) {
      bestPerfectTotal = areaPerfectTotal;

      bestResult = {
        area,
        // ⭐ MOST IMPORTANT PART ⭐
        // Best lock first in the UI
        lockedTags: lockedTagResults.sort(
          (a, b) => b.perfectCount - a.perfectCount,
        ),
      };
    }
  }

  return bestResult;
}
