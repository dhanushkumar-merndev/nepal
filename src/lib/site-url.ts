export const SITE_URL = "https://www.ottsubscriptionnepal.shop";

export function getSiteUrl() {
  return SITE_URL;
}

export function getSiteUrlObject() {
  return new URL(getSiteUrl());
}

export function absoluteUrl(pathname = "/") {
  return new URL(pathname, SITE_URL).toString();
}
