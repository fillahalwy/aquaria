import Image from "next/image";

interface AuthShowcaseCardProps {
  imageSrc?: string;
  altText?: string;
}

export default function AuthShowcaseCard({
  imageSrc = "/images/hero-aquascape.jpg",
  altText = "Aquascape visual showcase",
}: AuthShowcaseCardProps) {
  return (
    <div className="relative rounded-[24px] sm:rounded-[28px] overflow-hidden min-h-[380px] sm:min-h-[460px] md:min-h-[560px] lg:min-h-[620px] w-full bg-[#070b10] border border-white/10 shadow-md">
      <Image
        src={imageSrc}
        alt={altText}
        fill
        priority
        className="object-cover"
      />
    </div>
  );
}
