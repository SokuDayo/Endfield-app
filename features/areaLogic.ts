import { areas, type Area } from "@/data/area";
import { weapons, type Weapons } from "@/data/weapons";

export type LockedTagResult = {
  lockedTag: string; // EN
  lockedTagJP: string; // JP
  perfectCount: number;
  weaponsByMain: Record<string, { en: string; jp: string; weapons: Weapons[] }>;
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
    const [areaMainTagsJP, areaStatTagsJP, areaSkillTagsJP] = area.tagSlotsJP;

    // Area must support ALL tags of selected weapon
    if (
      !areaMainTags.includes(selectedMain) ||
      (!areaStatTags.includes(selectedStat) &&
        !areaSkillTags.includes(selectedStat)) ||
      (!areaStatTags.includes(selectedSkill) &&
        !areaSkillTags.includes(selectedSkill))
    )
      continue;

    const lockCandidates = [selectedStat, selectedSkill];

    const lockedTagResults: LockedTagResult[] = lockCandidates.map(
      (lockedTag) => {
        // Find JP equivalent
        let lockedTagJP = areaStatTags.includes(lockedTag)
          ? areaStatTagsJP[areaStatTags.indexOf(lockedTag)]
          : areaSkillTags.includes(lockedTag)
            ? areaSkillTagsJP[areaSkillTags.indexOf(lockedTag)]
            : lockedTag;

        let perfectCount = 0;
        const weaponsByMain: Record<
          string,
          { en: string; jp: string; weapons: Weapons[] }
        > = {};

        for (let i = 0; i < areaMainTags.length; i++) {
          const mainChoice = areaMainTags[i];
          const mainChoiceJP = areaMainTagsJP[i];

          const perfectWeapons = weapons.filter((w) => {
            if (w.id === selectedWeapon.id) return false;
            const [wMain, wStat, wSkill] = w.tags;
            const secondaries = [wStat, wSkill];

            if (wMain !== mainChoice) return false;
            if (!secondaries.includes(lockedTag)) return false;

            const otherSecondary = secondaries.find((t) => t !== lockedTag);
            if (!otherSecondary) return false;

            return (
              areaStatTags.includes(otherSecondary) ||
              areaSkillTags.includes(otherSecondary)
            );
          });

          if (perfectWeapons.length > 0) {
            weaponsByMain[mainChoice] = {
              en: mainChoice,
              jp: mainChoiceJP,
              weapons: perfectWeapons,
            };
            perfectCount += perfectWeapons.length;
          }
        }

        return { lockedTag, lockedTagJP, perfectCount, weaponsByMain };
      },
    );

    const areaPerfectTotal = lockedTagResults.reduce(
      (sum, lt) => sum + lt.perfectCount,
      0,
    );

    if (areaPerfectTotal > highestPerfectTotal) {
      highestPerfectTotal = areaPerfectTotal;

      bestResult = {
        area,
        lockedTags: lockedTagResults.sort(
          (a, b) => b.perfectCount - a.perfectCount,
        ),
      };
    }
  }

  return bestResult;
}
