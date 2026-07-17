/**
 * @fileoverview Tailwind CSS CDN runtime configuration for ArenaOne.
 *
 * When using the Tailwind CDN build (cdn.tailwindcss.com), theme customisation
 * is applied by assigning to the global `tailwind.config` object AFTER the CDN
 * script loads — this is the officially documented CDN approach and does NOT
 * require a build step. This file is loaded via a plain <script> tag, NOT as
 * an ES module, so it intentionally uses a global assignment rather than an
 * export. See: https://tailwindcss.com/docs/installation/play-cdn
 */
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif']
      }
    }
  }
};
