export const storefrontContent = {
  hero: {
    eyebrow: "Snake Repellent • Solar Pest Control • Outdoor Protection",
    title: "Protect your home, farm and garden with trusted repellent products.",
    subtitle:
      "Shop snake repellers, solar pest repellers, ultrasonic rodent controllers and outdoor protection devices in one focused store.",
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
    {
      label: "Snake Repellers",
      keyword: "snake",
    },
    {
      label: "Solar Repellers",
      keyword: "solar",
    },
    {
      label: "Ultrasonic Devices",
      keyword: "ultrasonic",
    },
    {
      label: "Rodent Control",
      keyword: "rat mouse rodent",
    },
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