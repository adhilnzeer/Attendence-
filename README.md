# Attendance Tracker

A simple, responsive web app for taking daily attendance. Built with plain HTML, CSS and JavaScript, with no frameworks and no build step.

## Features

- Add and remove students
- Mark Present, Absent or Late for any date (select a button again to clear it)
- "Mark all present" shortcut
- Live summary for the selected date and a present-today percentage
- Overall attendance rate for each student (present and late count as attended)
- Export all records as a CSV file
- Data saved in your browser with `localStorage`
- Responsive layout, keyboard accessible, light and dark mode

## Project structure

```
website/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── images/        (empty, reserved for future images)
    └── icons/
        └── favicon.svg
```

## Run locally

Open `index.html` in any modern browser. No server is needed.

## Host on GitHub Pages

1. Create a new repository on GitHub (for example `attendance-tracker`).
2. Upload `index.html`, `style.css`, `script.js`, `README.md` and the `assets` folder to the repository root. Keep the folder structure exactly as shown above.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
5. Choose the `main` branch and the `/ (root)` folder, then select **Save**.
6. Wait about a minute. Your site will be live at `https://<your-username>.github.io/<repository-name>/`.

## Notes

- Records are stored per browser and device. Clearing site data removes them, so export a CSV for backups.
- The Google Font (Bricolage Grotesque) loads online; the app falls back to system fonts if offline.
- `assets/images/` is empty because the app needs no photos. Git does not track empty folders, so you can skip creating it.
