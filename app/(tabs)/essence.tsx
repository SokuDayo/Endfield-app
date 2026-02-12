import React, { useMemo, useState } from "react";
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
import { useTranslation } from "react-i18next";

const windowWidth = Dimensions.get("window").width;

/* ───────── Constants ───────── */
const NUM_COLUMNS = 4;
const CARD_MARGIN = 5;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH =
  (windowWidth - HORIZONTAL_PADDING * 2 - CARD_MARGIN * (NUM_COLUMNS * 2)) /
  NUM_COLUMNS;

/* ───────── Helpers ───────── */
function getUniqueTags(index: 0 | 1 | 2, lang: "en" | "jp") {
  return Array.from(
    new Set(
      weapons
        .map((w) => (lang === "jp" ? w.tagsJP[index] : w.tags[index]))
        .filter((t) => t && t.trim() !== ""),
    ),
  ).sort();
}

function matchScore(
  w: Weapons,
  main?: string | null,
  stat?: string | null,
  skill?: string | null,
  lang: "en" | "jp" = "en",
) {
  let score = 0;
  const wTags = lang === "jp" ? w.tagsJP : w.tags;
  if (main && wTags[0] === main) score++;
  if (stat && wTags[1] === stat) score++;
  if (skill && wTags[2] === skill) score++;
  return score;
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

/* ───────── Weapon Card ───────── */
function WeaponCard({ item, lang }: { item: Weapons; lang: "en" | "jp" }) {
  const bgColor = getRarityColor(item.rarity);
  const name = lang === "jp" ? item.nameJP : item.name;
  const tags = (lang === "jp" ? item.tagsJP : item.tags).filter(Boolean);

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      {item.image && <Image source={item.image} style={styles.image} />}
      <Text style={styles.cardName} numberOfLines={1}>
        {name}
      </Text>
      <View style={styles.tagColumn}>
        {tags.map((tag) => (
          <Text key={tag} style={styles.tagItem} numberOfLines={1}>
            {tag}
          </Text>
        ))}
      </View>
    </View>
  );
}

/* ───────── Tag Row ───────── */
function TagRow({
  title,
  tags,
  value,
  onChange,
  anyLabel,
}: {
  title: string;
  tags: string[];
  value: string | null;
  onChange: (v: string | null) => void;
  anyLabel: string;
}) {
  return (
    <View style={styles.tagSection}>
      <Text style={styles.tagTitle}>{title}</Text>
      <View style={styles.tagRow}>
        <TouchableOpacity
          style={[styles.tagButton, !value && styles.tagActive]}
          onPress={() => onChange(null)}
        >
          <Text style={styles.tagText}>{anyLabel}</Text>
        </TouchableOpacity>

        {tags.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tagButton, value === t && styles.tagActive]}
            onPress={() => onChange(value === t ? null : t)}
          >
            <Text style={styles.tagText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/* ───────── Main Screen ───────── */
export default function Essence() {
  const { i18n, t } = useTranslation();

  const initialLang = i18n.resolvedLanguage === "jp" ? "jp" : "en";
  const [lang, setLang] = useState<"en" | "jp">(initialLang);

  const [mainTag, setMainTag] = useState<string | null>(null);
  const [statTag, setStatTag] = useState<string | null>(null);
  const [skillTag, setSkillTag] = useState<string | null>(null);

  const mainTags = useMemo(() => getUniqueTags(0, lang), [lang]);
  const statTags = useMemo(() => getUniqueTags(1, lang), [lang]);
  const skillTags = useMemo(() => getUniqueTags(2, lang), [lang]);

  const matchingWeapons = useMemo(() => {
    return weapons
      .filter((w) => {
        const wTags = lang === "jp" ? w.tagsJP : w.tags;
        if (mainTag && wTags[0] !== mainTag) return false;
        if (statTag && wTags[1] !== statTag) return false;
        if (skillTag && wTags[2] && wTags[2] !== skillTag) return false;
        return true;
      })
      .sort(
        (a, b) =>
          matchScore(b, mainTag, statTag, skillTag, lang) -
            matchScore(a, mainTag, statTag, skillTag, lang) ||
          b.rarity - a.rarity,
      );
  }, [mainTag, statTag, skillTag, lang]);

  const toggleLanguage = () => {
    const newLang: "en" | "jp" = lang === "en" ? "jp" : "en";
    i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("essenceFarming")}</Text>

        <TouchableOpacity onPress={toggleLanguage} style={styles.langToggle}>
          <Text style={styles.langText}>{lang.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.desc}>{t("selectTags")}</Text>

      {/* Filters */}
      <ScrollView contentContainerStyle={styles.filters}>
        <TagRow
          title={t("mainTag")}
          tags={mainTags}
          value={mainTag}
          onChange={setMainTag}
          anyLabel={t("any")}
        />

        <TagRow
          title={lang === "jp" ? "サブタグ" : "Secondary Tag"}
          tags={statTags}
          value={statTag}
          onChange={setStatTag}
          anyLabel={t("any")}
        />

        <TagRow
          title={lang === "jp" ? "スキルタグ" : "Skill Tag"}
          tags={skillTags}
          value={skillTag}
          onChange={setSkillTag}
          anyLabel={t("any")}
        />
      </ScrollView>

      {/* Results */}
      <FlatList
        data={matchingWeapons}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        style={{ maxHeight: 300 }}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingBottom: 12,
        }}
        renderItem={({ item }) => <WeaponCard item={item} lang={lang} />}
        ListEmptyComponent={<Text style={styles.empty}>{t("none")}</Text>}
      />
    </View>
  );
}

/* ───────── Styles ───────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  desc: { color: "#ccc", textAlign: "center", marginBottom: 12 },

  langToggle: {
    position: "absolute",
    right: 16,
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  langText: { color: "#ffcc00", fontWeight: "bold" },

  filters: { paddingHorizontal: 16, gap: 12 },

  tagSection: {
    marginBottom: 8,
  },

  tagColumn: {
    width: "100%",
    marginTop: 4,
  },

  tagItem: {
    color: "#aaa",
    fontSize: 10,
    lineHeight: 14,
  },

  tagTitle: { color: "#ffcc00", marginBottom: 6, fontWeight: "bold" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },

  tagButton: {
    backgroundColor: "#333",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagActive: { backgroundColor: "#ffcc00" },
  tagText: { color: "#fff", fontSize: 12, fontWeight: "bold" },

  card: {
    width: CARD_WIDTH,
    margin: CARD_MARGIN,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
  },

  cardName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardTags: { color: "#aaa", fontSize: 10, marginTop: 4 },
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },

  image: {
    width: 56,
    height: 56,
    resizeMode: "contain",
    marginBottom: 6,
  },
  empty: { color: "#777", textAlign: "center", marginTop: 20 },
});
