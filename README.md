# GSY FitLog

A lightweight mobile-friendly health tracker web app built for daily fitness logging.

## Features

- One-time user name and height setup (used to calculate BMI)
- Daily weight tracking with automatic BMI-based colour coding:
  - Green when your weight falls in a healthy BMI range for your height
  - Red when overweight/obese
  - Blue when underweight
  - Applies to both the weight trend chart and the entries list, plus a live "Current BMI" stat
- Daily step count tracking (highlighted green at 10,000+ steps)
- Food intake tracking with checkboxes:
  - Normal Food
  - Sugar Intake
  - Tea
  - Non Veg
- Local browser storage (offline support)
- Data integrity by design:
  - Today's entry can be edited freely, any number of times, until the day ends
  - Once a date passes, that entry locks permanently — no editing or deleting
  - Missed a day? Add a text remark against that past date instead (no data, just a note)
- History screen with:
  - Weight trend line chart (Chart.js, bundled locally — works offline)
  - Quick stats (weight change, % days with sugar/tea/non-veg, % days hitting 10k steps)
  - Full list of past entries, showing locked/today/missed status
  - CSV export of all entries (including step counts and remarks)
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

## Building an Android APK

See [APK_BUILD.md](./APK_BUILD.md) for step-by-step instructions using PWABuilder — no local Android tooling required.

## Planned Features

(none currently — suggest more in the repo issues)

## License

MIT License