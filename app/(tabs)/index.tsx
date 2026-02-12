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
  type LockedTagResult,
} from "@/features/areaLogic";
import { useTranslation } from "react-i18next";

// ─── Layout constants ───
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const NUM_COLUMNS = 4;
const CARD_MARGIN = 5;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH =
  (windowWidth - HORIZONTAL_PADDING * 2 - CARD_MARGIN * (NUM_COLUMNS * 2)) /
  NUM_COLUMNS;

// ─── Filters ───
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

// ─── Helper functions ───
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

function getRarityColor(rarity?: number) {
  switch (rarity) {
    case 6:
      return "#ff4d4d36";
    case 5:
      return "#ffcc004d";
    case 4:
      return "#9933ff57";
    case 3:
      return "#3399ff41";
    default:
      return "#1a1a1a";
  }
}

// ─── Weapon Card ───
const WeaponCard = React.memo(function WeaponCard({
  item,
  isSelected,
  onPress,
  lang = "en",
}: {
  item: Weapons;
  isSelected?: boolean;
  onPress: () => void;
  lang?: "en" | "jp";
}) {
  const bgColor = getRarityColor(item.rarity);
  const nameToShow = lang === "jp" ? item.nameJP : item.name;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: bgColor },
        isSelected && styles.cardSelected,
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {item.image && <Image source={item.image} style={styles.image} />}
      <Text style={styles.name} numberOfLines={1}>
        {nameToShow}
      </Text>
    </TouchableOpacity>
  );
});

// ─── Main Component ───
export default function Farming() {
  const { t, i18n } = useTranslation();
  const initialLang = i18n.resolvedLanguage === "jp" ? "jp" : "en";
  const [lang, setLang] = useState<"en" | "jp">(initialLang);

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
          lang={lang}
          isSelected={selectedWeapon?.id === item.id}
          onPress={() => setSelectedWeapon(item)}
        />
      );
    },
    [selectedWeapon, lang],
  );

  const toggleLanguage = () => {
    const newLang: "en" | "jp" = lang === "en" ? "jp" : "en";
    i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  const getRarityLabel = (r: 3 | 4 | 5 | 6 | "all") =>
    r === "all" ? t("all") : `★${r}`;
  const getTypeLabel = (tOption: WeaponTypeFilter) => {
    if (tOption === "all") return t("all");
    if (lang === "jp") {
      switch (tOption) {
        case "Greatsword":
          return "大剣";
        case "Polearm":
          return "長柄武器";
        case "Handcannon":
          return "拳銃";
        case "Sword":
          return "片手剣";
        case "Arts Unit":
          return "アーツユニット";
        default:
          return tOption;
      }
    }
    return tOption;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t("weaponFarming")}</Text>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
          <Text style={styles.langButtonText}>{lang.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.desc}>{t("selectWeapon")}</Text>

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
              <Text style={styles.filterText}>{getRarityLabel(r)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterRow}>
          {TYPE_OPTIONS.map((tOption) => (
            <TouchableOpacity
              key={tOption}
              style={[
                styles.filterButton,
                typeFilter === tOption && styles.filterButtonActive,
              ]}
              onPress={() => setTypeFilter(tOption)}
            >
              <Text style={styles.filterText}>{getTypeLabel(tOption)}</Text>
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
            contentContainerStyle={styles.selectedScrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Close */}
            <TouchableOpacity
              onPress={() => setSelectedWeapon(null)}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>{t("close")}</Text>
            </TouchableOpacity>

            {/* Selected Weapon Card */}
            <WeaponCard
              item={selectedWeapon}
              isSelected
              lang={lang}
              onPress={() => {}}
            />

            {/* Selected Weapon Tags */}
            <View style={styles.tagRow}>
              {(lang === "jp"
                ? selectedWeapon.tagsJP
                : selectedWeapon.tags
              ).map((tag) => (
                <View key={tag} style={styles.tagContainer}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Best Area */}
            <Text style={styles.relatedTitle}>{t("bestFarmingArea")}</Text>
            <Text style={styles.bestAreaName}>
              {lang === "jp" ? bestArea.area.nameJP : bestArea.area.name}
            </Text>

            {/* Locked Tags */}
            {bestArea.lockedTags.map((lt: LockedTagResult) => {
              // Sort main tags: selected weapon's main tag first
              const sortedMainTags = Object.values(lt.weaponsByMain).sort(
                (a, b) =>
                  a.en === selectedWeapon.tags[0]
                    ? -1
                    : b.en === selectedWeapon.tags[0]
                      ? 1
                      : 0,
              );

              return (
                <View key={lt.lockedTag} style={styles.lockedSection}>
                  <View style={styles.lockedHeaderRow}>
                    <Text style={styles.lockedTitle}>
                      {t("lockSecondary")}:{" "}
                      {lang === "jp"
                        ? (lt.lockedTagJP ?? lt.lockedTag)
                        : lt.lockedTag}
                    </Text>
                    <Text style={styles.perfectCountText}>
                      {sortedMainTags.reduce(
                        (sum, m) => sum + m.weapons.length,
                        0,
                      )}{" "}
                      {t("perfect")}
                    </Text>
                  </View>

                  {sortedMainTags.map((mainData) => (
                    <View key={mainData.en} style={styles.mainTagSection}>
                      <Text style={styles.mainTag}>
                        {lang === "jp" ? mainData.jp : mainData.en}
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                      >
                        {mainData.weapons.map((w) => (
                          <WeaponCard
                            key={w.id}
                            item={w}
                            lang={lang}
                            onPress={() => setSelectedWeapon(w)}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  ))}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", paddingTop: 40 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    alignItems: "center",
    position: "relative",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  langButton: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    position: "absolute",
    right: 16,
  },
  langButtonText: { color: "#ffcc00", fontWeight: "bold" },
  desc: { color: "#ccc", textAlign: "center", marginBottom: 12 },
  card: {
    width: CARD_WIDTH,
    margin: CARD_MARGIN,
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  cardSelected: { borderWidth: 2, borderColor: "#ffcc00" },
  emptyCard: { backgroundColor: "transparent" },
  image: { width: 80, height: 80, resizeMode: "contain", marginBottom: 6 },
  name: { color: "#fff", fontSize: 12, textAlign: "center" },
  selectedScrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 80,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 8,
  },
  tagContainer: {
    backgroundColor: "#333",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 24,
  },
  tagText: { color: "#fff", fontSize: 12, lineHeight: 16, textAlign: "center" },
  relatedTitle: { color: "#fff", fontWeight: "bold", marginTop: 12 },
  bestAreaName: { color: "#ffcc00", fontWeight: "bold", marginBottom: 12 },
  lockedSection: { marginTop: 12 },
  lockedTitle: { color: "#ffcc00", fontWeight: "bold", marginBottom: 6 },
  lockedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  perfectCountText: {
    color: "#ffcc00",
    fontWeight: "bold",
    backgroundColor: "#333",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 24,
  },
  mainTagSection: { marginTop: 8 },
  mainTag: { color: "#ccc", marginBottom: 6 },
  horizontalScroll: { gap: 2 },
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
  clearButton: { alignSelf: "flex-end", marginTop: 20, marginBottom: 8 },
  clearButtonText: { color: "#ffcc00", fontWeight: "bold" },
});
