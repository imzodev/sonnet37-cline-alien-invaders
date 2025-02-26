# Space Invaders + Plants vs. Zombies

A fusion game combining the mechanics of Space Invaders and Plants vs. Zombies, built with Next.js and Supabase.

## Game Features

- **Player Control**: Move your spaceship horizontally to avoid enemies and position yourself for better defense placement
- **Defense Placement**: Place different types of defenses to protect against incoming enemies
- **Enemy Waves**: Battle increasingly difficult waves of alien invaders
- **Resource Management**: Collect resources by destroying enemies to build more defenses
- **Leaderboard**: Compete for high scores stored in Supabase

## Technologies Used

- **Next.js**: Frontend framework for the game interface and logic
- **TypeScript**: Type-safe code for better development experience
- **Framer Motion**: Smooth animations for game elements
- **Tailwind CSS**: Styling the game interface
- **Supabase**: Backend for storing and retrieving leaderboard scores
- **Howler.js**: Sound effects management

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- A Supabase account (for leaderboard functionality)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd space-invaders-pvz
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up Supabase:
   - Create a new project at [Supabase](https://supabase.com)
   - Create a `scores` table with the following columns:
     - `id`: uuid (primary key)
     - `user_name`: text
     - `score`: integer
     - `created_at`: timestamp with time zone (default: now())
   - Copy your Supabase URL and anon key

4. Create a `.env.local` file in the root directory with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Running the Game

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to play the game.

## Game Controls

- **Arrow Keys** or **A/D**: Move the spaceship left and right
- **Mouse Click**: Place selected defense at the clicked position
- **Defense Menu**: Select different types of defenses to place

## Deployment

You can deploy this game to Vercel or any other hosting platform that supports Next.js:

```bash
npm run build
# or
yarn build
```

## Future Enhancements

- Add more enemy types with unique behaviors
- Implement power-ups that provide temporary advantages
- Add sound effects and background music
- Create a multiplayer mode
- Add more visual themes and animations

## License

This project is licensed under the MIT License - see the LICENSE file for details.
