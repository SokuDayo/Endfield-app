export type Area = {
  id: string;
  name: string;
  tagSlots: [string[], string[], string[]];
};

export const areas: Area[] = [
  {
    id: "area1",
    name: "Severe Energy Alluvium: Originium Science Park",
    tagSlots: [
      ["Agility", "Strength", "Will", "Intellect", "Main Attribute"],
      [
        "Attack",
        "Physical DMG",
        "Electric DMG",
        "Cryo DMG",
        "Nature DMG",
        "Crit Rate",
        "Ultimate Gain",
        "Arts DMG",
      ],
      [
        "Suppression",
        "Pursuit",
        "Inspiring",
        "Combative",
        "Infliction",
        "Medicant",
        "Fracture",
        "Efficacy",
      ],
    ],
  },
  {
    id: "area2",
    name: "Severe Energy Alluvium: Power Plateau",
    tagSlots: [
      ["Agility", "Strength", "Will", "Intellect", "Main Attribute"],
      [
        "Attack",
        "HP",
        "Physical DMG",
        "Heat DMG",
        "Nature DMG",
        "Crit Rate",
        "Arts Intensity",
        "Treatment Efficiency",
      ],
      [
        "Pursuit",
        "Crusher",
        "Inspiring",
        "Brutality",
        "Infliction",
        "Medicant",
        "Fracture",
        "Flow",
      ],
    ],
  },
  {
    id: "area3",
    name: "Severe Energy Alluvium: The Hub",
    tagSlots: [
      ["Agility", "Strength", "Will", "Intellect", "Main Attribute"],
      [
        "Attack",
        "Heat DMG",
        "Electrical DMG",
        "Cryo DMG",
        "Nature DMG",
        "Arts Intensity",
        "Ultimate Gain",
        "Arts DMG",
      ],
      [
        "Assault",
        "Suppression",
        "Pursuit",
        "Crusher",
        "Combative",
        "Detonate",
        "Flow",
        "Efficacy",
      ],
    ],
  },
  {
    id: "area4",
    name: "Severe Energy Alluvium: Origin Lodespring",
    tagSlots: [
      ["Agility", "Strength", "Will", "Intellect", "Main Attribute"],
      [
        "HP",
        "Physical DMG",
        "Heat DMG",
        "Cryo DMG",
        "Nature DMG",
        "Crit Rate",
        "Arts Intensity",
        "Treatment Efficiency",
      ],
      [
        "Assault",
        "Suppression",
        "Combative",
        "Brutality",
        "Infliction",
        "Detonate",
        "Twilight",
        "Efficacy",
      ],
    ],
  },
  {
    id: "area5",
    name: "Severe Energy Alluvium: Wuling City",
    tagSlots: [
      ["Agility", "Strength", "Will", "Intellect", "Main Attribute"],
      [
        "Attack",
        "HP",
        "Electric DMG",
        "Cryo DMG",
        "Crit Rate",
        "Ultimate Gain",
        "Arts DMG",
        "Treatment Efficiency",
      ],
      [
        "Assault",
        "Crusher",
        "Brutality",
        "Medicant",
        "Fracture",
        "Detonate",
        "Twilight",
        "Flow",
      ],
    ],
  },
];
