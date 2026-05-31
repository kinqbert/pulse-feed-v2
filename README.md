# Pulse Feed V2

## Overview

Pulse Feed V2 is an activity inbox built with React, NestJS, PostgreSQL, Drizzle ORM, React Query, and Socket.IO.

The feed is ordered newest first and loaded in pages using cursor pagination. The frontend virtualizes the list so it stays usable with large feeds. Filters and search are stored in the URL, which makes filtered views reloadable and shareable.

Read state, replies, and reactions are stored in PostgreSQL. New activities are created randomly by a development ticker with interval from 20 to 30 seconds and sent to the browser over Socket.IO. The browser inserts matching activities into its React Query cache without reloading the whole feed.

Additionally, after a socket reconnect, active queries are refreshed to catch up with events that may have been missed. The same happens on focus change.

## How To Run

Requirements: Node.js, npm, Docker, and Docker Compose.

All the commands below should be run from the root of the repository.

1. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `apps/api/.env`:

   ```dotenv
   DATABASE_URL=postgres://pulse:pulse@localhost:5434/pulse
   PORT=3000
   CLIENT_URL=http://localhost:5173
   ```

4. Create `apps/web/.env`:

   ```dotenv
   VITE_API_URL=http://localhost:3000
   ```

5. Apply the current Drizzle schema and seed sample data:

   ```bash
   npm run db:migrate -w api
   npm run db:seed -w api
   ```

6. Start the API and web app:

   ```bash
   npm run dev
   ```

Open `http://localhost:5173`.

## Things To Do Next

1. One of the things that I would fix in the first place is implementing proper monorepo structure with shared packages for types. Right now, the API and web app are completely separate with no shared code, which leads to a lot of duplication and makes it much harder to keep things in sync. But it would take a bit of time to set up properly, so I decided to go with the simplest possible setup for this project

2. Right now there is no authentication, the current user is taken from the first one found in the database. Of course, this is not a realistic scenario. in real application there should be proper authentication and authorization implemented, and the API should check if the user has access to the requested data and operations. But again, I wanted to keep things simple for this project and focus on the feed functionality itself, so I decided to skip that part for now

3. The metadata for activities is currently just a JSON blob that contains not the IDs of the related entities, but their names. This is definitely not how it should be implemented in a real app, in this case I'd at least store IDs in the metadata and join related tables to get the actual data. It also makes sense to consider moving the data into separate table/tables instead of storing it as JSON, especially if we want to be able to filter or sort by that data and depending on how complex it is

4. Also there are no tests at all, which is something that should be fixed in a real app

5. The UI is okay in my opinion but basic and not responsive, it would be good to improve it and make it work on different screen sizes

6. I'd also consider changing the folder structure of the web app. Right now it's pretty flat, but this is only because the app is small and consists only from one page. As it grows, it would make sense to organize the code into feature-based folders or something like that to keep things more manageable

7. I'd consider using different indexing strategy for text search. Right now I'm using a simple GIN index on the `searchText` column that includes data from metadata and actor, but it may not be the most efficient way to do it. Depending on the use case, it may make sense to use a different indexing, like trigram or perhaps even a different database for search functionality like Elasticsearch or something like that. It really depends on the specific requirements and constraints of the project
