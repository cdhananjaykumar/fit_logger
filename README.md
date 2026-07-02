# GSY FitLog

A lightweight mobile-friendly health tracker web app built for daily fitness logging.

## Features

- One-time user name setup
- Daily weight tracking
- Food intake tracking with checkboxes:
  - Normal Food
  - Sugar Intake
  - Tea
  - Non Veg
- Local browser storage (offline support)
- One entry per day (auto overwrite for same date)
- History screen with:
  - Weight trend line chart (Chart.js, bundled locally — works offline)
  - Quick stats (weight change, % days with sugar/tea/non-veg)
  - Full list of past entries with edit and delete
  - CSV export of all entries
- Mobile responsive design
- Full Progressive Web App support:
  - Installable with app icons
  - Service worker caches the app shell for offline use

## Tech Stack

- HTML5
- CSS3
- JavaScript
- LocalStorage API

## Project Structure

```text
GSY_FitLog/
│
├── index.html
├── style.css
├── app.js
├── sw.js
├── manifest.json
├── chart.umd.min.js
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── README.md
├── LICENSE
```

## How to Run Locally

1. Clone repository

```bash
git clone https://github.com/YOUR_USERNAME/GSY_FitLog.git
```

2. Open folder in Visual Studio Code

3. Run with Live Server extension

## Planned Features

- APK build for Android

## License

MIT License