import Link from "next/link";
import type { Product } from "@/lib/types";

export function ProductModal({ product }: { product: Product }) {
  return (
    <Link
      href={`/plans/${product.slug}`}
      className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#E6F7FD]"
    >
      View Plans
    </Link>
  );
}
