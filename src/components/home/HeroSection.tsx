import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen -mt-20 sm:-mt-24 pt-24 md:pt-28 flex flex-col justify-center items-center overflow-hidden">
      
      {/* Background Panoramic Image with Ambient Gradients */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-aquascape.jpg"
          alt="Majestic Nature Aquascape"
          fill
          priority
          className="object-cover object-center brightness-[0.88] contrast-[1.05]"
          sizes="100vw"
        />
        {/* Top subtle vignette for navbar readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0b1017]" />
        {/* Edge radial shadow */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60" />
      </div>

      {/* Hero Center Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 text-center flex flex-col items-center justify-center my-auto py-16">
        
        {/* Small Top Title */}
        <p className="text-xs sm:text-sm md:text-base font-medium tracking-[0.25em] uppercase text-white/90 mb-3 drop-shadow-md">
          Diving Into the World of
        </p>

        {/* Massive Display Title */}
        <h1 className="font-hero-title text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white tracking-[0.06em] leading-none drop-shadow-2xl select-none">
          AQUASCAPE
        </h1>

        {/* Subtitle Under Big Title */}
        <p className="mt-5 max-w-2xl text-xs sm:text-sm md:text-base text-slate-200 font-serif-luxury italic tracking-wide drop-shadow-md px-4">
          Discover the inspiration and beauty of the underwater ecosystem here.
        </p>

      </div>

    </section>
  );
}
