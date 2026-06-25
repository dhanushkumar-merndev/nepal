"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { getLocaleFromPathname, localizePath } from "@/lib/locale";

type Props = LinkProps & Omit<React.ComponentProps<typeof Link>, keyof LinkProps> & {
  href: string;
};

export function LocaleLink({ href, ...props }: Props) {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);

  return <Link href={localizePath(href, locale)} {...props} />;
}
