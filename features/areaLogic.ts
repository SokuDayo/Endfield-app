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
  const [selectedMain, selectedStat, selectedSkill] = selectedWeapon.tags;

  let bestResult: BestAreaResult | null = null;
  let highestPerfectTotal = -1;

  for (const area of areas) {
    const [areaMainTags, areaStatTags, areaSkillTags] = area.tagSlots;

    // Area must support ALL tags of selected weapon
    if (
      !areaMainTags.includes(selectedMain) ||
      (!areaStatTags.includes(selectedStat) &&
        !areaSkillTags.includes(selectedStat)) ||
      (!areaStatTags.includes(selectedSkill) &&
        !areaSkillTags.includes(selectedSkill))
    ) {
      continue;
    }

    // Locked secondary candidates: only the secondary tags
    const lockCandidates = [selectedStat, selectedSkill];

    const lockedTagResults: LockedTagResult[] = lockCandidates.map(
      (lockedTag) => {
        const weaponsByMain: Record<string, Weapons[]> = {};
        let perfectCount = 0;

        for (const mainChoice of areaMainTags) {
          const perfectWeapons = weapons.filter((w) => {
            if (w.id === selectedWeapon.id) return false; // exclude selected weapon
            const [wMain, wStat, wSkill] = w.tags;
            const secondaries = [wStat, wSkill];

            // Must match main tag
            if (wMain !== mainChoice) return false;

            // Must have the locked secondary tag
            if (!secondaries.includes(lockedTag)) return false;

            // Other secondary must be farmable in this area
            const otherSecondary = secondaries.find((t) => t !== lockedTag);
            if (!otherSecondary) return false;

            return (
              areaStatTags.includes(otherSecondary) ||
              areaSkillTags.includes(otherSecondary)
            );
          });

          if (perfectWeapons.length > 0) {
            weaponsByMain[mainChoice] = perfectWeapons;
            perfectCount += perfectWeapons.length;
          }
        }

        return { lockedTag, perfectCount, weaponsByMain };
      },
    );

    // Total perfect weapons for this area
    const areaPerfectTotal = lockedTagResults.reduce(
      (sum, lt) => sum + lt.perfectCount,
      0,
    );

    // Keep best area
    if (areaPerfectTotal > highestPerfectTotal) {
      highestPerfectTotal = areaPerfectTotal;
      bestResult = {
        area,
        // Sort locked tags by most perfect weapons first
        lockedTags: lockedTagResults.sort(
          (a, b) => b.perfectCount - a.perfectCount,
        ),
      };
    }
  }

  return bestResult;
}
