# Page View Tracking System

This document describes the page view tracking system implemented in the wiki application.

## Overview

The page view tracking system automatically records when users view public pages and provides analytics for content creators.

## Features

- **Automatic Tracking**: Views are automatically tracked when users visit public pages
- **Duplicate Prevention**: Uses caching to prevent tracking multiple views from the same user/IP within 24 hours
- **User Privacy**: Tracks anonymous views by IP address and optionally authenticated user views
- **Analytics Dashboard**: Real-time view counts displayed in the user dashboard
- **Per-Page Statistics**: Individual page view statistics for content creators

## Database Schema

### page_views table
- `id`: Primary key
- `page_id`: Foreign key to pages table (UUID)
- `ip_address`: Visitor's IP address (nullable for privacy)
- `user_agent`: Browser user agent string
- `referrer`: HTTP referrer URL
- `user_id`: Foreign key to users table (nullable, for authenticated users)
- `viewed_at`: Timestamp of the view
- `created_at`, `updated_at`: Laravel timestamps

## Components

### Models

- **PageView**: Model for tracking individual page views
- **Page**: Extended with view relationships and accessors

### Services

- **PageViewService**: Handles view tracking logic and analytics queries

### Features

1. **View Tracking**: Automatic tracking on public page visits
2. **Dashboard Stats**: Total public view counts for user's content
3. **Page Analytics**: Detailed view statistics for individual pages
4. **Seeding Command**: Command to generate test data

## Usage

### Tracking Views
Views are automatically tracked when users visit public pages. The system:
- Records the view with IP address, user agent, and referrer
- Associates with authenticated user if logged in
- Prevents duplicate tracking using 24-hour cache

### Dashboard Statistics
The dashboard shows:
- Total public views across all user's content
- Real-time statistics updated with each view

### Page Analytics
For content creators with edit permissions, page views include:
- Total views (all time)
- Unique views (based on IP/user combination)
- Views this month
- Views this week

### Seeding Test Data
Generate sample view data for testing:

```bash
php artisan seed:page-views --pages=10 --views=100
```

## Privacy Considerations

- IP addresses are hashed and used only for duplicate prevention
- User agents are stored for analytics but not exposed publicly
- Authenticated user tracking is optional and can be disabled
- Views are aggregated for statistics, individual view data is not exposed

## Performance

- Database indexes on frequently queried columns
- Caching to prevent duplicate tracking
- Efficient query patterns for analytics
- Automatic cleanup of old view records (can be implemented)

## API Methods

### PageViewService

```php
// Track a view
$service->trackView(Page $page, Request $request);

// Get view counts
$service->getPageViews(Page $page);
$service->getUniquePageViews(Page $page);
$service->getTotalPublicViews($userId);
$service->getPageViewsInRange(Page $page, $startDate, $endDate = null);
$service->getPopularPages($userId, $limit = 10);
```

### Page Model Accessors

```php
// Total views for a page
$page->total_views;

// Unique views for a page
$page->unique_views;

// View relationship
$page->views();
```

## Future Enhancements

Potential improvements:
- Real-time analytics dashboard
- Geographic view tracking
- View trending analysis
- Popular content recommendations
- Export analytics data
- Automated view cleanup for GDPR compliance
