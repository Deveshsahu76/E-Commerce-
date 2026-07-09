export const storefrontContent = {
  hero: {
    eyebrow: "Snake Repellent Ã¢â‚¬Â¢ Solar Pest Control Ã¢â‚¬Â¢ Outdoor Protection",
    title: "Snake & Pest Repellent Products",
    subtitle:
      "Shop solar snake repellers, ultrasonic pest repellers, rodent control devices and outdoor protection products.",
    primaryCta: {
      label: "View Products",
      link: "/products",
    },
    secondaryCta: {
      label: "Contact Support",
      link: "/support",
    },
  },

  categories: [
    "Snake Repellers",
    "Solar Repellers",
    "Ultrasonic Devices",
    "Rodent Control",
  ],

  trustCards: [
    {
      title: "Outdoor Use",
      description: "Useful for home surroundings, gardens, farms and open areas.",
    },
    {
      title: "Solar Options",
      description: "Solar-powered options for convenient outdoor placement.",
    },
    {
      title: "Easy Shopping",
      description: "Simple product browsing, cart and checkout flow.",
    },
  ],
};

export const getCategoryKeyword = (category = "") => {
  const value = String(category).toLowerCase();

  if (value.includes("snake")) return "snake";
  if (value.includes("solar")) return "solar";
  if (value.includes("ultrasonic")) return "ultrasonic";
  if (value.includes("rodent")) return "rodent";

  return value;
};

export const isRepellentProduct = (product = {}) => {
  const text = [
    product.name,
    product.title,
    product.category,
    product.brand,
    product.description,
    product.shortDescription,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const keywords = [
    "snake",
    "repellent",
    "repeller",
    "pest",
    "solar",
    "ultrasonic",
    "rat",
    "mouse",
    "mice",
    "rodent",
    "vibrarandom",
    "vibrandum",
  ];

  return keywords.some((keyword) => text.includes(keyword));
};