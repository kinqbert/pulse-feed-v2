## Scenario

You're joining the team behind **Pulse**, an internal collaboration tool used by ~50,000 employees
across a large company. Pulse's home screen is an activity feed: comments on documents the
user owns, @-mentions, file changes, approval requests, deployment notifications, reactions, and
so on.

The current feed is slow, scroll position jumps around, and users complain it's hard to find anything. You're building v2.

## What it should feel like

If you've used Slack's Activity view or GitHub's Notifications feed, you already have the right
mental model. Pulse v2 sits in that family. It is not Twitter, not Instagram, not a news reader — it's
an inbox of things that happened and need a

A user opening Pulse should be able to:
• Get the gist in five seconds. Scan the top of the feed and know what's new since they last
checked: who needs a reply, what's urgent, what's just FYI.

• Triage like an inbox. Mark items as read once they've been handled and leave the rest as
unread to come back to. The unread count is the thing the user cares about — they want it
going down over the day.

• Act without leaving. Reply to a comment, react to a deployment, dismiss an FYI — all from
the feed. Opening a separate page per item would be too much friction for the volume these
users deal with.

• Find a specific thing. “What was that comment from Alice about the Q3 doc last week?” —
filters and search exist for this. Power users will lean on them daily.

• Trust the feed. New items appear without a refresh. Filters survive a page reload. Reactions
don't disappear if the network blips. The user should never wonder “did that actually save?”

Visually, think **dense but scannable** — closer to Linear's Inbox or GitHub Notifications than to
Instagram. Information per pixel matters more than whitespace and large imagery. Power users are scanning, not browsing.

## What to build

### Frontend

A single page that displays a personalized activity feed. The behavior the page must support is
described below.

1. See the feed.
   • Each item shows at minimum: who the activity is from (name plus avatar or initials), what kind of activity it is (visually distinguishable — a comment should not be confused with a
   deployment), when it happened (a relative timestamp like “2m ago” is fine), and a content
   preview appropriate to its type.
   • Different activity types may render differently. A comment shows the comment text. A file
   change shows what changed. An approval request shows what is being approved.
   • Items have a visible read / unread state. Unread items are visually distinct from read ones.
   • The feed has an order that makes sense to a user opening the page; explain your ordering in the README.

2. Real-time updates.
   • New activity created elsewhere appears in the user's feed without a manual refresh.
   • A user who is reading or scrolled mid-feed is not yanked to the top when new items arrive. They should still be made aware that new activity is available.
   • The behavior must remain reasonable when the tab has been idle for a long time (the user
   closed their laptop for an hour) and they come back.

3. Filtering.
   • Filter by activity type (comment, mention, file change, approval request, deployment, reaction).
   • Filter by author / source user.
   • Filter by time range, with presets “today” / “this week” / “this month” and a custom range.
   • Multiple filters combine (e.g. “comments from Alice this week”). Filters can be cleared
   individually and all at once.
   • The current filter state is reflected in the URL — copying the URL into a new tab reproduces the same filtered view.
   • When filters produce no results, an empty state explains why so the user does not think the app is broken.
   • When real-time activity arrives that does not match the active filters, the filtered view should not silently break.

4. Search.
   • Searches across activity content (message body, file name, attached metadata where it makes sense).
   • Combines with filters: filtered results can be searched, and search results respect filters.
   • Clearing the search returns the unfiltered (or filter-only) view.
   • A search that matches nothing shows an empty state.

5. Inline actions.
   • Mark as read / unread. The state persists across page refresh and across sessions.
   • Reply with text. Posting a reply happens from inside the feed (no full-page navigation required to leave a comment). The reply is visible in context once posted, and persists.
   • React with an emoji. An item can carry multiple distinct reactions with counts. The user can
   remove their own reaction. Reactions persist.
   Across all of the above. The page handles loading, error, and empty states without showing a
   blank screen. API failures are recoverable from inside the UI. The interface stays usable while
   requests are in flight — typing in the search box, switching filters, and scrolling do not freeze.
   There is no design mock — make it look reasonable.
   Assume the user could have anywhere from 5 to 100,000 activity items in their feed. Some power users sit on this page all day.

Required: React.

Any other libraries, tooling, and patterns are yours to choose.

### Backend

Provide a backend that supports the frontend above. At minimum:
• An endpoint that serves a feed for a given user.
• A mechanism to deliver real-time updates.
• Endpoints to mark items read, post replies, and add reactions.
• A way to seed the database with realistic data so the project can run locally (a few thousand
items across multiple users is plenty).

Required: Node.js.

Database, framework, transport, and architecture are yours to choose. Persistence isn't strictly
required if you'd rather keep state in memory — just be explicit about that in the README.

---

Must Add

Required activity types and richer previews.
The schema currently has comment, mention, task_update, and deployment: schema.ts (line 8).
Add file_change, approval_request, and reaction. Comments and mentions also need actual preview content, not only an entity name: FeedItem.tsx (line 37). Add an avatar or initials to each feed item.

Unread toggling and count.
Only PATCH /feed/:activityId/read exists: feed.controller.ts (line 30).
Add mark-as-unread and show an unread count. Display mutation failure feedback or optimistic rollback.

Realtime behavior for active readers and idle tabs.
New events are prepended immediately with no “new activity available” banner. Missed socket events after sleep are not reconciled on reconnect or tab focus: useFeedRealtimeActivities.ts (line 23).
Buffer incoming items while scrolled down, show a count/banner, and refetch after reconnect or visibility restoration.

Fix Existing Issues
The scroll-preservation hook scrolls by a hardcoded 120px whenever the activities array changes: usePreserveFeedScrollOnPrepend.ts (line 22). It also runs when loading older items or switching filters, causing incorrect jumps. Track actual prepended IDs and measured height.
Feed load errors have no retry button: Feed.tsx (line 94).
Filter/search empty states need to explain that no results matched, rather than saying there is no feed activity: Feed.tsx (line 102).
The README is effectively empty and must document setup, persistence, ordering, realtime behavior, and tradeoffs: README.md (line 1).
Add tests for cursor pagination, combined filters/search, per-user read state, reactions, replies, and realtime reconciliation.
