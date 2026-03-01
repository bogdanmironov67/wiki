<?php

namespace App\Http\Controllers\Api\Client;

use App\Models\Mod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ModController extends ClientController
{
    /**
     * Display a listing of user's mods.
     */
    public function index()
    {
        $mods = Mod::all();

        return response()->json(
            $mods->map(function ($mod) {
                return [
                    'id' => $mod->id,
                    'name' => $mod->name,
                    'slug' => $mod->slug,
                    'description' => $mod->description,
                    'created_at' => $mod->created_at->toISOString(),
                    'updated_at' => $mod->updated_at->toISOString(),
                ];
            })
        );
    }

    /**
     * Display all the pages of a mod.
     */
    public function show(Request $request)
    {
        $mod_name = $request->route('mod');

        $mod = Mod::where('name', $mod_name)->firstOrFail();
        $pages = $mod->pages()->latest()->get()->map(function ($page) {
            return [
                'id' => $page->id,
                'name' => $page->name,
                'slug' => $page->slug,
                'content' => $page->content,
                'created_at' => $page->created_at->toISOString(),
                'updated_at' => $page->updated_at->toISOString(),
            ];
        });

        return response()->json([
            'pages' => $pages,
        ]);
    }

    /**
     * Get the markdown contents of a specified page.
     */
    public function getPageContent(Request $request)
    {
        $mod_name = $request->route('mod');
        $page_slug = $request->route('page');

        $mod = Mod::where('name', $mod_name)->firstOrFail();
        $page = $mod->pages()->where('slug', $page_slug)->firstOrFail();

        return response()->json([
            'content' => $page->content,
        ]);
    }
}
