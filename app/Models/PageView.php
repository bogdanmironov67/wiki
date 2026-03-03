<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageView extends Model
{
    protected $fillable = [
        'page_id',
        'ip_address',
        'user_agent',
        'referrer',
        'user_id',
        'viewed_at',
    ];

    protected $casts = [
        'page_id' => 'string',
        'user_id' => 'string',
        'viewed_at' => 'datetime',
    ];

    /**
     * Get the page that was viewed.
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Get the user who viewed the page (if authenticated).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get views for a specific page.
     */
    public function scopeForPage($query, $pageId)
    {
        return $query->where('page_id', $pageId);
    }

    /**
     * Scope to get unique views (by IP/User combination).
     */
    public function scopeUnique($query)
    {
        return $query->selectRaw('DISTINCT ip_address, user_id, page_id, MAX(viewed_at) as viewed_at')
            ->groupBy('ip_address', 'user_id', 'page_id');
    }

    /**
     * Scope to get views within a date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate = null)
    {
        $query->where('viewed_at', '>=', $startDate);

        if ($endDate) {
            $query->where('viewed_at', '<=', $endDate);
        }

        return $query;
    }
}
