import React, { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { weapons, type Weapons } from "@/data/weapons";
import {
  getBestAreaAndAlternatives,
  type BestAreaResult,
} from "@/features/areaLogic";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const NUM_COLUMNS = 4;
const CARD_MARGIN = 5;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH =
  (windowWidth - HORIZONTAL_PADDING * 2 - CARD_MARGIN * (NUM_COLUMNS * 2)) /
  NUM_COLUMNS;

// Filters
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

// Pad grid for FlatList
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

// Weapon card
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

// Main screen
export default function Farming() {
  const [selectedWeapon, setSelectedWeapon] = useState<Weapons | null>(null);
  const [rarityFilter, setRarityFilter] = useState<3 | 4 | 5 | 6 | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<WeaponTypeFilter>("all");

  const filteredWeapons = useMemo(
    () =>
      weapons.filter(
        (w) =>
          (rarityFilter === "all" || w.rarity === rarityFilter) &&
          (typeFilter === "all" || w.type === typeFilter),
      ),
    [rarityFilter, typeFilter],
  );

  const gridData = useMemo(() => padGrid(filteredWeapons), [filteredWeapons]);

  const bestArea: BestAreaResult | null = useMemo(
    () => (selectedWeapon ? getBestAreaAndAlternatives(selectedWeapon) : null),
    [selectedWeapon],
  );

  const renderItem = useCallback(
    ({ item }: { item: Weapons }) => {
      if (!item.name) return <View style={[styles.card, styles.emptyCard]} />;
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

      {/* Weapon Grid */}
      <FlatList
        data={gridData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingBottom: 20,
          alignItems: "center",
        }}
        columnWrapperStyle={{
          justifyContent: "center",
          marginBottom: CARD_MARGIN,
        }}
      />

      {/* Selected Weapon Overlay */}
      {selectedWeapon && bestArea && (
        <View style={styles.selectedOverlay}>
          <ScrollView
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 60,
              paddingTop: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => setSelectedWeapon(null)}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Close</Text>
            </TouchableOpacity>

            <WeaponCard item={selectedWeapon} isSelected onPress={() => {}} />

            <View style={styles.tagRow}>
              {selectedWeapon.tags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>

            {/* Best Area Name */}
            <Text style={[styles.relatedTitle, { marginTop: 12 }]}>
              Best Farming Area
            </Text>
            <Text style={{ color: "#ffcc00", fontWeight: "bold" }}>
              {bestArea.area.name}
            </Text>

            {/* Locked Tag Sections */}
            {bestArea.lockedTags.map((lt) => (
              <View key={lt.tag} style={{ marginTop: 12 }}>
                <Text style={{ color: "#ccc" }}>Lock Secondary: {lt.tag}</Text>
                {Object.entries(lt.weaponsByMain).map(([main, weapons]) => (
                  <View key={main} style={{ marginTop: 6 }}>
                    <Text style={{ color: "#ccc" }}>{main}</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {weapons.map((w) => (
                        <WeaponCard
                          key={w.id}
                          item={w}
                          onPress={() => setSelectedWeapon(w)}
                        />
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ───────── Styles ─────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", paddingTop: 40 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  desc: { color: "#ccc", textAlign: "center", marginBottom: 12 },
  card: {
    width: CARD_WIDTH,
    margin: CARD_MARGIN,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  cardSelected: { borderWidth: 2, borderColor: "#ffcc00" },
  emptyCard: { backgroundColor: "transparent" },
  image: { width: 80, height: 80, resizeMode: "contain", marginBottom: 6 },
  name: { color: "#fff", fontSize: 14, textAlign: "center" },
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
  filterContainer: { gap: 6, marginBottom: 12 },
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
  filterButtonActive: { backgroundColor: "#ffcc00" },
  filterText: { color: "#fff", fontWeight: "bold" },
  selectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: windowWidth,
    height: windowHeight - 20,
    backgroundColor: "#111",
    zIndex: 10,
  },
  relatedTitle: { color: "#fff", fontWeight: "bold", marginBottom: 6 },
  clearButton: { alignSelf: "flex-end", marginTop: 20, marginBottom: 8 },
  clearButtonText: { color: "#ffcc00", fontWeight: "bold" },
});
