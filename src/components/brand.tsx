import Image from "next/image";

/** Real Trenchers.AI mark (public/logo.png). */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Trenchers.AI"
      width={138}
      height={138}
      priority
      className={`rounded-md object-contain ${className}`}
    />
  );
}
