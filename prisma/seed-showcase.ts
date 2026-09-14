import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Showcase posts...");

  // Find or pick users
  const users = await prisma.user.findMany({
    take: 5,
  });

  if (users.length === 0) {
    console.log("No users found to attach showcases to.");
    return;
  }

  const takashi = users.find((u) => u.username === "takashiamano") || users[0];
  const awan = users.find((u) => u.username === "awanaqua") || users[1] || users[0];
  const green = users.find((u) => u.username === "greennature") || users[2] || users[0];

  const sampleShowcases = [
    {
      title: "Misty Mountain Seiryu San",
      style: "Iwagumi",
      description:
        "Inspired by traditional Japanese zen gardens, this 90cm Iwagumi layout focuses on the spiritual balance between unyielding Seiryu stone formations and the soft, rolling carpet of Glossostigma and Dwarf Baby Tears.",
      imageUrl: "/images/hero-aquascape.jpg",
      sizeSpan: "wide",
      dimensions: "90x45x45 cm",
      lighting: "Chihiros WRGB II Pro 90cm (7 hours daily, 85% intensity)",
      co2System: "Pressurized CO2 (3.5 bps) via in-line atomizer, drop checker lime green",
      hardscape: "42 kg Grade-A Seiryu Stone, ADA Colorado Sand foreground",
      plants: [
        "Glossostigma Elatinoides",
        "Hemianthus Callitrichoides 'Cuba'",
        "Eleocharis Mini",
        "Riccardia Chamedryfolia",
      ],
      fauna: [
        "30x Paracheirodon Axelrodi (Cardinal Tetra)",
        "12x Otocinclus Affinis",
        "25x Neocaridina Davidi 'Blue Dream'",
      ],
      likesCount: 142,
      userId: takashi.id,
      comments: [
        {
          content: "The focal stone angle creates incredible natural tension! Did you use eggcrate under the stones?",
          userId: awan.id,
        },
        {
          content: "Yes, 10mm corrugated plastic sheets protect the bottom glass from the main Oyaishi stone weight.",
          userId: takashi.id,
        },
      ],
    },
    {
      title: "Emerald Primeval Canopy",
      style: "Nature Aquarium",
      description:
        "A lush high-tech jungle layout showcasing layered aquatic stems with dramatic color transitions from deep green Bucephalandra to fiery orange Rotala macrandra highlights.",
      imageUrl: "/images/flora-aquascape.jpg",
      sizeSpan: "tall",
      dimensions: "60x30x36 cm",
      lighting: "Twinstar 600EA LED (8 hours daily)",
      co2System: "Pressurized CO2 (2 bps) with glass pollen diffuser",
      hardscape: "Old Black Wood roots + Lava Rocks as base",
      plants: [
        "Rotala Rotundifolia 'H'ra'",
        "Bucephalandra Brownie Ghost",
        "Anubias Nana Petite",
        "Microsorum Pteropus 'Trident'",
        "Staurogyne Repens",
      ],
      fauna: [
        "15x Trigonostigma Espei (Lambchop Rasbora)",
        "8x Caridina Multidentata (Amano Shrimp)",
        "2x Microgeophagus Ramirezi",
      ],
      likesCount: 98,
      userId: green.id,
      comments: [
        {
          content: "That Bucephalandra cluster is gorgeous. How long did it take to establish this growth?",
          userId: takashi.id,
        },
      ],
    },
    {
      title: "Crimson River Biotope",
      style: "Biotope",
      description:
        "A blackwater-tinted South American tributary biotope featuring botanicals, fallen leaves, and tangled mangrove roots providing shelter for delicate wild tetras.",
      imageUrl: "/images/fauna-aquascape.jpg",
      sizeSpan: "normal",
      dimensions: "45x30x30 cm",
      lighting: "Kessil A80 Tuna Sun (Warm 4500K spectrum, dim moonlight phase)",
      co2System: "Low tech / Natural organic CO2 from decomposition",
      hardscape: "Mangrove Roots, Alder Cones, Catappa Leaves",
      plants: [
        "Echinodorus Tenellus",
        "Hydrocotyle Tripartita",
        "Taxiphyllum Barbieri (Java Moss)",
      ],
      fauna: [
        "10x Nannostomus Marginatus (Dwarf Pencilfish)",
        "6x Corydoras Pygmaeus",
        "4x Clithon Corona (Horned Nerite)",
      ],
      likesCount: 76,
      userId: awan.id,
      comments: [
        {
          content: "The water tint and gentle flow give it an authentic Amazonian vibe. Well done!",
          userId: green.id,
        },
      ],
    },
    {
      title: "Dragon Ridge Canyon",
      style: "Nature Aquarium",
      description:
        "Aggressive vertical hardscape constructed with premium Dragon Stone, featuring deep canyon crevices planted with mosses and delicate foreground hairgrass.",
      imageUrl: "/images/hardscape-aquascape.jpg",
      sizeSpan: "tall",
      dimensions: "60x40x40 cm",
      lighting: "Week Aqua Z400 Pro (7.5 hours daily)",
      co2System: "Pressurized CO2 (3 bps), intense aeration during dark photoperiod",
      hardscape: "28 kg Ohko Dragon Stone + River Sand path",
      plants: [
        "Eleocharis Parvula",
        "Fissidens Fontanus",
        "Pogostemon Helferi",
        "Rotala Vietnam H'ra",
      ],
      fauna: [
        "20x Boraras Brigittae (Chili Rasbora)",
        "10x Caridina cf. Cantonensis (Crystal Red Shrimp)",
      ],
      likesCount: 115,
      userId: takashi.id,
      comments: [
        {
          content: "How did you secure the dragon stone towers against collapse?",
          userId: awan.id,
        },
      ],
    },
    {
      title: "Substrate & Mineral Roots System",
      style: "Dutch Style",
      description:
        "High density Dutch-style streets emphasizing distinct stem plant contrasts, optimized nutrient substrate layering, and rigorous dosing schedule.",
      imageUrl: "/images/substrate-aquascape.jpg",
      sizeSpan: "normal",
      dimensions: "120x50x50 cm",
      lighting: "Dual Chihiros Vivid II (8 hours daily + ramp)",
      co2System: "Reactor 1000 pressurized system with pH controller (pH 6.4)",
      hardscape: "Substrate-only Dutch layout, ADA Amazonia Ver.2 with Power Sand",
      plants: [
        "Ludwigia Glandulosa",
        "Alternanthera Reineckii 'Mini'",
        "Pogostemon Erectus",
        "Lobelia Cardinalis",
        "Eriocaulon Cinereum",
      ],
      fauna: [
        "40x Hemigrammus Rhodostomus (Rummy Nose Tetra)",
        "15x Otocinclus Cocama (Zebra Otocinclus)",
        "30x Caridina Caridias",
      ],
      likesCount: 89,
      userId: green.id,
      comments: [],
    },
  ];

  for (const item of sampleShowcases) {
    const { comments, ...showcaseData } = item;
    
    // Check if showcase already exists
    const existing = await prisma.showcasePost.findFirst({
      where: { title: showcaseData.title },
    });

    if (!existing) {
      const created = await prisma.showcasePost.create({
        data: showcaseData,
      });

      if (comments && comments.length > 0) {
        for (const comm of comments) {
          await prisma.comment.create({
            data: {
              content: comm.content,
              showcaseId: created.id,
              userId: comm.userId,
            },
          });
        }
      }
      console.log(`Created showcase: "${showcaseData.title}"`);
    } else {
      console.log(`Showcase "${showcaseData.title}" already exists.`);
    }
  }

  console.log("Showcase seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
