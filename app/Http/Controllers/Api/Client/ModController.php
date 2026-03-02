<?php

namespace App\Http\Controllers\Api\Client;

use App\Models\Mod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ModController extends ClientController
{
    /**
     * Display a listing of user's mods.
     */
    public function index()
    {
        $mods = Mod::where('visibility', 'public')
            ->latest()
            ->get();

        return response()->json(
            $mods->map(function (Mod $mod) {
                return [
                    'id' => $mod->id,
                    'name' => $mod->name,
                    'slug' => $mod->slug,
                    'description' => $mod->description,
                    'index' => $mod->indexPage ? [
                        'id' => $mod->indexPage->id,
                        'title' => $mod->indexPage->title,
                        'slug' => $mod->indexPage->slug,
                    ] : null,
                    'created_at' => $mod->created_at->toISOString(),
                    'updated_at' => $mod->updated_at->toISOString(),
                ];
            })
        );
    }

    /**
     * Display all the pages of a mod in hierarchical structure.
     */
    public function show(Request $request)
    {
        $mod_id = $request->route('mod');

        $mod = Mod::where('id', $mod_id)->firstOrFail();

        if (! $mod->canBeAccessedBy(Auth::user())) {
            return response()->json(['error' => 'Access denied. You do not have permission to view this mod.'], 403);
        }

        $allPages = $mod->pages()->orderBy('order_index')->get();

        $pages = $this->buildPageHierarchy($allPages);

        return response()->json([
            'pages' => $pages,
        ]);
    }

    /**
     * Recursively build page hierarchy from flat collection.
     */
    private function buildPageHierarchy($pages, $parentId = null)
    {
        return $pages
            ->filter(function ($page) use ($parentId) {
                return $page->parent_id === $parentId;
            })
            ->map(function ($page) use ($pages) {
                $children = $this->buildPageHierarchy($pages, $page->id);

                return [
                    'id' => $page->id,
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'children' => $children->values()->toArray(),
                ];
            })
            ->values();
    }

    /**
     * Get the markdown contents of a specified page.
     */
    public function getPageContent(Request $request)
    {
        $mod_id = $request->route('mod');
        $page_slug = $request->route('page');

        $mod = Mod::where('id', $mod_id)->firstOrFail();

        if (! $mod->canBeAccessedBy(Auth::user())) {
            return response()->json(['error' => 'Access denied. You do not have permission to view this mod.'], 403);
        }

        $page = $mod->pages()->where('slug', $page_slug)->firstOrFail();

        return response()->json([
            'content' => $page->content,
            'parent' => $page->parent ? [
                'id' => $page->parent->id,
                'title' => $page->parent->title,
                'slug' => $page->parent->slug,
            ] : null,
            'children' => $page->children()->orderBy('order_index')->get()->map(function ($child) {
                return [
                    'id' => $child->id,
                    'title' => $child->title,
                    'slug' => $child->slug,
                ];
            })->values()->toArray(),
        ]);
    }
}
