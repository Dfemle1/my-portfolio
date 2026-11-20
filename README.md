# Portfolio

Open the `portfolio` folder in VS Code and run it with the **Live Server** extension (right-click `index.html` → Open with Live Server).
Opening `index.html` directly in a browser also works.

```
index.html            all sections (hero, about, work, skills, contact)
css/style.css         colours/fonts at the top (:root), then each section
js/hero.js            cursor-tracking character (tuning values at the top)
js/main.js            nav, mobile menu, footer year
assets/sprite-sheet.jpg   all 240 video frames in one horizontal strip (224x398 each)
```

## Customise
- Replace "Your Name", the copy and the email in `index.html`.
- Project cards: swap each `.thumb` div for `<img src="assets/your-image.jpg" alt="…">` and give `.thumb` img `width:100%;height:100%;object-fit:cover;border-radius:18px`.
- Hero feel: `SMOOTH_ACTIVE`, `SMOOTH_IDLE`, `REACH` at the top of `js/hero.js`.
- Add a section: copy a `<section class="sec">` block and add a link in the nav.
