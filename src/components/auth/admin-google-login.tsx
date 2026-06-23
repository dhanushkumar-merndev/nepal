"use client";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth/sign-in-google";
import { signOut } from "@/lib/auth/sign-out";

export function AdminGoogleLogin({ signedIn }: { signedIn: boolean }) {
  return signedIn ? (
    <Button variant="secondary" onClick={() => signOut()}>
      Sign out
    </Button>
  ) : (
    <Button onClick={() => signInWithGoogle("/admin/login")}>Continue with Google</Button>
  );
}
