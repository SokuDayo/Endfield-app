import { useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Collapsible } from "@/components/ui/collapsible";
import { weapons, type Weapons } from "@/data/weapons";

/* ───────── Layout constants ───────── */
const windowWidth = Dimensions.get("window").width;
const numColumns = 4;
const cardMargin = 5;
const horizontalPadding = 16;

const cardWidth =
  (windowWidth - horizontalPadding * 2 - cardMargin * (numColumns * 2)) /
  numColumns;

/* ───────── Farming Component ───────── */
const Farming = () => {
  const [isGridOpen, setIsGridOpen] = useState(true);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapons | null>(null);

  const [rarityFilter, setRarityFilter] = useState<3 | 4 | 5 | 6 | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<
    "all" | "Greatsword" | "Polearm" | "Handcannon" | "Sword" | "Arts Unit"
  >("all");

  /* ───────── Filters ───────── */
  const filteredWeapons = weapons.filter((weapon) => {
    const rarityMatch =
      rarityFilter === "all" || weapon.rarity === rarityFilter;
    const typeMatch = typeFilter === "all" || weapon.type === typeFilter;
    return rarityMatch && typeMatch;
  });

  /* ───────── last row ───────── */
  const data = [...filteredWeapons];
  const remainder = data.length % numColumns;
  if (remainder !== 0) {
    const emptyCount = numColumns - remainder;
    for (let i = 0; i < emptyCount; i++) {
      data.push({
        id: `empty-${i}`,
        name: "",
        image: null,
        rarity: 3,
        tags: ["", "", ""],
        type: "Sword",
      } as Weapons);
    }
  }

  /* ───────── Render weapon card ───────── */
  const renderItem = ({ item }: { item: Weapons }) => {
    if (item.id.startsWith("empty")) {
      return <View style={[styles.card, styles.emptyCard]} />;
    }

    const isSelected = selectedWeapon?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        activeOpacity={0.85}
        onPress={() => {
          setSelectedWeapon(item);
          setIsGridOpen(false); // collapse grid
        }}
      >
        <Image source={item.image} style={styles.image} />
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  /* ───────── Related weapons ───────── */
  const relatedWeapons = selectedWeapon
    ? weapons.filter(
        (w) =>
          w.id !== selectedWeapon.id &&
          w.tags.some((tag) => selectedWeapon.tags.includes(tag)),
      )
    : [];

  /* ───────── UI ───────── */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weapon Farming</Text>
      <Text style={styles.desc}>
        Select the weapon you want to farm essences for.
      </Text>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          {["all", 6, 5, 4, 3].map((r) => (
            <TouchableOpacity
              key={r.toString()}
              style={[
                styles.filterButton,
                rarityFilter === r && styles.filterButtonActive,
              ]}
              onPress={() => setRarityFilter(r as any)}
            >
              <Text style={styles.filterText}>
                {r === "all" ? "All" : `★${r}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filterRow}>
          {[
            "all",
            "Greatsword",
            "Polearm",
            "Handcannon",
            "Sword",
            "Arts Unit",
          ].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.filterButton,
                typeFilter === t && styles.filterButtonActive,
              ]}
              onPress={() => setTypeFilter(t as any)}
            >
              <Text style={styles.filterText}>{t === "all" ? "All" : t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Weapon Grid in Collapsible */}
      <Collapsible
        title="Weapons"
        isOpen={isGridOpen}
        onToggle={() => {
          if (!isGridOpen) setSelectedWeapon(null);
          setIsGridOpen((v) => !v);
        }}
      >
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: 12,
            alignItems: "center",
          }}
          columnWrapperStyle={{
            justifyContent: "center",
            marginBottom: cardMargin,
          }}
        />
      </Collapsible>

      {/* Selected Weapon Container */}
      {selectedWeapon && !isGridOpen && (
        <View style={styles.selectedContainer}>
          {/* Selected Weapon */}
          <View
            style={[styles.card, styles.cardSelected, { alignSelf: "center" }]}
          >
            <Image source={selectedWeapon.image} style={styles.image} />
            <Text style={styles.name} numberOfLines={1}>
              {selectedWeapon.name}
            </Text>
          </View>

          {/* Tags */}
          <View style={styles.tagRow}>
            {selectedWeapon.tags.map((tag) => (
              <Text key={tag} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>

          {/* Related Weapons */}
          {relatedWeapons.length > 0 && (
            <>
              <Text style={styles.relatedTitle}>Related Weapons</Text>
              <FlatList
                data={relatedWeapons}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={[styles.card, styles.relatedCard]}>
                    <Image source={item.image} style={styles.image} />
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                )}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default Farming;

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
    color: "#fff",
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
    width: cardWidth,
    margin: cardMargin,
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
  relatedCard: {
    marginRight: 8,
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
    width: "100%",
  },
  selectedContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#333",
    backgroundColor: "#111",
    width: "100%",
  },
  selectedTitle: {
    color: "#ffcc00",
    fontWeight: "bold",
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
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
});
