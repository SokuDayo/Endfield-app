import React, { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { areas, type Area } from "@/data/area";
import { weapons, type Weapons } from "@/data/weapons";

/* ───────── Constants ───────── */
const windowWidth = Dimensions.get("window").width;
const NUM_COLUMNS = 4;
const CARD_MARGIN = 5;
const HORIZONTAL_PADDING = 16;

const CARD_WIDTH =
  (windowWidth - HORIZONTAL_PADDING * 2 - CARD_MARGIN * (NUM_COLUMNS * 2)) /
  NUM_COLUMNS;

const RARITY_OPTIONS: (3 | 4 | 5 | 6 | "all")[] = ["all", 6, 5, 4, 3];

const TYPE_OPTIONS = [
  "all",
  "Greatsword",
  "Polearm",
  "Handcannon",
  "Sword",
  "Arts Unit",
] as const;

type WeaponTypeFilter = (typeof TYPE_OPTIONS)[number];

/* ───────── Helpers ───────── */
function padGrid(data: Weapons[]): Weapons[] {
  const padded = [...data];
  const remainder = padded.length % NUM_COLUMNS;

  if (remainder !== 0) {
    const fillers = NUM_COLUMNS - remainder;
    for (let i = 0; i < fillers; i++) {
      padded.push({ id: `empty-${i}` } as Weapons);
    }
  }

  return padded;
}

/* ───────── Weapon Card ───────── */
const WeaponCard = React.memo(function WeaponCard({
  item,
  isSelected,
  onPress,
}: {
  item: Weapons;
  isSelected?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {item.image && <Image source={item.image} style={styles.image} />}
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
});

/* ───────── Screen ───────── */
export default function Farming() {
  const [selectedWeapon, setSelectedWeapon] = useState<Weapons | null>(null);
  const [rarityFilter, setRarityFilter] = useState<3 | 4 | 5 | 6 | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<WeaponTypeFilter>("all");

  /* ───────── Filtered weapons ───────── */
  const filteredWeapons = useMemo(() => {
    return weapons.filter((weapon) => {
      const rarityMatch =
        rarityFilter === "all" || weapon.rarity === rarityFilter;
      const typeMatch = typeFilter === "all" || weapon.type === typeFilter;

      return rarityMatch && typeMatch;
    });
  }, [rarityFilter, typeFilter]);

  const gridData = useMemo(() => padGrid(filteredWeapons), [filteredWeapons]);

  /* ───────── Related weapons ───────── */
  const relatedWeapons = useMemo(() => {
    if (!selectedWeapon) return [];
    return weapons.filter(
      (w) =>
        w.id !== selectedWeapon.id &&
        w.tags.some((tag) => selectedWeapon.tags.includes(tag)),
    );
  }, [selectedWeapon]);

  /* ───────── Best area logic ───────── */
  const bestArea = useMemo(() => {
    if (!selectedWeapon) return null;

    const [main, stat, skill] = selectedWeapon.tags;

    let best: {
      area: Area;
      selectedTags: [string, string, string];
      coverage: number;
    } | null = null;

    for (const area of areas) {
      const [mainTags, statTags, skillTags] = area.tagSlots;

      // Must match main attribute
      if (!mainTags.includes(main)) continue;

      const canUseStat = statTags.includes(stat);
      const canUseSkill = skillTags.includes(skill);

      // Must match stat OR skill
      if (!canUseStat && !canUseSkill) continue;

      // Count how many weapons this area can also drop
      const coverage = weapons.filter((w) => {
        const [wMain, wStat, wSkill] = w.tags;
        return (
          mainTags.includes(wMain) &&
          (statTags.includes(wStat) || skillTags.includes(wSkill))
        );
      }).length;

      if (!best || coverage > best.coverage) {
        best = {
          area,
          selectedTags: [
            main,
            canUseStat ? stat : skill,
            canUseStat ? skill : stat,
          ],
          coverage,
        };
      }
    }

    return best;
  }, [selectedWeapon]);

  /* ───────── Render grid item ───────── */
  const renderItem = useCallback(
    ({ item }: { item: Weapons }) => {
      if (!item.name) {
        return <View style={[styles.card, styles.emptyCard]} />;
      }

      return (
        <WeaponCard
          item={item}
          isSelected={selectedWeapon?.id === item.id}
          onPress={() => setSelectedWeapon(item)}
        />
      );
    },
    [selectedWeapon],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weapon Farming</Text>
      <Text style={styles.desc}>
        Select a weapon to see optimal farming areas.
      </Text>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          {RARITY_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r.toString()}
              style={[
                styles.filterButton,
                rarityFilter === r && styles.filterButtonActive,
              ]}
              onPress={() => setRarityFilter(r)}
            >
              <Text style={styles.filterText}>
                {r === "all" ? "All" : `★${r}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filterRow}>
          {TYPE_OPTIONS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.filterButton,
                typeFilter === t && styles.filterButtonActive,
              ]}
              onPress={() => setTypeFilter(t)}
            >
              <Text style={styles.filterText}>{t === "all" ? "All" : t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Grid */}
      <FlatList
        data={gridData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingBottom: selectedWeapon ? 0 : 40,
          alignItems: "center",
        }}
        columnWrapperStyle={{
          justifyContent: "center",
          marginBottom: CARD_MARGIN,
        }}
      />

      {/* Selected weapon panel */}
      {selectedWeapon && (
        <View style={styles.selectedContainer}>
          <TouchableOpacity
            onPress={() => setSelectedWeapon(null)}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Change weapon</Text>
          </TouchableOpacity>

          <WeaponCard item={selectedWeapon} isSelected onPress={() => {}} />

          {/* Weapon tags */}
          <View style={styles.tagRow}>
            {selectedWeapon.tags.map((tag) => (
              <Text key={tag} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>

          {/* Best area */}
          {bestArea && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.relatedTitle}>Best Farming Area</Text>

              <Text
                style={{
                  color: "#ffcc00",
                  fontWeight: "bold",
                }}
              >
                {bestArea.area.name}
              </Text>

              <Text style={{ color: "#ccc", marginTop: 6 }}>
                Select these tags:
              </Text>

              <View style={styles.tagRow}>
                {bestArea.selectedTags.map((tag) => (
                  <Text key={tag} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>

              <Text
                style={{
                  color: "#888",
                  fontSize: 12,
                }}
              >
                Covers {bestArea.coverage} weapons total
              </Text>
            </View>
          )}

          {/* Related weapons */}
          {relatedWeapons.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.relatedTitle}>Related Weapons</Text>
              <FlatList
                data={relatedWeapons}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <WeaponCard
                    item={item}
                    onPress={() => setSelectedWeapon(item)}
                  />
                )}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

/* ───────── Styles ───────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  desc: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 16,
  },
  filterContainer: {
    gap: 6,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#333",
  },
  filterButtonActive: {
    backgroundColor: "#ffcc00",
  },
  filterText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    width: CARD_WIDTH,
    margin: CARD_MARGIN,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  emptyCard: {
    backgroundColor: "transparent",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#ffcc00",
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 6,
  },
  name: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  selectedContainer: {
    borderTopWidth: 1,
    borderColor: "#333",
    padding: 16,
    backgroundColor: "#111",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#333",
    color: "#fff",
    fontSize: 12,
  },
  relatedTitle: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 6,
  },
  clearButton: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  clearButtonText: {
    color: "#ffcc00",
    fontWeight: "bold",
  },
});
