<?php

namespace App\Services;

use App\Models\Page;
use App\Models\PageView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class PageViewService
{
    /**
     * Track a page view.
     */
    public function trackView(Page $page, Request $request): void
    {
        $user = Auth::user();
        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();

        $identifier = $user ? "user_{$user->id}" : "ip_{$ipAddress}";
        $cacheKey = "page_view_{$page->id}_{$identifier}";

        if (Cache::has($cacheKey)) {
            return;
        }

        PageView::create([
            'page_id' => $page->id,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'referrer' => $request->header('referer'),
            'user_id' => $user?->id,
            'viewed_at' => now(),
        ]);

        Cache::put($cacheKey, true, now()->addHours(3));
    }

    /**
     * Get total views for a page.
     */
    public function getPageViews(Page $page): int
    {
        return PageView::where('page_id', $page->id)->count();
    }

    /**
     * Get unique views for a page.
     */
    public function getUniquePageViews(Page $page): int
    {
        return PageView::where('page_id', $page->id)
            ->selectRaw('DISTINCT COALESCE(user_id, ip_address) as identifier')
            ->count();
    }

    /**
     * Get total views for all public pages of a user.
     */
    public function getTotalPublicViews($userId): int
    {
        return PageView::whereHas('page', function ($query) use ($userId) {
            $query->where('published', true)
                ->whereHas('mod', function ($modQuery) use ($userId) {
                    $modQuery->where(function ($ownerQuery) use ($userId) {
                        $ownerQuery->where('owner_id', $userId)
                            ->orWhereHas('collaborators', function ($collabQuery) use ($userId) {
                                $collabQuery->where('user_id', $userId);
                            });
                    });
                });
        })->count();
    }

    /**
     * Get views for a specific page within a date range.
     */
    public function getPageViewsInRange(Page $page, $startDate, $endDate = null): int
    {
        $query = PageView::where('page_id', $page->id)
            ->where('viewed_at', '>=', $startDate);

        if ($endDate) {
            $query->where('viewed_at', '<=', $endDate);
        }

        return $query->count();
    }

    /**
     * Get popular pages for a user.
     */
    public function getPopularPages($userId, $limit = 10)
    {
        return PageView::select('page_id')
            ->selectRaw('COUNT(*) as view_count')
            ->whereHas('page', function ($query) use ($userId) {
                $query->where('published', true)
                    ->whereHas('mod', function ($modQuery) use ($userId) {
                        $modQuery->where(function ($ownerQuery) use ($userId) {
                            $ownerQuery->where('owner_id', $userId)
                                ->orWhereHas('collaborators', function ($collabQuery) use ($userId) {
                                    $collabQuery->where('user_id', $userId);
                                });
                        });
                    });
            })
            ->with(['page' => function ($query) {
                $query->select('id', 'title', 'slug', 'mod_id');
            }])
            ->groupBy('page_id')
            ->orderByDesc('view_count')
            ->limit($limit)
            ->get();
    }
}
