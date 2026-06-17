/* ============================================================
   EL BANCO SUPLEMENTOS — script.js
   ============================================================ */

// ============================================================
// SITE CONFIG — update siteUrl once the production URL is known.
// Must match data/site-config.json.
// GitHub Pages project URL example:  https://username.github.io/repo-name
// Custom domain example:             https://www.bancodesuplementos.com.ar
// ============================================================
const SITE_CONFIG = {
  siteUrl:        "[FINAL_SITE_URL]",
  siteName:       "El Banco Suplementos",
  locale:         "es_AR",
  language:       "es-AR",
  currency:       "ARS",
  defaultOgImage: "[FINAL_SITE_URL]/banco-suplementos-og.webp"
};

// ============================================================
// PRODUCT DATA
// Source of truth: data/products.json
// After editing data/products.json run: node scripts/generate-product-pages.mjs
// Then keep image paths, prices, and stock status in sync here.
// ============================================================
const products = [

  // ── CREATINAS ─────────────────────────────────────────────
  {
    id: 15,
    slug: "creatina-star-300g",
    name: "Creatina Monohidrato 300g",
    brand: "Star Nutrition",
    category: "supplements",
    subcategory: "creatines",
    price: "$30.000",
    image: "creatina-star-300g.jpg",
    stock: true,
    badge: "Más Vendido",
    description: "Creatina monohidrato micronizada Star Nutrition 300g. Clínicamente probada para aumentar la fuerza, la potencia y la masa muscular magra. El suplemento más estudiado en nutrición deportiva.",
    characteristics: {
      presentation: "300g en polvo",
      flavor: "Sin sabor",
      servings: "60",
      goal: "Fuerza y Potencia"
    },
    nutritionTable: "creatina-star-300g-tabla.jpg",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Creatina%20Monohidrato%20300g%20Star%20Nutrition",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 16,
    slug: "creatina-granger-300g",
    name: "Creatina Monohidrato 300g",
    brand: "Granger",
    category: "supplements",
    subcategory: "creatines",
    price: "$28.000",
    image: "creatina-granger-300g.jpg",
    stock: true,
    badge: "Disponible",
    description: "Creatina monohidrato Granger 300g. Fórmula pura para aumentar la fuerza, la potencia explosiva y la masa muscular magra en cada sesión de entrenamiento.",
    characteristics: {
      presentation: "300g en polvo",
      flavor: "Sin sabor",
      servings: "60",
      goal: "Fuerza y Potencia"
    },
    nutritionTable: "creatina-granger-300g-tabla.jpg",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Creatina%20Monohidrato%20300g%20Granger",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 17,
    slug: "creatina-gentech-250g",
    name: "Creatina Monohidrato 250g",
    brand: "Gentech",
    category: "supplements",
    subcategory: "creatines",
    price: "$25.500",
    image: "creatina-gentech-250g.webp",
    stock: true,
    badge: "Disponible",
    description: "Creatina monohidrato Gentech 250g. Alta pureza para maximizar el rendimiento, la fuerza y la recuperación muscular entre sesiones.",
    characteristics: {
      presentation: "250g en polvo",
      flavor: "Sin sabor",
      servings: "50",
      goal: "Fuerza y Potencia"
    },
    nutritionTable: "creatina-gentech-250g-tabla.png",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Creatina%20Monohidrato%20250g%20Gentech",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },

  // ── PROTEÍNAS ─────────────────────────────────────────────
  {
    id: 1,
    slug: "whey-gentech-500g-chocolate",
    name: "Proteína Gentech 500g Chocolate",
    brand: "Gentech",
    category: "supplements",
    subcategory: "proteins",
    price: "$34.000",
    image: "whey-gentech-500g-chocolate.png",
    stock: true,
    badge: "Disponible",
    description: "Proteína en polvo Gentech sabor chocolate, presentación de 500g. Ideal para el aporte proteico post-entrenamiento y la recuperación muscular.",
    characteristics: {
      presentation: "500g en polvo",
      flavor: "Chocolate",
      servings: "~16",
      goal: "Volumen y Recuperación"
    },
    nutritionTable: "whey-gentech-500g-chocolate-tabla.png",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Prote%C3%ADna%20Gentech%20500g%20Chocolate",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 2,
    slug: "proteina-vegetal-gold-nutrition",
    name: "Proteína Vegetal",
    brand: "Gold Nutrition",
    category: "supplements",
    subcategory: "proteins",
    price: "$45.000",
    image: "proteina-vegetal-gold-nutrition.webp",
    stock: true,
    badge: "Disponible",
    description: "Proteína de origen vegetal Gold Nutrition. Apta para veganos y personas con intolerancia a la lactosa. Excelente perfil de aminoácidos para la recuperación.",
    characteristics: {
      presentation: "En polvo",
      flavor: "Natural",
      servings: "Variable",
      goal: "Volumen y Recuperación (Vegano)"
    },
    nutritionTable: "proteina-vegetal-gold-nutrition-tabla.webp",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Prote%C3%ADna%20Vegetal%20Gold%20Nutrition",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },

  // ── VITAMINAS / SUPLEMENTOS ───────────────────────────────
  {
    id: 3,
    slug: "vitamina-c-natier",
    name: "Vitamina C",
    brand: "Natier",
    category: "supplements",
    subcategory: "vitamins",
    price: "$20.000",
    image: "vitamina-c-natier.webp",
    stock: true,
    badge: "Disponible",
    description: "Vitamina C Natier para reforzar el sistema inmune, mejorar la recuperación y actuar como antioxidante. Ideal como complemento diario.",
    characteristics: {
      presentation: "Comprimidos",
      flavor: "Sin sabor",
      servings: "Variable",
      goal: "Sistema Inmune y Salud"
    },
    nutritionTable: "vitamina-c-natier-tabla.webp",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Vitamina%20C%20Natier",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 4,
    slug: "cafeina-ena",
    name: "Cafeína",
    brand: "ENA",
    category: "supplements",
    subcategory: "vitamins",
    price: "$12.000",
    image: "cafeina-ena.webp",
    stock: true,
    badge: "Disponible",
    description: "Cafeína en comprimidos ENA. Aumenta la energía, el enfoque y el rendimiento deportivo. Ideal como pre-entrenamiento. Sin azúcar, sin calorías.",
    characteristics: {
      presentation: "Comprimidos",
      flavor: "Sin sabor",
      servings: "Variable",
      goal: "Energía y Performance"
    },
    nutritionTable: "cafeina-ena-tabla.webp",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Cafe%C3%ADna%20ENA",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },

  // ── BARRAS — INTEGRA ──────────────────────────────────────
  {
    id: 5,
    slug: "barrita-integra-arandano",
    name: "Integra Barrita Arándano",
    brand: "Integra",
    category: "protein-bars",
    subcategory: "integra",
    price: "$20.000",
    image: "barrita-integra-arandano.jpg",
    stock: true,
    badge: "Disponible",
    description: "Barrita Integra sabor arándano. Alta en proteínas y baja en azúcar. Snack ideal entre comidas para mantener el aporte proteico sin romper la dieta.",
    characteristics: {
      presentation: "Cajita individual",
      flavor: "Arándano",
      servings: "1 barra",
      goal: "Aporte de Proteína y Saciedad"
    },
    nutritionTable: "barrita-integra-arandano-tabla.jpg",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Barrita%20Integra%20Ar%C3%A1ndano",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 6,
    slug: "barrita-integra-mani",
    name: "Integra Barrita Maní",
    brand: "Integra",
    category: "protein-bars",
    subcategory: "integra",
    price: "$20.000",
    image: "barrita-integra-mani.jpg",
    stock: true,
    badge: "Disponible",
    description: "Barrita Integra sabor maní. Alta en proteínas y baja en azúcar. Snack ideal entre comidas para mantener el aporte proteico sin romper la dieta.",
    characteristics: {
      presentation: "Cajita individual",
      flavor: "Maní",
      servings: "1 barra",
      goal: "Aporte de Proteína y Saciedad"
    },
    nutritionTable: "barrita-integra-mani-tabla.jpg",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Barrita%20Integra%20Man%C3%AD",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },

  // ── BARRAS — CRUDDA ───────────────────────────────────────
  {
    id: 7,
    slug: "barrita-crudda-banana",
    name: "Crudda Barrita Banana",
    brand: "Crudda",
    category: "protein-bars",
    subcategory: "crudda",
    price: "$20.000",
    image: "barrita-crudda-banana.webp",
    stock: true,
    badge: "Disponible",
    description: "Barrita Crudda sabor banana. Ingredientes naturales, sin conservantes artificiales. Nutrición de etiqueta limpia para atletas conscientes.",
    characteristics: {
      presentation: "Caja de 10U",
      flavor: "Banana",
      servings: "Variable",
      goal: "Nutrición Limpia y Energía"
    },
    nutritionTable: "barrita-crudda-banana-tabla.webp",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Barrita%20Crudda%20Banana",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 8,
    slug: "barrita-crudda-coco",
    name: "Crudda Barrita Coco",
    brand: "Crudda",
    category: "protein-bars",
    subcategory: "crudda",
    price: "$20.000",
    image: "barrita-crudda-coco.webp",
    stock: true,
    badge: "Disponible",
    description: "Barrita Crudda sabor coco. Ingredientes naturales, sin conservantes artificiales. Nutrición de etiqueta limpia para atletas conscientes.",
    characteristics: {
      presentation: "Caja de 10U",
      flavor: "Coco",
      servings: "Variable",
      goal: "Nutrición Limpia y Energía"
    },
    nutritionTable: "barrita-crudda-coco-tabla.webp",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Barrita%20Crudda%20Coco",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 9,
    slug: "barrita-crudda-avellana",
    name: "Crudda Barrita Avellana",
    brand: "Crudda",
    category: "protein-bars",
    subcategory: "crudda",
    price: "$20.000",
    image: "barrita-crudda-avellana.jpg",
    stock: true,
    badge: "Disponible",
    description: "Barrita Crudda sabor avellana. Ingredientes naturales, sin conservantes artificiales. Nutrición de etiqueta limpia para atletas conscientes.",
    characteristics: {
      presentation: "Caja de 10U",
      flavor: "Avellana",
      servings: "Variable",
      goal: "Nutrición Limpia y Energía"
    },
    nutritionTable: "barrita-crudda-avellana-tabla.jpg",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Barrita%20Crudda%20Avellana",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 10,
    slug: "barrita-crudda-brownie",
    name: "Crudda Barrita Brownie",
    brand: "Crudda",
    category: "protein-bars",
    subcategory: "crudda",
    price: "$20.000",
    image: "barrita-crudda-brownie.webp",
    stock: true,
    badge: "Disponible",
    description: "Barrita Crudda sabor brownie. Ingredientes naturales, sin conservantes artificiales. Nutrición de etiqueta limpia para atletas conscientes.",
    characteristics: {
      presentation: "Caja de 10U",
      flavor: "Brownie",
      servings: "Variable",
      goal: "Nutrición Limpia y Energía"
    },
    nutritionTable: "barrita-crudda-brownie-tabla.webp",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Barrita%20Crudda%20Brownie",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 11,
    slug: "barrita-crudda-mani",
    name: "Crudda Barrita Maní",
    brand: "Crudda",
    category: "protein-bars",
    subcategory: "crudda",
    price: "$20.000",
    image: "barrita-crudda-mani.jpg",
    stock: true,
    badge: "Disponible",
    description: "Barrita Crudda sabor maní. Ingredientes naturales, sin conservantes artificiales. Nutrición de etiqueta limpia para atletas conscientes.",
    characteristics: {
      presentation: "Caja de 10U",
      flavor: "Maní",
      servings: "Variable",
      goal: "Nutrición Limpia y Energía"
    },
    nutritionTable: "barrita-crudda-mani-tabla.jpg",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Barrita%20Crudda%20Man%C3%AD",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 12,
    slug: "barrita-crudda-arandanos",
    name: "Crudda Barrita Arándanos",
    brand: "Crudda",
    category: "protein-bars",
    subcategory: "crudda",
    price: "$20.000",
    image: "barrita-crudda-arandanos.webp",
    stock: true,
    badge: "Disponible",
    description: "Barrita Crudda sabor arándanos. Ingredientes naturales, sin conservantes artificiales. Nutrición de etiqueta limpia para atletas conscientes.",
    characteristics: {
      presentation: "Caja de 10U",
      flavor: "Arándanos",
      servings: "Variable",
      goal: "Nutrición Limpia y Energía"
    },
    nutritionTable: "barrita-crudda-arandanos-tabla.webp",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Barrita%20Crudda%20Ar%C3%A1ndano",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },

  // ── BARRAS — PONT ─────────────────────────────────────────
  {
    id: 13,
    slug: "barrita-pont",
    name: "Pont Barrita",
    brand: "Pont",
    category: "protein-bars",
    subcategory: "pont",
    price: "$26.500",
    image: "barrita-pont.webp",
    stock: true,
    badge: "Disponible",
    description: "Caja de barras Pont. Alta en proteínas con cobertura de chocolate. Baja en azúcar y alta en fibra. Sabor indulgente sin comprometer tus objetivos.",
    characteristics: {
      presentation: "Caja de 12U",
      flavor: "Chocolate",
      servings: "12",
      goal: "Proteína y Sabor"
    },
    nutritionTable: "barrita-pont-tabla.webp",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20la%20Barrita%20Pont",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },

  // ── COMBOS ────────────────────────────────────────────────
  {
    id: 18,
    slug: "combo-crudda-pont",
    name: "Combo Crudda + Pont",
    brand: "Crudda",
    category: "combos",
    subcategory: "combos",
    price: "$42.000",
    image: "combo-crudda-pont.png",
    stock: true,
    badge: "Combo",
    description: "Mix de 2X Cajas de barritas proteicas de diferentes marcas y sabores. Probá Crudda y Pont en un solo combo. Ideal para variedad y descubrir tu favorita.",
    characteristics: {
      presentation: "2X Cajas X10 unidades",
      flavor: "A elección",
      servings: "22",
      goal: "Proteína y Ahorro"
    },
    nutritionTable: null,
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20el%20Combo%20Crudda%20Caja%20x12",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 19,
    slug: "combo-integra-pont",
    name: "Combo Integra + Pont",
    brand: "Integra",
    category: "combos",
    subcategory: "combos",
    price: "$42.000",
    image: "combo-integra-pont.png",
    stock: true,
    badge: "Combo",
    description: "Mix de 2X Cajas de barritas proteicas de diferentes marcas y sabores. Probá Integra y Pont en un solo combo. Ideal para variedad y descubrir tu favorita.",
    characteristics: {
      presentation: "2X Cajas X10 unidades",
      flavor: "A elección",
      servings: "22",
      goal: "Proteína y Ahorro"
    },
    nutritionTable: null,
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20el%20Combo%20Integra%20Caja%20x12",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 20,
    slug: "combo-mixto-3cajas-crudda-integra",
    name: "Combo Mixto 3X Cajas Crudda / Integra",
    brand: "Pont",
    category: "combos",
    subcategory: "combos",
    price: "$56.000",
    image: "combo-mixto-3cajas-crudda-integra.png",
    stock: true,
    badge: "Combo",
    description: "Mix de 3X Cajas de barritas proteicas de diferentes marcas y sabores. Probá Integra y Crudda en un solo combo. Ideal para variedad y descubrir tu favorita.",
    characteristics: {
      presentation: "3X Cajas X10 unidades",
      flavor: "Variedad",
      servings: "30",
      goal: "Proteína y Ahorro"
    },
    nutritionTable: null,
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20el%20Combo%20Pont%20Caja%20x12",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 21,
    slug: "combo-mixto-5cajas-crudda-integra",
    name: "Combo Mixto 5X Cajas Crudda / Integra",
    brand: "El Banco",
    category: "combos",
    subcategory: "combos",
    price: "$90.000",
    image: "combo-mixto-5cajas-crudda-integra.png",
    stock: true,
    badge: "Combo",
    description: "Mix de 5X Cajas de barritas proteicas de diferentes marcas y sabores. Probá Integra y Crudda en un solo combo. Ideal para variedad y descubrir tu favorita.",
    characteristics: {
      presentation: "5X Cajas X10 unidades",
      flavor: "Variedad",
      servings: "50",
      goal: "Proteína y Variedad"
    },
    nutritionTable: null,
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20el%20Combo%20Mixto%20Barritas%20x12",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },

  {
    id: 22,
    slug: "combo-proteina-creatina-gentech",
    name: "Combo Proteína + Creatina Gentech",
    brand: "Gentech",
    category: "combos",
    subcategory: "combos",
    price: "Consultar",
    image: "combo-proteina-creatina-gentech.png",
    stock: true,
    badge: "Combo",
    description: "Combo Gentech: Proteína en polvo + Creatina Monohidrato 250g. La dupla perfecta para maximizar el rendimiento, la recuperación y el crecimiento muscular.",
    characteristics: {
      presentation: "Proteína 500g + Creatina 250g",
      flavor: "A elección",
      servings: "Variable",
      goal: "Fuerza, Volumen y Recuperación"
    },
    nutritionTable: null,
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20el%20Combo%20Prote%C3%ADna%20%2B%20Creatina%20Gentech",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 23,
    slug: "combo-shaker-proteina-gentech",
    name: "Combo Shaker + Proteína Gentech",
    brand: "Gentech",
    category: "combos",
    subcategory: "combos",
    price: "$40.000",
    image: "combo-shaker-proteina-gentech.png",
    stock: true,
    badge: "Combo",
    description: "Combo Gentech: Proteína en polvo + Shaker. Todo lo que necesitás para empezar: tu proteína y el vaso mezclador para prepararla en cualquier momento y lugar.",
    characteristics: {
      presentation: "Proteína 500g + Shaker",
      flavor: "A elección",
      servings: "16",
      goal: "Volumen y Recuperación"
    },
    nutritionTable: null,
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20el%20Combo%20Prote%C3%ADna%20%2B%20Shaker%20Gentech",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },
  {
    id: 24,
    slug: "combo-shaker-proteina-gold-nutrition",
    name: "Combo Shaker + Proteína Vegana Gold Nutrition",
    brand: "Gold Nutrition",
    category: "combos",
    subcategory: "combos",
    price: "$50.000",
    image: "combo-shaker-proteina-gold-nutrition.png",
    stock: true,
    badge: "Combo",
    description: "Combo Gold Nutrition: Proteína Vegana en polvo + Shaker. La combinación ideal para incorporar tu suplemento con el equipo completo desde el primer día.",
    characteristics: {
      presentation: "Proteína 907g + Shaker",
      flavor: "Neutro",
      servings: "30",
      goal: "Volumen y Recuperación"
    },
    nutritionTable: null,
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20el%20Combo%20Prote%C3%ADna%20%2B%20Shaker%20Gold%20Nutrition",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  },

  // ── ACCESORIOS ────────────────────────────────────────────
  {
    id: 14,
    slug: "shaker-ena-plus",
    name: "Shaker ENA Plus",
    brand: "ENA",
    category: "accessories",
    subcategory: "accessories",
    price: "$7.400",
    image: "shaker-ena-plus.jpg",
    stock: true,
    badge: "Disponible",
    description: "Shaker ENA Plus. Vaso mezclador con amplia capacidad, diseño ergonómico y tapa hermética a prueba de filtraciones. Ideal para preparar proteínas y suplementos en polvo.",
    characteristics: {
      presentation: "Unidad",
      flavor: "-",
      servings: "-",
      goal: "Accesorio Deportivo"
    },
    nutritionTable: "shaker-ena-plus-tabla.jpg",
    links: {
      whatsapp: "https://wa.me/5491124602875?text=Hola%2C%20me%20interesa%20el%20Shaker%20ENA%20Plus",
      instagram: "https://www.instagram.com/bancodesuplementos",
    }
  }
];

// ============================================================
// STATE
// ============================================================
let activeFilter = "all";
let activeBrand  = "all";
let searchQuery  = "";

// ============================================================
// UTILITIES
// ============================================================
function getInitials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function getBadgeClass(badge) {
  const map = {
    "Más Vendido": "badge--gold",
    "Nuevo":       "badge--blue",
    "Promo":       "badge--red",
    "Disponible":  "badge--green",
    "Combo":       "badge--gold"
  };
  return map[badge] || "";
}

// ============================================================
// FILTER
// ============================================================
function getFilteredProducts() {
  const barBrands = ["integra", "crudda", "pont", "wik"];

  return products.filter(p => {
    let matchFilter = activeFilter === "all";
    if (!matchFilter) {
      if (activeFilter === "protein-bars") {
        matchFilter = p.category === "protein-bars" || p.category === "combos";
      } else if (activeFilter === "combos") {
        matchFilter = p.category === "combos";
      } else if (barBrands.includes(activeFilter)) {
        matchFilter = p.subcategory === activeFilter;
      } else {
        matchFilter = p.subcategory === activeFilter || p.category === activeFilter;
      }
    }

    const matchBrand = activeBrand === "all" || p.brand === activeBrand;

    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);

    return matchFilter && matchBrand && matchSearch;
  });
}

// ============================================================
// CARD TEMPLATE
// ============================================================
function createCard(p) {
  const badge = p.badge
    ? `<span class="card-badge ${getBadgeClass(p.badge)}">${p.badge}</span>`
    : "";
  const stockLabel = p.stock ? "Disponible" : "Agotado";
  const stockClass = p.stock ? "stock--available" : "stock--out";

  return `
    <div class="product-card" data-id="${p.id}">
      <div class="card-image-wrap">
        <div class="card-image">
          <img
            src="${p.image}"
            alt="${p.name}"
            loading="lazy"
            onerror="this.style.display='none'"
          />
        </div>
        ${badge}
        <div class="card-overlay">
          <h4 class="overlay-title">Info Rápida</h4>
          <table class="overlay-table">
            <tr><td>Marca</td><td>${p.brand}</td></tr>
            <tr><td>Presentación</td><td>${p.characteristics.presentation}</td></tr>
            <tr><td>Sabor</td><td>${p.characteristics.flavor}</td></tr>
            <tr><td>Porciones</td><td>${p.characteristics.servings}</td></tr>
            <tr><td>Objetivo</td><td>${p.characteristics.goal}</td></tr>
            <tr><td>Stock</td><td><span class="${stockClass}">${stockLabel}</span></td></tr>
          </table>
        </div>
      </div>
      <div class="card-body">
        <p class="card-brand">${p.brand}</p>
        <h3 class="card-name">${p.name}</h3>
        <p class="card-price">${p.price}</p>
        <div class="card-actions">
          <a href="${p.links.whatsapp}" target="_blank" rel="noopener noreferrer"
             class="btn btn-whatsapp btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
          <a href="productos/${p.slug}.html" class="btn btn-outline btn-sm"
             onclick="event.preventDefault(); openModal(${p.id})">
            Ver Detalles
          </a>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// RENDER
// ============================================================
const sectionMap = {
  creatines:    "creatines",
  proteins:     "proteins",
  vitamins:     "vitamins",
  integra:      "protein-bars",
  crudda:       "protein-bars",
  pont:         "protein-bars",
  wik:          "protein-bars",
  combos:       "combos",
  accessories:  "accessories"
};

function renderProducts() {
  const filtered = getFilteredProducts();

  const grouped = {
    "creatines":    [],
    "proteins":     [],
    "vitamins":     [],
    "protein-bars": [],
    "combos":       [],
    "accessories":  []
  };

  filtered.forEach(p => {
    const section = sectionMap[p.subcategory];
    if (section) grouped[section].push(p);
  });

  let totalVisible = 0;

  Object.keys(grouped).forEach(sectionId => {
    const grid    = document.getElementById(`grid-${sectionId}`);
    const section = document.getElementById(sectionId);
    const items   = grouped[sectionId];
    if (!grid || !section) return;

    if (items.length === 0) {
      section.style.display = "none";
    } else {
      section.style.display = "block";
      grid.innerHTML = items.map(createCard).join("");
      totalVisible += items.length;
    }
  });

  const noResults = document.getElementById("noResults");
  if (noResults) noResults.style.display = totalVisible === 0 ? "flex" : "none";
}

// ============================================================
// MODAL
// ============================================================
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  document.getElementById("modalName").textContent        = p.name;
  document.getElementById("modalBrand").textContent       = p.brand;
  document.getElementById("modalPrice").textContent       = p.price;
  document.getElementById("modalDescription").textContent = p.description;

  const badgeEl = document.getElementById("modalBadge");
  if (p.badge) {
    badgeEl.textContent  = p.badge;
    badgeEl.className    = `modal-badge ${getBadgeClass(p.badge)}`;
    badgeEl.style.display = "inline-block";
  } else {
    badgeEl.style.display = "none";
  }

  const modalImg = document.getElementById("modalImg");
  modalImg.src   = p.image;
  modalImg.alt   = p.name;
  modalImg.style.display = "block";

  const stockLabel = p.stock ? "Disponible" : "Agotado";
  const stockClass = p.stock ? "stock--available" : "stock--out";
  const c = p.characteristics;
  document.getElementById("modalCharsTable").innerHTML = `
    <tr><th>Marca</th><td>${p.brand}</td></tr>
    <tr><th>Presentación</th><td>${c.presentation}</td></tr>
    <tr><th>Sabor</th><td>${c.flavor}</td></tr>
    <tr><th>Porciones</th><td>${c.servings}</td></tr>
    <tr><th>Objetivo</th><td>${c.goal}</td></tr>
    <tr><th>Stock</th><td><span class="${stockClass}">${stockLabel}</span></td></tr>
  `;

  document.getElementById("modalWA").href = p.links.whatsapp;

  const modalProductPage = document.getElementById("modalProductPage");
  if (p.slug) {
    modalProductPage.href = `productos/${p.slug}.html`;
    modalProductPage.setAttribute("aria-label", `Ver página completa de ${p.name}`);
    modalProductPage.style.display = "";
  } else {
    modalProductPage.removeAttribute("href");
    modalProductPage.style.display = "none";
  }

  const nutritionImg    = document.getElementById("nutritionImg");
  const nutritionToggle = document.getElementById("nutritionToggle");
  if (p.nutritionTable) {
    nutritionImg.src            = p.nutritionTable;
    nutritionImg.alt            = `${p.name} — Tabla Nutricional`;
    nutritionToggle.style.display = "";
  } else {
    nutritionImg.src            = "";
    nutritionToggle.style.display = "none";
  }
  document.getElementById("nutritionWrap").style.display = "none";
  nutritionToggle.textContent = "Información Nutricional";

  document.getElementById("modalOverlay").classList.add("modal--active");
  document.body.classList.add("modal-open");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("modal--active");
  document.body.classList.remove("modal-open");
}

// ============================================================
// INIT — FILTERS
// ============================================================
function initFilters() {
  document.querySelectorAll(".pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeFilter = pill.dataset.filter;
      renderProducts();
      scrollToCatalog();
    });
  });

  document.getElementById("brandSelect").addEventListener("change", e => {
    activeBrand = e.target.value;
    renderProducts();
  });

  document.getElementById("searchInput").addEventListener("input", e => {
    searchQuery = e.target.value.trim();
    renderProducts();
  });
}

// ============================================================
// INIT — MODAL EVENTS
// ============================================================
function initModal() {
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", e => {
    if (e.target === document.getElementById("modalOverlay")) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  document.getElementById("nutritionToggle").addEventListener("click", () => {
    const wrap   = document.getElementById("nutritionWrap");
    const toggle = document.getElementById("nutritionToggle");
    const hidden = wrap.style.display === "none";
    wrap.style.display   = hidden ? "block" : "none";
    toggle.textContent   = hidden ? "Ocultar Info Nutricional" : "Información Nutricional";
  });

  document.getElementById("modalImg").addEventListener("error", function () {
    this.style.display = "none";
  });
}

// ============================================================
// INIT — MOBILE MENU
// ============================================================
function initMobileMenu() {
  const hamburger  = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("is-active");
    mobileMenu.classList.toggle("mobile-menu--open");
    document.body.classList.toggle("menu-open");
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("is-active");
      mobileMenu.classList.remove("mobile-menu--open");
      document.body.classList.remove("menu-open");
    });
  });

  // Mobile accordion submenus
  mobileMenu.querySelectorAll(".mobile-parent-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const sub = btn.nextElementSibling;
      const isOpen = sub.classList.contains("submenu--open");
      mobileMenu.querySelectorAll(".mobile-submenu").forEach(s => s.classList.remove("submenu--open"));
      mobileMenu.querySelectorAll(".mobile-parent-btn").forEach(b => b.classList.remove("parent--open"));
      if (!isOpen) {
        sub.classList.add("submenu--open");
        btn.classList.add("parent--open");
      }
    });
  });
}

// ============================================================
// INIT — NAV DROPDOWN FILTERS
// ============================================================
function initNavFilters() {
  document.querySelectorAll("[data-filter]").forEach(link => {
    link.addEventListener("click", e => {
      const filter = link.dataset.filter;
      if (!filter) return;

      activeFilter = filter;

      // Map filter to pill
      const pillTarget = ["integra","crudda","pont","wik"].includes(filter)
        ? "protein-bars"
        : filter === "combos"
          ? "combos"
          : filter;

      document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      const pill = document.querySelector(`.pill[data-filter="${pillTarget}"]`);
      if (pill) pill.classList.add("active");

      renderProducts();
    });
  });
}

// ============================================================
// INIT — SMOOTH SCROLL
// ============================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const href = a.getAttribute("href");
      if (href === "#" || href === "#!") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// ============================================================
// INIT — INTERSECTION OBSERVER
// ============================================================
function initObserver() {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".product-section, .contact-section, .filters-bar").forEach(el => {
    observer.observe(el);
  });
}

// ============================================================
// INIT — HEADER SCROLL
// ============================================================
function initHeaderScroll() {
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("header--scrolled", window.scrollY > 60);
  }, { passive: true });
}

// ============================================================
// HELPER — SCROLL TO CATALOG
// ============================================================
function scrollToCatalog() {
  const catalog = document.getElementById("catalog");
  if (catalog) catalog.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ============================================================
// INIT — THEME TOGGLE
// ============================================================
function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
  }
  btn.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-mode");
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  initFilters();
  initModal();
  initMobileMenu();
  initSmoothScroll();
  initObserver();
  initNavFilters();
  initHeaderScroll();
  initThemeToggle();
});
