import { Suspense } from "react";
import { CartPage } from "../../cart/page";

export default function CartPageWrapper() {
  return (
    <Suspense fallback={null}>
      <CartPage />
    </Suspense>
  );
}
