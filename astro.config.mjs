// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/sports': '/campus-life/sports',
    '/events': '/campus-life/events',
    '/gallery': '/campus-life/gallery',
    '/newsletters': '/campus-life/newsletters',
    '/campus-drive': '/campus-life/campus-drive',
    '/isa-student-chapter': '/campus-life/isa-student-chapter',
    '/ishrae-student-chapter': '/campus-life/ishrae-student-chapter',
    '/clubs': '/campus-life/clubs',
    '/clubs/ncc': '/campus-life/clubs/ncc',
    '/clubs/nss': '/campus-life/clubs/nss',
    '/alumni': '/about/alumni',
    '/team': '/about/team',
    '/college/nirf': '/about/nirf',
    '/college/ariia': '/about/ariia',
    '/research': '/innovation/research',
    '/student': '/student-section',
  },
  vite: {
    plugins: [tailwindcss()]
  }
});