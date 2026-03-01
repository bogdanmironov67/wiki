<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Use this when you want to check scopes
 * independently of the main AuthenticateAPIKey middleware.
 *
 * Supports wildcard scopes like "read:mods:*" which will match
 * any scope starting with "read:mods:".
 *
 * Usage in routes:
 *   Route::middleware(['api.key', 'api.scope:write:orders'])->...
 *   Route::middleware(['api.key', 'api.scope:read:mods:*'])->...  // wildcard
 *
 * Or check multiple scopes (all must be present):
 *   Route::middleware(['api.key', 'api.scope:read:users,write:users'])->...
 */
class EnsureAPIScope
{
    public function handle(Request $request, Closure $next, string ...$scopes): Response
    {
        /** @var \App\Models\ApiKey|null $apiKey */
        $apiKey = $request->attributes->get('api_key');

        if (! $apiKey) {
            return response()->json(['error' => 'Not authenticated via API key.'], 401);
        }

        foreach ($scopes as $scope) {
            if (! $apiKey->hasScope($scope)) {
                return response()->json([
                    'error' => "This API key does not have the '{$scope}' scope.",
                    'required_scope' => $scope,
                    'key_scopes' => $apiKey->scopes,
                ], 403);
            }
        }

        return $next($request);
    }
}
