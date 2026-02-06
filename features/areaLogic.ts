import { areas, type Area } from "@/data/area";
import { weapons, type Weapons } from "@/data/weapons";

export type BestAreaResult = {
  area: Area;
  lockedTags: {
    tag: string; // locked secondary tag
    weaponsByMain: Record<string, Weapons[]>; // weapons grouped by main tag
  }[];
};

/**
 * Computes the best farming area and alternative weapons based on locked secondary tags.
 */
export function getBestAreaAndAlternatives(
  selectedWeapon: Weapons,
): BestAreaResult | null {
  const [mainTag, statTag, skillTag] = selectedWeapon.tags;

  let bestArea: BestAreaResult | null = null;

  for (const area of areas) {
    const [mainTags] = area.tagSlots;

    // Only consider areas that include the weapon's main tag
    if (!mainTags.includes(mainTag)) continue;

    const lockedOptions: string[] = [statTag, skillTag]; // user can lock either stat or skill

    const lockedTagsData = lockedOptions.map((lockedTag) => {
      const weaponsByMain: Record<string, Weapons[]> = {};

      for (const mainChoice of mainTags) {
        // Filter weapons:
        // - Main tag must match mainChoice
        // - Must include lockedTag (secondary tag)
        // - Must have all 3 relevant tags: main + locked + other (either stat or skill)
        const filtered = weapons.filter((w) => {
          const [wMain, wStat, wSkill] = w.tags;

          const hasMain = wMain === mainChoice;
          const hasLocked = wStat === lockedTag || wSkill === lockedTag;

          // include only if weapon has 3 tags: main + stat + skill
          const tagsSet = new Set([wMain, wStat, wSkill]);
          const requiredTags = new Set([mainChoice, lockedTag]);

          return (
            hasMain &&
            hasLocked &&
            requiredTags.size === 2 &&
            tagsSet.has(mainChoice) &&
            tagsSet.has(lockedTag)
          );
        });

        if (filtered.length > 0) {
          weaponsByMain[mainChoice] = filtered;
        }
      }

      return { tag: lockedTag, weaponsByMain };
    });

    // Count total coverage to pick best area
    const totalCoverage = lockedTagsData.reduce(
      (acc, lt) =>
        acc + Object.values(lt.weaponsByMain).reduce((a, b) => a + b.length, 0),
      0,
    );

    if (
      !bestArea ||
      totalCoverage >
        bestArea.lockedTags.reduce(
          (acc, lt) =>
            acc +
            Object.values(lt.weaponsByMain).reduce((a, b) => a + b.length, 0),
          0,
        )
    ) {
      bestArea = {
        area,
        lockedTags: lockedTagsData,
      };
    }
  }

  return bestArea;
}
