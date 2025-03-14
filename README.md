# TypeScript Cron Jobs

This project provides a boilerplate for creating cron jobs using TypeScript and node-cron.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run the project:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Project Structure

- `src/` - Contains TypeScript source files
- `dist/` - Contains compiled JavaScript files
- `package.json` - Project configuration and dependencies
- `tsconfig.json` - TypeScript configuration

## Cron Pattern Syntax

```
 # ┌────────────── minute (0 - 59)
 # │ ┌──────────── hour (0 - 23)
 # │ │ ┌────────── day of month (1 - 31)
 # │ │ │ ┌──────── month (1 - 12)
 # │ │ │ │ ┌────── day of week (0 - 6) (Sunday to Saturday)
 # │ │ │ │ │
 # * * * * *
```

Common patterns:
- `* * * * *` - Every minute
- `0 * * * *` - Every hour
- `0 0 * * *` - Every day at midnight
- `0 0 * * 0` - Every Sunday at midnight
- `0 0 1 * *` - First day of every month at midnight

## Adding New Cron Jobs

To add new cron jobs, modify `src/index.ts` and add new `cron.schedule()` calls with your desired schedule pattern and callback function. 