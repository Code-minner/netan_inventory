import Image from "next/image";

export default function AuthBranding() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center text-white overflow-hidden px-12">
      <div className=" mb-8">
        <Image src="/assets/logo.png" alt="Netan" width={64} height={64} />
      </div>

      <h2 className="text-3xl font-bold leading-tight max-w-sm">
        Inventory, orders, and customers in one place
      </h2>
    </div>
  );
}
