#!/usr/bin/env node

const DEFAULT_BASE_URL = "https://www.ottsubscriptionnepal.shop";
const DEFAULT_CONCURRENCY = 6;
const DEFAULT_TIMEOUT_MS = 15_000;
const REQUIRED_HREFLANGS = ["en", "hi", "ne", "x-default"];
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_REFERRERS_DISPLAYED = 10;

async function main() {
  const options = parseArguments(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const baseUrl = parseOrigin(options.baseUrl, "base URL");
  const fetchOrigin = parseOrigin(options.fetchOrigin, "fetch origin");
  const sitemapUrl = resolveSitemapUrl(options.sitemap, baseUrl);
  const audit = createAuditContext({ ...options, baseUrl, fetchOrigin, sitemapUrl });

  await discoverSitemapUrls(audit, sitemapUrl);

  if (audit.sitemapEntries.length === 0) {
    audit.globalErrors.push("The sitemap did not contain any page URLs.");
    printReport(audit, []);
    process.exitCode = 1;
    return;
  }

  const uniqueEntries = deduplicateSitemapEntries(audit);
  const records = await mapWithConcurrency(
    uniqueEntries,
    options.concurrency,
    (entry) => inspectPage(audit, entry),
  );

  addInternalLinkResults(audit, records);
  addHreflangResults(audit, records);
  printReport(audit, records);

  if (audit.globalErrors.length > 0 || records.some((record) => record.issues.size > 0)) {
    process.exitCode = 1;
  }
}

function parseArguments(argv) {
  const options = {
    baseUrl: process.env.SEO_AUDIT_BASE_URL || DEFAULT_BASE_URL,
    fetchOrigin: process.env.SEO_AUDIT_FETCH_ORIGIN || null,
    sitemap: process.env.SEO_AUDIT_SITEMAP || "/sitemap.xml",
    concurrency: parsePositiveInteger(
      process.env.SEO_AUDIT_CONCURRENCY || String(DEFAULT_CONCURRENCY),
      "concurrency",
      1,
      32,
    ),
    timeoutMs: parsePositiveInteger(
      process.env.SEO_AUDIT_TIMEOUT_MS || String(DEFAULT_TIMEOUT_MS),
      "timeout",
      250,
      300_000,
    ),
    help: false,
  };

  let positionalBaseUrlSeen = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--") continue;

    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    if (argument === "--base-url" || argument === "-b") {
      options.baseUrl = takeArgumentValue(argv, ++index, argument);
      positionalBaseUrlSeen = true;
      continue;
    }

    if (argument.startsWith("--base-url=")) {
      options.baseUrl = argument.slice("--base-url=".length);
      positionalBaseUrlSeen = true;
      continue;
    }

    if (argument === "--fetch-origin") {
      options.fetchOrigin = takeArgumentValue(argv, ++index, argument);
      continue;
    }

    if (argument.startsWith("--fetch-origin=")) {
      options.fetchOrigin = argument.slice("--fetch-origin=".length);
      continue;
    }

    if (argument === "--sitemap") {
      options.sitemap = takeArgumentValue(argv, ++index, argument);
      continue;
    }

    if (argument.startsWith("--sitemap=")) {
      options.sitemap = argument.slice("--sitemap=".length);
      continue;
    }

    if (argument === "--concurrency") {
      options.concurrency = parsePositiveInteger(
        takeArgumentValue(argv, ++index, argument),
        "concurrency",
        1,
        32,
      );
      continue;
    }

    if (argument.startsWith("--concurrency=")) {
      options.concurrency = parsePositiveInteger(
        argument.slice("--concurrency=".length),
        "concurrency",
        1,
        32,
      );
      continue;
    }

    if (argument === "--timeout") {
      options.timeoutMs = parsePositiveInteger(
        takeArgumentValue(argv, ++index, argument),
        "timeout",
        250,
        300_000,
      );
      continue;
    }

    if (argument.startsWith("--timeout=")) {
      options.timeoutMs = parsePositiveInteger(
        argument.slice("--timeout=".length),
        "timeout",
        250,
        300_000,
      );
      continue;
    }

    if (!argument.startsWith("-") && !positionalBaseUrlSeen) {
      options.baseUrl = argument;
      positionalBaseUrlSeen = true;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}. Run with --help for usage.`);
  }

  options.fetchOrigin ||= options.baseUrl;
  return options;
}

function printHelp() {
  console.log(`SEO sitemap and indexability audit

Usage:
  node scripts/seo-audit.mjs [base-url] [options]
  pnpm seo:audit -- [options]

Options:
  -b, --base-url <url>       Canonical origin expected in sitemap and metadata
                             (default: ${DEFAULT_BASE_URL})
      --fetch-origin <url>   Origin to request while preserving canonical paths
                             (useful for auditing localhost; default: base URL)
      --sitemap <url|path>   Sitemap URL or path (default: /sitemap.xml)
      --concurrency <number> Simultaneous page requests, 1-32 (default: ${DEFAULT_CONCURRENCY})
      --timeout <ms>         Per-request timeout (default: ${DEFAULT_TIMEOUT_MS})
  -h, --help                 Show this help

Environment equivalents:
  SEO_AUDIT_BASE_URL, SEO_AUDIT_FETCH_ORIGIN, SEO_AUDIT_SITEMAP,
  SEO_AUDIT_CONCURRENCY, SEO_AUDIT_TIMEOUT_MS

Examples:
  pnpm seo:audit
  pnpm seo:audit -- --base-url https://example.com
  pnpm seo:audit -- --fetch-origin http://localhost:3000

The command exits with status 1 when the sitemap cannot be read or any sitemap
page fails an indexability, metadata, hreflang, language, or internal-link check.`);
}

function createAuditContext(options) {
  return {
    options,
    sitemapEntries: [],
    sitemapFiles: [],
    visitedSitemaps: new Set(),
    globalErrors: [],
  };
}

async function discoverSitemapUrls(audit, sitemapUrl, depth = 0) {
  if (depth > 10) {
    audit.globalErrors.push(`Sitemap nesting exceeds 10 levels at ${sitemapUrl.href}.`);
    return;
  }

  const sitemapKey = normalizeUrlForComparison(sitemapUrl);
  if (audit.visitedSitemaps.has(sitemapKey)) return;
  audit.visitedSitemaps.add(sitemapKey);

  const requestUrl = toFetchUrl(sitemapUrl, audit.options.baseUrl, audit.options.fetchOrigin);
  let response;

  try {
    response = await fetchWithTimeout(requestUrl, audit.options.timeoutMs, {
      accept: "application/xml,text/xml,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
    });
  } catch (error) {
    audit.globalErrors.push(`Could not fetch sitemap ${sitemapUrl.href}: ${formatError(error)}.`);
    return;
  }

  if (REDIRECT_STATUSES.has(response.status)) {
    const redirect = resolveRedirect(response.headers.get("location"), sitemapUrl, audit);
    audit.globalErrors.push(
      `Sitemap ${sitemapUrl.href} redirects with HTTP ${response.status}${redirect ? ` to ${redirect}` : ""}.`,
    );
    return;
  }

  if (response.status !== 200) {
    audit.globalErrors.push(`Sitemap ${sitemapUrl.href} returned HTTP ${response.status}.`);
    return;
  }

  let body;
  try {
    body = await response.text();
  } catch (error) {
    audit.globalErrors.push(`Could not read sitemap ${sitemapUrl.href}: ${formatError(error)}.`);
    return;
  }

  const parsed = parseSitemapXml(body);
  if (parsed.error) {
    audit.globalErrors.push(`Invalid sitemap ${sitemapUrl.href}: ${parsed.error}.`);
    return;
  }

  audit.sitemapFiles.push({ url: sitemapUrl.href, type: parsed.type, count: parsed.locations.length });

  if (parsed.type === "index") {
    for (const location of parsed.locations) {
      const nestedUrl = resolveHttpUrl(location, sitemapUrl);
      if (!nestedUrl) {
        audit.globalErrors.push(`Invalid nested sitemap URL in ${sitemapUrl.href}: ${location}.`);
        continue;
      }
      await discoverSitemapUrls(audit, nestedUrl, depth + 1);
    }
    return;
  }

  for (const location of parsed.locations) {
    const pageUrl = resolveHttpUrl(location, sitemapUrl);
    if (!pageUrl) {
      audit.globalErrors.push(`Invalid page URL in ${sitemapUrl.href}: ${location}.`);
      continue;
    }
    audit.sitemapEntries.push({
      url: pageUrl,
      sitemapUrl: sitemapUrl.href,
      absoluteLocation: isAbsoluteHttpUrl(location),
    });
  }
}

function parseSitemapXml(xml) {
  const source = String(xml).replace(/^\uFEFF/, "").trim();
  if (!source) return { error: "empty response" };

  if (/<(?:[\w.-]+:)?sitemapindex\b/i.test(source)) {
    const blocks = extractXmlBlocks(source, "sitemap");
    const locations = blocks.map(extractXmlLocation).filter(Boolean);
    if (blocks.length === 0 || locations.length !== blocks.length) {
      return { error: "sitemap index contains a sitemap without a valid <loc>" };
    }
    return { type: "index", locations };
  }

  if (/<(?:[\w.-]+:)?urlset\b/i.test(source)) {
    const blocks = extractXmlBlocks(source, "url");
    const locations = blocks.map(extractXmlLocation).filter(Boolean);
    if (blocks.length > 0 && locations.length !== blocks.length) {
      return { error: "URL set contains a URL without a valid <loc>" };
    }
    return { type: "urlset", locations };
  }

  return { error: "response is neither a sitemap index nor a URL set" };
}

function extractXmlBlocks(xml, elementName) {
  const expression = new RegExp(
    `<(?:[\\w.-]+:)?${elementName}\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${elementName}\\s*>`,
    "gi",
  );
  return Array.from(xml.matchAll(expression), (match) => match[1]);
}

function extractXmlLocation(block) {
  const match = block.match(/<(?:[\w.-]+:)?loc\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?loc\s*>/i);
  if (!match) return null;
  return decodeEntities(match[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim());
}

function deduplicateSitemapEntries(audit) {
  const entriesByUrl = new Map();

  for (const entry of audit.sitemapEntries) {
    const key = normalizeUrlForComparison(entry.url);
    const existing = entriesByUrl.get(key);
    if (existing) {
      existing.sitemapSources.add(entry.sitemapUrl);
      existing.duplicateCount += 1;
      continue;
    }
    entriesByUrl.set(key, {
      url: entry.url,
      sitemapSources: new Set([entry.sitemapUrl]),
      absoluteLocation: entry.absoluteLocation,
      duplicateCount: 1,
    });
  }

  for (const entry of entriesByUrl.values()) {
    if (entry.duplicateCount > 1) {
      audit.globalErrors.push(
        `Duplicate sitemap URL (${entry.duplicateCount} entries): ${entry.url.href}.`,
      );
    }
  }

  return [...entriesByUrl.values()];
}

async function inspectPage(audit, entry) {
  const reportUrl = entry.url;
  const requestUrl = toFetchUrl(reportUrl, audit.options.baseUrl, audit.options.fetchOrigin);
  const route = getLocalizedRoute(reportUrl);
  const record = {
    url: reportUrl,
    requestUrl,
    key: normalizeUrlForComparison(reportUrl),
    sitemapSources: entry.sitemapSources,
    sitemapIncluded: true,
    status: null,
    redirect: null,
    contentType: "",
    canonical: null,
    canonicalValid: false,
    robots: "",
    robotsAllowed: false,
    title: "",
    description: "",
    hreflangs: new Map(),
    hreflangValid: false,
    anchors: [],
    referringPages: [],
    lang: "",
    expectedLang: route.locale,
    langValid: false,
    issues: new Set(),
  };

  if (reportUrl.origin !== audit.options.baseUrl.origin) {
    record.issues.add(
      `Sitemap URL uses ${reportUrl.origin}; expected canonical origin ${audit.options.baseUrl.origin}`,
    );
  }
  if (!entry.absoluteLocation) record.issues.add("Sitemap <loc> is not an absolute HTTP(S) URL");
  if (reportUrl.username || reportUrl.password) record.issues.add("Sitemap URL contains credentials");
  if (reportUrl.search) record.issues.add("Sitemap URL is parameterized");
  if (reportUrl.hash) record.issues.add("Sitemap URL contains a fragment");

  let response;
  try {
    response = await fetchWithTimeout(requestUrl, audit.options.timeoutMs, {
      accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
    });
  } catch (error) {
    record.issues.add(`Request failed: ${formatError(error)}`);
    return record;
  }

  record.status = response.status;
  record.contentType = response.headers.get("content-type") || "";

  if (REDIRECT_STATUSES.has(response.status)) {
    record.redirect = resolveRedirect(response.headers.get("location"), reportUrl, audit);
    record.issues.add(`Redirects with HTTP ${response.status}${record.redirect ? ` to ${record.redirect}` : ""}`);
    return record;
  }

  if (response.status !== 200) {
    record.issues.add(`Returned HTTP ${response.status}`);
    return record;
  }

  let html;
  try {
    html = await response.text();
  } catch (error) {
    record.issues.add(`Could not read response body: ${formatError(error)}`);
    return record;
  }

  const document = inspectHtml(html, reportUrl, response.headers.get("x-robots-tag"));
  record.canonical = document.canonical;
  record.robots = document.robots;
  record.title = document.title;
  record.description = document.description;
  record.hreflangs = document.hreflangs;
  record.anchors = document.anchors;
  record.lang = document.lang;

  if (!document.looksLikeHtml) record.issues.add("Response does not contain an HTML document");
  if (!/(?:^|[;,\s])(?:text\/html|application\/xhtml\+xml)(?:[;,\s]|$)/i.test(record.contentType)) {
    record.issues.add(`Unexpected HTML Content-Type: ${record.contentType || "missing"}`);
  }
  if (document.visibleTextLength < 30) record.issues.add("Page appears blank or contains almost no visible text");
  if (document.possibleSoft404) record.issues.add("Page appears to be a soft 404");

  if (document.canonicalCount === 0) {
    record.issues.add("Missing canonical link");
  } else if (document.canonicalCount > 1) {
    record.issues.add(`Found ${document.canonicalCount} canonical links`);
  } else if (!document.canonicalUrl) {
    record.issues.add("Canonical URL is invalid");
  } else {
    const canonicalMatches = normalizeUrlForComparison(document.canonicalUrl) === record.key;
    const canonicalUsesBase = document.canonicalUrl.origin === audit.options.baseUrl.origin;
    const canonicalIsAbsolute = isAbsoluteHttpUrl(document.canonical);
    const canonicalHasNoFragment = !document.canonicalUrl.hash;
    record.canonicalValid = canonicalMatches && canonicalUsesBase && canonicalIsAbsolute && canonicalHasNoFragment;
    if (!canonicalMatches) record.issues.add("Canonical is not self-referencing");
    if (!canonicalUsesBase) {
      record.issues.add(`Canonical uses ${document.canonicalUrl.origin}; expected ${audit.options.baseUrl.origin}`);
    }
    if (!canonicalIsAbsolute) record.issues.add("Canonical must be an absolute HTTP(S) URL");
    if (!canonicalHasNoFragment) record.issues.add("Canonical URL contains a fragment");
  }

  if (!document.title) record.issues.add("Missing or empty title");
  if (document.titleCount > 1) record.issues.add(`Found ${document.titleCount} title elements`);
  if (!document.description) record.issues.add("Missing or empty meta description");
  if (document.descriptionCount > 1) {
    record.issues.add(`Found ${document.descriptionCount} meta descriptions`);
  }

  record.robotsAllowed = !document.robotsBlocked;
  if (document.robotsBlocked) record.issues.add(`Indexing is blocked by robots directives: ${document.robots}`);

  record.langValid = document.lang.toLowerCase() === route.locale;
  if (!document.lang) {
    record.issues.add("Missing html lang attribute");
  } else if (!record.langValid) {
    record.issues.add(`HTML lang is "${document.lang}"; expected "${route.locale}"`);
  }

  return record;
}

function inspectHtml(html, pageUrl, xRobotsHeader) {
  const htmlTags = findStartTags(html, "html");
  const titleMatches = Array.from(html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi));
  const linkTags = findStartTags(html, "link").map(parseAttributes);
  const metaTags = findStartTags(html, "meta").map(parseAttributes);
  const anchorTags = findStartTags(html, "a").map(parseAttributes);
  const canonicalLinks = linkTags.filter((attributes) => relContains(attributes.rel, "canonical"));
  const canonicalValue = canonicalLinks[0]?.href ? decodeEntities(canonicalLinks[0].href).trim() : "";
  const canonicalUrl = canonicalValue ? resolveHttpUrl(canonicalValue, pageUrl) : null;
  const descriptions = metaTags.filter(
    (attributes) => (attributes.name || "").toLowerCase() === "description",
  );
  const description = descriptions[0]?.content
    ? normalizeText(decodeEntities(descriptions[0].content))
    : "";
  const hreflangs = new Map();

  for (const attributes of linkTags) {
    if (!relContains(attributes.rel, "alternate") || !attributes.hreflang || !attributes.href) continue;
    const language = decodeEntities(attributes.hreflang).trim().toLowerCase();
    const href = decodeEntities(attributes.href).trim();
    const resolved = resolveHttpUrl(href, pageUrl);
    const values = hreflangs.get(language) || [];
    values.push({ raw: href, url: resolved });
    hreflangs.set(language, values);
  }

  const anchors = [];
  for (const attributes of anchorTags) {
    if (!attributes.href) continue;
    const href = decodeEntities(attributes.href).trim();
    if (!href || href.startsWith("#") || /^(?:mailto|tel|javascript|data):/i.test(href)) continue;
    const resolved = resolveHttpUrl(href, pageUrl);
    if (resolved) anchors.push(resolved);
  }

  const robotsValues = [];
  for (const attributes of metaTags) {
    const name = (attributes.name || "").trim().toLowerCase();
    const httpEquiv = (attributes["http-equiv"] || "").trim().toLowerCase();
    if ((name === "robots" || name === "googlebot" || httpEquiv === "x-robots-tag") && attributes.content) {
      robotsValues.push(`${name || httpEquiv}: ${normalizeText(decodeEntities(attributes.content))}`);
    }
  }
  if (xRobotsHeader) robotsValues.push(`x-robots-tag: ${normalizeText(xRobotsHeader)}`);
  const robots = robotsValues.length > 0 ? robotsValues.join(" | ") : "index, follow (default)";
  const robotsBlocked = robotsValues.some((value) => /(?:^|[\s,:;])(?:noindex|nofollow|none)(?:$|[\s,:;])/i.test(value));

  const title = titleMatches[0] ? normalizeText(decodeEntities(stripTags(titleMatches[0][1]))) : "";
  const lang = htmlTags[0] ? normalizeText(decodeEntities(parseAttributes(htmlTags[0]).lang || "")) : "";
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i);
  const visibleText = normalizeText(
    decodeEntities(
      stripTags(
        (bodyMatch?.[1] || html)
          .replace(/<(?:script|style|noscript|template|svg)\b[^>]*>[\s\S]*?<\/(?:script|style|noscript|template|svg)\s*>/gi, " ")
          .replace(/<!--[\s\S]*?-->/g, " "),
      ),
    ),
  );
  const possibleSoft404 = /(?:^|\b)(?:404|page not found|not found)(?:\b|$)/i.test(
    `${title} ${visibleText.slice(0, 500)}`,
  );

  return {
    looksLikeHtml: htmlTags.length > 0 || /<!doctype\s+html/i.test(html),
    visibleTextLength: visibleText.length,
    possibleSoft404,
    canonical: canonicalValue || "",
    canonicalUrl,
    canonicalCount: canonicalLinks.length,
    robots,
    robotsBlocked,
    title,
    titleCount: titleMatches.length,
    description,
    descriptionCount: descriptions.length,
    hreflangs,
    anchors,
    lang,
  };
}

function addInternalLinkResults(audit, records) {
  const sourcesByTarget = new Map();
  const sitemapKeys = new Set(records.map((record) => record.key));

  for (const source of records) {
    const uniqueTargets = new Set();
    for (const anchor of source.anchors) {
      if (anchor.origin !== audit.options.baseUrl.origin) continue;
      const targetKey = normalizeUrlForComparison(anchor);
      if (!sitemapKeys.has(targetKey) || targetKey === source.key || uniqueTargets.has(targetKey)) continue;
      uniqueTargets.add(targetKey);
      const sources = sourcesByTarget.get(targetKey) || new Set();
      sources.add(source.url.href);
      sourcesByTarget.set(targetKey, sources);
    }
  }

  for (const record of records) {
    record.referringPages = [...(sourcesByTarget.get(record.key) || [])].sort();
    if (record.referringPages.length === 0) {
      record.issues.add("No internal referring link was found from another sitemap page");
    }
  }
}

function addHreflangResults(audit, records) {
  const recordsByKey = new Map(records.map((record) => [record.key, record]));

  for (const record of records) {
    if (record.status !== 200) continue;
    const expected = expectedHreflangs(record.url, audit.options.baseUrl);
    let valid = true;

    for (const language of REQUIRED_HREFLANGS) {
      const values = record.hreflangs.get(language) || [];
      if (values.length === 0) {
        record.issues.add(`Missing hreflang ${language}`);
        valid = false;
        continue;
      }
      if (values.length > 1) {
        record.issues.add(`Found ${values.length} hreflang ${language} links`);
        valid = false;
        continue;
      }

      const alternate = values[0].url;
      if (!alternate) {
        record.issues.add(`hreflang ${language} has an invalid URL`);
        valid = false;
        continue;
      }

      if (!isAbsoluteHttpUrl(values[0].raw)) {
        record.issues.add(`hreflang ${language} must use an absolute HTTP(S) URL`);
        valid = false;
      }
      if (alternate.hash) {
        record.issues.add(`hreflang ${language} URL contains a fragment`);
        valid = false;
      }

      const expectedKey = normalizeUrlForComparison(expected.get(language));
      const alternateKey = normalizeUrlForComparison(alternate);
      if (alternateKey !== expectedKey) {
        record.issues.add(`hreflang ${language} does not point to ${expected.get(language).href}`);
        valid = false;
      }
      if (alternate.origin !== audit.options.baseUrl.origin) {
        record.issues.add(`hreflang ${language} uses a non-canonical origin`);
        valid = false;
      }

      const target = recordsByKey.get(alternateKey);
      if (!target) {
        record.issues.add(`hreflang ${language} target is missing from the sitemap`);
        valid = false;
      } else if (target.status !== 200) {
        record.issues.add(`hreflang ${language} target does not return HTTP 200`);
        valid = false;
      } else {
        const reciprocalLanguage = record.expectedLang;
        const reciprocalValues = target.hreflangs.get(reciprocalLanguage) || [];
        const reciprocal = reciprocalValues.some(
          (value) => value.url && normalizeUrlForComparison(value.url) === record.key,
        );
        if (!reciprocal) {
          record.issues.add(`hreflang ${language} target does not link back with ${reciprocalLanguage}`);
          valid = false;
        }
      }
    }

    for (const language of record.hreflangs.keys()) {
      if (!REQUIRED_HREFLANGS.includes(language)) {
        record.issues.add(`Unexpected hreflang language: ${language}`);
        valid = false;
      }
    }

    record.hreflangValid = valid;
  }
}

function expectedHreflangs(pageUrl, baseUrl) {
  const { path } = getLocalizedRoute(pageUrl);
  const englishPath = path;
  const hindiPath = path === "/" ? "/hi" : `/hi${path}`;
  const nepaliPath = path === "/" ? "/ne" : `/ne${path}`;
  return new Map([
    ["en", new URL(englishPath, baseUrl)],
    ["hi", new URL(hindiPath, baseUrl)],
    ["ne", new URL(nepaliPath, baseUrl)],
    ["x-default", new URL(englishPath, baseUrl)],
  ]);
}

function getLocalizedRoute(url) {
  const match = url.pathname.match(/^\/(hi|ne)(?=\/|$)/i);
  if (!match) return { locale: "en", path: url.pathname || "/" };
  const path = url.pathname.slice(match[0].length) || "/";
  return { locale: match[1].toLowerCase(), path: path.startsWith("/") ? path : `/${path}` };
}

function printReport(audit, records) {
  const failedRecords = records.filter((record) => record.issues.size > 0);
  const passedRecords = records.length - failedRecords.length;

  console.log("\nSEO AUDIT");
  console.log(`Canonical base: ${audit.options.baseUrl.origin}`);
  console.log(`Fetch origin:   ${audit.options.fetchOrigin.origin}`);
  console.log(`Sitemap:       ${audit.options.sitemapUrl.href}`);
  console.log(`Sitemap files: ${audit.sitemapFiles.length}`);
  console.log(`Unique URLs:   ${records.length}`);
  console.log(`Result:        ${failedRecords.length === 0 && audit.globalErrors.length === 0 ? "PASS" : "FAIL"}`);

  if (audit.sitemapFiles.length > 0) {
    console.log("\nSITEMAPS");
    for (const sitemap of audit.sitemapFiles) {
      console.log(`- ${sitemap.url} (${sitemap.type}, ${sitemap.count} entries)`);
    }
  }

  console.log("\nSUMMARY");
  printSummaryTable(records);

  console.log("\nPAGE DETAILS");
  if (records.length === 0) console.log("(no pages inspected)");
  records.forEach((record, index) => printPageDetails(record, index));

  if (audit.globalErrors.length > 0) {
    console.log("\nSITEMAP / AUDIT ERRORS");
    audit.globalErrors.forEach((error) => console.log(`- ${error}`));
  }

  const issueCount = records.reduce((total, record) => total + record.issues.size, 0);
  console.log("\nFINAL SUMMARY");
  console.log(`Passed pages: ${passedRecords}`);
  console.log(`Failed pages: ${failedRecords.length}`);
  console.log(`Page issues:  ${issueCount}`);
  console.log(`Audit errors: ${audit.globalErrors.length}`);
}

function printSummaryTable(records) {
  const columns = [
    { name: "Result", width: 6, value: (record) => (record.issues.size === 0 ? "PASS" : "FAIL") },
    { name: "HTTP", width: 5, value: (record) => record.status ?? "ERR" },
    { name: "Lang", width: 7, value: (record) => `${record.lang || "-"}/${record.expectedLang}` },
    { name: "Canon", width: 5, value: (record) => yesNo(record.canonicalValid) },
    { name: "Robot", width: 5, value: (record) => yesNo(record.robotsAllowed) },
    { name: "Href", width: 5, value: (record) => yesNo(record.hreflangValid) },
    { name: "Map", width: 3, value: (record) => yesNo(record.sitemapIncluded) },
    { name: "Inlinks", width: 7, value: (record) => record.referringPages.length },
  ];
  const header = columns.map((column) => padCell(column.name, column.width)).join(" | ");
  console.log(`${header} | URL`);
  console.log(`${columns.map((column) => "-".repeat(column.width)).join("-+-")}-+-${"-".repeat(30)}`);
  for (const record of records) {
    const cells = columns.map((column) => padCell(column.value(record), column.width)).join(" | ");
    console.log(`${cells} | ${record.url.href}`);
  }
}

function printPageDetails(record, index) {
  console.log(`\n${index + 1}. [${record.issues.size === 0 ? "PASS" : "FAIL"}] ${record.url.href}`);
  if (record.requestUrl.href !== record.url.href) console.log(`   Fetched from: ${record.requestUrl.href}`);
  console.log(`   Status: ${record.status ?? "request error"}`);
  console.log(`   Redirect: ${record.redirect || "none"}`);
  console.log(`   Content-Type: ${record.contentType || "not available"}`);
  console.log(`   Canonical: ${record.canonical || "missing"}`);
  console.log(`   Robots: ${record.robots || "not available"}`);
  console.log(`   Title: ${record.title || "missing"}`);
  console.log(`   Description: ${record.description || "missing"}`);
  console.log(`   Hreflang valid: ${yesNo(record.hreflangValid)}`);
  if (record.hreflangs.size === 0) {
    console.log("   Hreflang values: none");
  } else {
    console.log("   Hreflang values:");
    for (const [language, values] of [...record.hreflangs.entries()].sort()) {
      console.log(`     ${language}: ${values.map((value) => value.url?.href || value.raw).join(" | ")}`);
    }
  }
  console.log(`   Sitemap inclusion: ${yesNo(record.sitemapIncluded)}`);
  console.log(`   Sitemap source: ${[...record.sitemapSources].join(" | ")}`);
  console.log(
    `   Internal referring links: ${record.referringPages.length > 0 ? `yes (${record.referringPages.length})` : "no"}`,
  );
  if (record.referringPages.length > 0) {
    for (const source of record.referringPages.slice(0, MAX_REFERRERS_DISPLAYED)) {
      console.log(`     <- ${source}`);
    }
    if (record.referringPages.length > MAX_REFERRERS_DISPLAYED) {
      console.log(`     ... and ${record.referringPages.length - MAX_REFERRERS_DISPLAYED} more`);
    }
  }
  console.log(`   HTML lang: ${record.lang || "missing"} (expected ${record.expectedLang})`);
  if (record.issues.size > 0) {
    console.log("   Issues:");
    for (const issue of record.issues) console.log(`     - ${issue}`);
  }
}

async function fetchWithTimeout(url, timeoutMs, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`timed out after ${timeoutMs} ms`)), timeoutMs);
  try {
    return await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: {
        ...headers,
        "user-agent": "OttSubscriptionNepal-SEO-Audit/1.0",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

function findStartTags(html, tagName) {
  const expression = new RegExp(
    `<${tagName}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`,
    "gi",
  );
  return Array.from(String(html).matchAll(expression), (match) => match[0]);
}

function parseAttributes(tag) {
  const attributes = {};
  const body = tag.replace(/^<\/?[^\s>]+/, "").replace(/\/?\s*>$/, "");
  const expression = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of body.matchAll(expression)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attributes;
}

function relContains(rel, expected) {
  return String(rel || "")
    .toLowerCase()
    .split(/\s+/)
    .includes(expected);
}

function stripTags(value) {
  return String(value).replace(/<[^>]*>/g, " ");
}

function normalizeText(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function decodeEntities(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return String(value).replace(/&(#x[\da-f]+|#\d+|[a-z][\w-]*);/gi, (entity, code) => {
    if (code[0] === "#") {
      const radix = code[1]?.toLowerCase() === "x" ? 16 : 10;
      const digits = radix === 16 ? code.slice(2) : code.slice(1);
      const point = Number.parseInt(digits, radix);
      if (Number.isInteger(point) && point >= 0 && point <= 0x10ffff) {
        try {
          return String.fromCodePoint(point);
        } catch {
          return entity;
        }
      }
      return entity;
    }
    return named[code.toLowerCase()] ?? entity;
  });
}

function resolveSitemapUrl(value, baseUrl) {
  const sitemapUrl = resolveHttpUrl(value, baseUrl);
  if (!sitemapUrl) throw new Error(`Invalid sitemap URL or path: ${value}`);
  return sitemapUrl;
}

function resolveHttpUrl(value, baseUrl) {
  try {
    const url = new URL(String(value).trim(), baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

function isAbsoluteHttpUrl(value) {
  try {
    const url = new URL(String(value).trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseOrigin(value, label) {
  const parsed = resolveHttpUrl(value);
  if (!parsed) throw new Error(`Invalid ${label}: ${value}`);
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error(`${label} must be an HTTP(S) origin without credentials, query, or fragment: ${value}`);
  }
  if (parsed.pathname !== "/") {
    throw new Error(`${label} must not include a path: ${value}`);
  }
  return parsed;
}

function toFetchUrl(url, baseUrl, fetchOrigin) {
  if (url.origin !== baseUrl.origin) return new URL(url.href);
  const requestUrl = new URL(fetchOrigin.href);
  requestUrl.pathname = url.pathname;
  requestUrl.search = url.search;
  requestUrl.hash = "";
  return requestUrl;
}

function resolveRedirect(location, reportUrl, audit) {
  if (!location) return null;
  const resolved = resolveHttpUrl(location, reportUrl);
  if (!resolved) return location;
  if (resolved.origin === audit.options.fetchOrigin.origin && audit.options.fetchOrigin.origin !== audit.options.baseUrl.origin) {
    const publicUrl = new URL(audit.options.baseUrl.href);
    publicUrl.pathname = resolved.pathname;
    publicUrl.search = resolved.search;
    publicUrl.hash = resolved.hash;
    return publicUrl.href;
  }
  return resolved.href;
}

function normalizeUrlForComparison(value) {
  const url = value instanceof URL ? new URL(value.href) : new URL(value);
  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  if ((url.protocol === "https:" && url.port === "443") || (url.protocol === "http:" && url.port === "80")) {
    url.port = "";
  }
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.href;
}

function takeArgumentValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value.`);
  return value;
}

function parsePositiveInteger(value, label, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${label} must be an integer from ${minimum} to ${maximum}; received ${value}.`);
  }
  return parsed;
}

function padCell(value, width) {
  const text = String(value);
  return text.length > width ? `${text.slice(0, Math.max(0, width - 1))}…` : text.padEnd(width);
}

function yesNo(value) {
  return value ? "yes" : "no";
}

function formatError(error) {
  if (error instanceof Error) {
    if (error.name === "AbortError") return error.message || "request timed out";
    return error.message;
  }
  return String(error);
}

main().catch((error) => {
  console.error(`SEO audit failed: ${formatError(error)}`);
  process.exitCode = 1;
});
