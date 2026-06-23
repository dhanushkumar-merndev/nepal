import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartSheet } from "@/components/site/cart-sheet";

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="mx-auto grid min-h-[60vh] w-full max-w-3xl place-items-center px-4 py-16 text-center">
        <div className="premium-card p-8">
          <h1 className="text-3xl font-bold">Your cart</h1>
          <p className="mt-3 text-[#555]">Open the cart drawer to review items and checkout on WhatsApp.</p>
          <div className="mt-6 flex justify-center">
            <CartSheet />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
