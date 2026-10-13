# Self-hosted campus fonts

Sources downloaded on 2026-10-13 from the official Google Fonts repository:

- [Noto Serif SC](https://github.com/google/fonts/tree/main/ofl/notoserifsc): title font, fixed weight 700, 1,069 characters in the site's existing interface / course titles. Output `campus-serif.woff2` is approximately 209 KiB. Family renamed `CampusSerif` in the derivative.
- [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope): variable weight 200–800, basic Latin for clocks and statistics. Output `campus-numbers.woff2` is approximately 16 KiB. Family renamed `CampusNumbers` in the derivative.

Both fonts use the SIL Open Font License; the original notices are preserved in `notoserifsc-OFL.txt` and `manrope-OFL.txt`. Files were subset with FontTools and locally encoded as WOFF2. FontTools was used for font data processing, not included in the browser application.

Functional body text and characters outside the title subset fall back to the system Chinese font. `font-display: swap` prevents blank text; no external font CDN requests are needed. Do not use the limited title font for long arbitrary user-generated paragraphs.
