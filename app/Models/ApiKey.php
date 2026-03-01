<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApiKey extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'key',
        'scopes',
        'rate_limit',
        'expires_at',
        'last_used_at',
    ];

    protected $casts = [
        'scopes' => 'array',
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];

    protected $hidden = ['key'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ApiKeyLog::class);
    }

    /** Generate a cryptographically secure 64-char hex key. */
    public static function generate(): string
    {
        return bin2hex(random_bytes(32));
    }

    /** Check whether the key has passed its expiry date. */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Check whether this key grants the given scope.
     * An empty scopes array means the key has full access.
     * Supports wildcard scopes like "read:mods:*" which matches any scope starting with "read:mods:".
     *
     * @param  string  $scope  e.g. "read:users", "read:mods:show"
     */
    public function hasScope(string $scope): bool
    {
        if (empty($this->scopes)) {
            return false;
        }

        if (in_array($scope, $this->scopes, strict: true)) {
            return true;
        }

        if (in_array('*', $this->scopes, strict: true)) {
            return true;
        }

        foreach ($this->scopes as $keyScope) {
            if (str_ends_with($keyScope, '*')) {
                $pattern = rtrim($keyScope, '*');
                if (str_starts_with($scope, $pattern)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check multiple scopes at once (all must be present).
     *
     * @param  string[]  $scopes
     */
    public function hasAllScopes(array $scopes): bool
    {
        return collect($scopes)->every(fn ($s) => $this->hasScope($s));
    }
}
