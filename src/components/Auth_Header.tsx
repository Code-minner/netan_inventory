// src/components/Auth_Header.tsx
import Image from "next/image";

export default function Auth_Header() {
  return (
    <div className="w-full max-w-[1200px] mx-auto pt-2">
      <Image
        src="/assets/logo.png"
        alt="Netan Logo"
        width={70}
        height={35}
        priority
        className="object-contain"
        style={{ width: "auto", height: "auto" }}
      />
    </div>
  );
}