import { formatPrice } from "@/lib/catalog";

type Props = { price: number | null; compareAt: number | null; size?: "sm" | "md" | "lg"; className?: string };

const sizes = { sm: "text-[17px]", md: "text-lead", lg: "text-[40px] leading-none" };

/** Prix actuel + prix de référence barré. Les placeholders restent lisibles et marqués. */
export function Price({ price, compareAt, size = "sm", className = "" }: Props) {
  return (
    <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${className}`}>
      <span className={`price ${sizes[size]} ${price == null ? "ph" : ""}`}>{formatPrice(price)}</span>
      <s className={`text-ink-3 ${size === "lg" ? "text-body" : "text-micro"} ${compareAt == null ? "ph" : ""}`}>
        <span className="sr-only">Prix de référence : </span>
        {formatPrice(compareAt, "[PRIX DE RÉFÉRENCE]")}
      </s>
    </div>
  );
}
