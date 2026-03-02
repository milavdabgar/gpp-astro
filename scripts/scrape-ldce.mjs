#!/usr/bin/env node
/**
 * LDCE Website Scraper
 * Crawls ldce.ac.in and saves all pages as HTML files for reference.
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://ldce.ac.in';
const OUTPUT_DIR = path.join(__dirname, '..', 'ldce-reference');

// Seed URLs from the known sitemap
const SEED_URLS = [
  '/',
  '/info/sitemap',
  '/about',
  '/about/Vision-Mission',
  '/about/history',
  '/about/nba-accreditation',
  '/about/principal',
  '/about/organization-chart',
  '/about/Institute-Committees',
  '/about/MandatoryDisclosure',
  '/about/allAchievements',
  '/about/newsletters',
  '/about/news',
  '/about/brochure',
  '/about/industry-sponsored-labs',
  '/about/CenterOfExcellence',
  '/departments',
  '/department/civil-engineering',
  '/department/civil-engineering/faculty',
  '/department/civil-engineering/labs',
  '/department/civil-engineering/gallery',
  '/department/civil-engineering/achievements',
  '/department/civil-engineering/events',
  '/department/electrical-engineering',
  '/department/electrical-engineering/faculty',
  '/department/electrical-engineering/labs',
  '/department/computer-engineering',
  '/department/computer-engineering/faculty',
  '/department/information-technology',
  '/department/Instrumentation-control-engineering',
  '/department/mechanical-engineering',
  '/department/mechanical-engineering/faculty',
  '/department/mechanical-engineering/labs',
  '/department/applied-mechanics',
  '/department/chemical-engineering',
  '/department/electronics-communication-engineering',
  '/department/Science-humanities',
  '/department/Science-humanities/faculty',
  '/department/biomedical-engineering',
  '/department/automobile-engineering',
  '/department/ai-ml',
  '/department/Robotics-Automation',
  '/admissions/ug-programs',
  '/admissions/pg-programs',
  '/admissions/fee-structure',
  '/admissions/scholarship',
  '/admissions/calendar',
  '/admissions/gtu-affiliation',
  '/admissions/aicte-eoa',
  '/admissions/accreditation-status',
  '/admissions/working-professional-programs',
  '/Infrastructure',
  '/Infrastructure/library',
  '/campus-life',
  '/campus-life/entrepreneurship-cell',
  '/campus-life/placement-cell',
  '/campus-life/placement-cell/statistics',
  '/Sports',
  '/clubs',
  '/clubs/ncc',
  '/clubs/nss',
  '/event',
  '/gallery',
  '/placement',
  '/campus-drive',
  '/facilities-placement-drive',
  '/student-section/various-forms',
  '/student-section/first-year',
  '/student-section/notice-board',
  '/Innovation',
  '/research',
  '/Innovation/research',
  '/Innovation/startups',
  '/Innovation/patents',
  '/Innovation/research-grants',
  '/Innovation/incubation',
  '/Innovation/designlab',
  '/Innovation/supercomputing',
  '/college/nirf',
  '/college/ariia',
  '/financial-info/tender-notice',
  '/legal/right-to-info-act',
  '/contact',
  '/team',
];

const visited = new Set();
const queue = [...SEED_URLS.map(u => BASE_URL + u)];
const errors = [];

/**
 * Convert a URL to a safe filesystem path
 */
function urlToFilePath(url) {
  const parsed = new URL(url);
  let p = parsed.pathname.replace(/\/$/, '') || '/index';
  // Sanitize
  p = p.replace(/[?#]/g, '_').replace(/[<>:"\\|*]/g, '_');
  if (!p.endsWith('.html')) p += '.html';
  return path.join(OUTPUT_DIR, p);
}

/**
 * Extract all internal links from HTML
 */
function extractLinks(html, baseUrl) {
  const links = new Set();
  const hrefRe = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    const href = m[1].trim();
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    try {
      const abs = new URL(href, baseUrl).href;
      const parsed = new URL(abs);
      if (parsed.hostname === 'ldce.ac.in' && !abs.includes('/storage/') && !abs.includes('/api.')) {
        // Strip query and hash for deduplication
        const clean = parsed.origin + parsed.pathname;
        links.add(clean);
      }
    } catch {}
  }
  return links;
}

/**
 * Fetch a single URL and save it
 */
async function fetchAndSave(url) {
  if (visited.has(url)) return;
  visited.add(url);

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GPP-Scraper/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.log(`  [${res.status}] ${url}`);
      errors.push({ url, status: res.status });
      return [];
    }

    const html = await res.text();
    const filePath = urlToFilePath(url);
    const dir = path.dirname(filePath);

    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    await writeFile(filePath, html, 'utf8');
    console.log(`  [OK] ${url.replace(BASE_URL, '')} → ${filePath.replace(OUTPUT_DIR, '')}`);

    // Extract and queue new links found on this page
    return [...extractLinks(html, url)];
  } catch (err) {
    console.log(`  [ERR] ${url}: ${err.message}`);
    errors.push({ url, error: err.message });
    return [];
  }
}

async function main() {
  console.log(`\n🔍 LDCE Scraper — output: ldce-reference/\n`);
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Process queue in batches of 4 concurrent requests
  const BATCH = 4;
  const DELAY_MS = 300; // be polite

  while (queue.length > 0) {
    const batch = queue.splice(0, BATCH).filter(u => !visited.has(u));
    if (batch.length === 0) continue;

    const results = await Promise.all(batch.map(u => fetchAndSave(u)));
    const newLinks = results.flat().filter(u => !visited.has(u) && !queue.includes(u));
    queue.push(...newLinks);

    if (queue.length > 0) await new Promise(r => setTimeout(r, DELAY_MS));
  }

  const totalSaved = visited.size - errors.length;
  console.log(`\n✅ Done. Saved: ${totalSaved} pages, Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  ${e.url} — ${e.status || e.error}`));
  }

  // Write a summary index
  const index = [...visited]
    .sort()
    .map(u => `- ${u.replace(BASE_URL, '')}`)
    .join('\n');
  await writeFile(path.join(OUTPUT_DIR, '_index.txt'), index, 'utf8');
  console.log(`\nPage list saved to ldce-reference/_index.txt`);
}

main().catch(console.error);
