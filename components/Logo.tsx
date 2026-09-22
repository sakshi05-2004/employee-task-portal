import Image from "next/image";

export default function Logo({
  size = 36,
  showWordmark = true,
  className = "",
}: {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="relative shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-ink-100 shadow-sm"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="Startup Stairs"
          fill
          className="object-contain p-1"
          priority
        />
      </span>

      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-bold tracking-tight text-ink-900 text-lg">
            Startup Stairs
          </span>
          <span className="text-[11px] font-medium text-ink-400">
            Task Portal
          </span>
        </span>
      )}
    </span>
  );
}
