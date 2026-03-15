import Image from "next/image";

export function CalculatorHeader() {
  return (
    <header className="flex flex-col items-center gap-3 border-b border-muted pb-6 pt-4 md:pb-8 md:pt-6">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-surface shadow-sm ring-1 ring-muted md:h-20 md:w-20">
        <Image
          src="/logo.png"
          alt="4FutureFamily Logo"
          width={80}
          height={80}
          className="h-full w-full object-cover"
        />
      </div>
      <p className="typo-a1 text-foreground">
        Zukunftsplaner für dein Kind
      </p>
    </header>
  );
}

