# Kumo Anime

Kumo is a modern, premium anime streaming application built with Next.js 14, designed to provide an ad-free and immersive viewing experience.

![Kumo Anime Preview](public/hero-preview.png)

## ✨ Features

- **Modern & Premium UI**: A sleek, dark-themed interface built with Tailwind CSS, featuring glassmorphism effects and smooth animations.
- **High-Quality Streaming**: Watch anime in HD with adaptive streaming support.
- **Sub & Dub Support**: Seamlessly switch between Subbed and Dubbed audio tracks with distinct server lists for each.
- **Comprehensive Library**:
  - **Home**: Trending, Popular, and Latest Airing anime.
  - **Genre Browser**: Filter anime by genres with pagination.
  - **A-Z List**: Browse anime alphabetically.
  - **Weekly Schedule**: Stay updated with the latest episode releases in your local time.
- **Advanced Player**: Custom video player with support for:
  - Auto-play next episode.
  - Server selection (HD-1, HD-2, etc.).
  - Skip Intro/Outro (if supported by source).
- **Rich Metadata**: Detailed anime info including ratings, studios, duration, and recommendations.
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.
- **Proxy API**: Built-in API proxy to handle CORS and stream transformations securely.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State/Data**: Server Components & Server Actions for efficient data fetching.
- **Video**: HTML5 Video with custom HLS handling logic.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/kumo.git
   cd kumo
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```bash
├── app/                  # Next.js App Router pages and layouts
│   ├── az-list/         # A-Z List page
│   ├── genre/           # Genre filter pages
│   ├── watch/           # Video player page
│   └── ...
├── components/           # React components
│   ├── features/        # Feature-specific components (VideoPlayer, HeroSection, etc.)
│   ├── layout/          # Layout components (Navbar, Footer)
│   └── ui/              # Reusable UI atoms (Buttons, Badges)
├── lib/                  # Utilities and API services
│   ├── api/             # API client and type definitions
│   └── utils.ts         # Helper functions
└── public/               # Static assets
```

## 📝 License

This project is for educational purposes only. Kumo does not host any content. All content is provided by non-affiliated third parties.
