/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { signInWithGoogle } from "@/lib/auth/sign-in-google";
import { signOut } from "@/lib/auth/sign-out";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AnimatedStars } from "@/components/site/animated-stars";
import { CustomSelect } from "@/components/site/custom-select";

type Product = { id: string; name: string; logo_url?: string | null };
const REVIEW_FORM_SEEN_COOKIE = "review_form_seen";

export function ReviewForm({ products }: { products: Product[] }) {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    name?: string;
    avatarUrl?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [firstVisitReveal] = useState(() => !hasCookie(REVIEW_FORM_SEEN_COOKIE));

  useEffect(() => {
    if (!firstVisitReveal) return;
    document.cookie = `${REVIEW_FORM_SEEN_COOKIE}=true; max-age=${60 * 60 * 24 * 90}; path=/; samesite=lax`;
  }, [firstVisitReveal]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      window.requestAnimationFrame(() => setLoading(false));
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        setUser({
          id: u.id,
          email: u.email,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "User",
          avatarUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !comment.trim()) {
      toast.error("Please select a service and write a review.");
      return;
    }
    if (comment.trim().length < 20) {
      toast.error("Review must be at least 20 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, rating, comment: comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit review");
      } else {
        setProductId("");
        setComment("");
        setRating(5);
        setShowConfirm(true);
      }
    } catch {
      toast.error("Something went wrong");
    }
    setSubmitting(false);
  }

  if (loading) return null;

  return (
    <motion.div
      initial={!isMobile && firstVisitReveal ? { opacity: 0, y: 12, scale: 0.99 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-3xl border border-black/10 bg-white p-6"
    >
      <h2 className="text-lg font-bold">Write a review</h2>

      {!user ? (
        <div className="mt-4">
          <p className="text-sm text-[#555]">Sign in with Google to leave a review.</p>
          <Button className="mt-3" onClick={() => signInWithGoogle("/reviews")}>
            Sign in with Google
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="size-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full bg-[#E6F7FD] font-bold text-[#0B7FAE]">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-bold">{user.name}</p>
              <p className="text-xs text-[#555]">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                window.location.reload();
              }}
              className="ml-auto text-xs text-[#DC2626] hover:underline"
            >
              Sign out
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-[#555]">Service</label>
            <div className="mt-1">
              <CustomSelect
                options={products.map((p) => ({ value: p.id, label: p.name, imageUrl: p.logo_url }))}
                value={productId}
                onChange={setProductId}
                placeholder="Select a service"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#555]">Rating</label>
            <div className="mt-1">
              <AnimatedStars value={rating} onChange={setRating} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#555]">Your review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              maxLength={1000}
              className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#159FD3]"
            />
            <p className="mt-1 text-right text-[10px] text-[#555]">{comment.length}/1000 {comment.trim().length < 20 ? <span className="text-[#DC2626]">(min 20)</span> : null}</p>
          </div>

          <Button type="submit" loading={submitting} disabled={!productId || comment.trim().length < 20}>
            Submit review
          </Button>
        </form>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100">
              <svg className="size-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold">Review submitted!</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#555]">
              Your review will be visible on our website after admin approval within 24 hours.
            </p>
            <Button className="mt-6 w-full" onClick={() => setShowConfirm(false)}>
              Got it
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function hasCookie(name: string) {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((cookie) => cookie === `${name}=true`);
}
