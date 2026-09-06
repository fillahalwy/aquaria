import Link from "next/link";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <Link 
      href="/" 
      className={`group inline-flex items-center gap-1.5 transition-all duration-300 select-none ${className}`}
    >
      <span className="font-extrabold tracking-[0.18em] text-white text-lg md:text-xl group-hover:text-amber-300 transition-colors uppercase font-sans">
        AQUARIA
      </span>
    </Link>
  );
}


