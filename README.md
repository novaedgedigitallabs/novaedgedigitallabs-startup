<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=250&section=header&text=NovaEdge%20Startup%20Network&fontSize=50&animation=fadeIn&fontAlignY=38&desc=CLI%20%26%20Web%20Platform%20for%20Publishing%20Startups&descAlignY=51&descAlign=62" alt="Header" />
</div>

<h1 align="center">NovaEdge Startup Network</h1>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#quick-start"><strong>Quick Start</strong></a> ·
  <a href="#architecture"><strong>Architecture</strong></a> ·
  <a href="#cli-usage"><strong>CLI Usage</strong></a>
</p>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=22&pause=1000&color=3B82F6&center=true&vCenter=true&width=600&lines=Publish+your+startup+from+the+CLI;Seamless+GitHub+Integration;Real-time+Web+Feed+and+Analytics;Community+Engagement+%26+Discussions" alt="Typing SVG" />
</div>

---

## Features

- **CLI First**: Initialize and publish your startup directly from your terminal.
- **Secure OAuth**: Seamless GitHub login and authentication.
- **Real-time Feed**: Explore the latest startups instantly on the web interface.
- **Analytics & Engagement**: View counts, likes, bookmarks, and comments.
- **Lightning Fast Search**: Powered by Meilisearch for instant discovery.

<div align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</div>

## Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Meilisearch-FF5CAA?style=for-the-badge&logo=meilisearch&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</div>

<div align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</div>

## Quick Start

### 1. Install the CLI

```bash
npm install -g novaedge-startup-cli
```

### 2. Login with GitHub

```bash
startup login
```

### 3. Initialize & Push Your Startup

```bash
# Create startup.yml in your project
startup init --auto

# Push to the network
startup push
```

<div align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</div>

## Architecture Overview

Our platform consists of three main components working in harmony:

1.  **CLI Tool**: Handles local configuration, metadata parsing (`startup.yml`), and secure communication with GitHub and our backend.
2.  **Node.js Backend**: Processes incoming webhooks, manages database interactions (Supabase), and keeps the search index (Meilisearch) synced.
3.  **Next.js Frontend**: A beautiful, responsive web application for discovering startups, engaging with the community, and viewing analytics.

<br/>
<div align="center">
  <i>Built by NovaEdge Digital Labs</i>
</div>
