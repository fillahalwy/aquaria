import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function WondersSection() {
  const wonders = [
    {
      id: "flora",
      title: "Aquatic Flora",
      image: "/images/flora-aquascape.jpg",
      alt: "Lush aquatic plants in nature aquascape",
      description:
        "The delicate beauty of aquatic flora like Rotala and Bucephalandra generates natural oxygen pearling while producing captivating depth and color gradients.",
    },
    {
      id: "fauna",
      title: "Aquatic Fauna",
      image: "/images/fauna-aquascape.jpg",
      alt: "Cardinal tetras and dwarf shrimp swimming in planted aquarium",
      description:
        "Vibrant aquatic fauna like schooling Cardinal Tetras and Caridina dwarf shrimp bring dynamic vitality and biological balance to the aquascape.",
    },
    {
      id: "substrate",
      title: "Nutrient Substrate",
      image: "/images/substrate-aquascape.jpg",
      alt: "Layered aqua soil and silica sand with plant roots",
      description:
        "Nutrient-rich aqua soil and mineral silica sand form the vital foundation for root growth and chemical parameter stability.",
    },
    {
      id: "hardscape",
      title: "Hardscape Architecture",
      image: "/images/hardscape-aquascape.jpg",
      alt: "Seiryu stone cliffs and driftwood mountain aquascape",
      description:
        "Sculpted Seiryu stones and aged driftwood serve as the structural backbone, establishing dramatic perspectives and natural canyon depth.",
    },
  ];

  return (
    <section className="relative z-10 py-20 px-4 sm:px-8 lg:px-14 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide text-white">
            The Wonders Of Aquascape
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-400 tracking-wider font-light max-w-xl">
            We seek to provide authentic inspiration and technical mastery for aquascapers around the world.
          </p>
        </div>

        {/* Circular Gold Arrow Button */}
        <Link
          href="/showcase"
          aria-label="Explore Showcase Gallery"
          className="w-11 h-11 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center hover:bg-amber-300 hover:scale-110 transition-all shadow-lg shadow-amber-400/20 self-start md:self-auto shrink-0"
        >
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </Link>
      </div>

      {/* 4 Portrait Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wonders.map((item) => (
          <div 
            key={item.id}
            className="group relative rounded-2xl overflow-hidden aspect-[3/4.2] border border-white/10 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-end p-4 shadow-xl"
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {/* Dark vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            
            {/* Uniform Fixed-Height Bottom Info Overlay Capsule */}
            <div className="relative z-10 w-full h-28 sm:h-32 flex items-center p-3.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-slate-200">
              <p className="text-[11px] sm:text-xs leading-relaxed line-clamp-4">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
