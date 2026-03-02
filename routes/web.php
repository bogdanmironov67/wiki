<?php

use App\Http\Controllers\FileController;
use App\Http\Controllers\ModController;
use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::group(['prefix' => '/dashboard', 'middleware' => ['auth', 'verified']], function () {

    Route::get('/', function () {
        $user = Auth::user();

        $ownedModsCount = $user->ownedMods()->count();
        $collaborativeModsCount = $user->mods()->count();
        $totalPagesCount = $user->ownedMods()->withCount('pages')->get()->sum('pages_count') +
            $user->mods()->withCount('pages')->get()->sum('pages_count');
        $latestMods = $user->ownedMods()
            ->with(['pages' => function ($query) {
                $query->latest()->limit(5)->select('id', 'title as name', 'slug', 'updated_at', 'mod_id');
            }])
            ->latest()
            ->limit(5)
            ->select('id', 'name', 'slug', 'updated_at')
            ->get()
            ->merge(
                $user->mods()
                    ->with(['pages' => function ($query) {
                        $query->latest()->limit(5)->select('id', 'title as name', 'slug', 'updated_at', 'mod_id');
                    }])
                    ->latest()
                    ->limit(5)
                    ->select('id', 'name', 'slug', 'updated_at')
                    ->get()
            )
            ->sortByDesc('updated_at')
            ->take(5)
            ->map(function ($mod) {
                return [
                    'slug' => $mod->slug,
                    'name' => $mod->name,
                    'last_update_time' => $mod->updated_at,
                    'latest_pages' => $mod->pages->map(function ($page) {
                        return [
                            'name' => $page->name,
                            'slug' => $page->slug,
                            'last_update' => $page->updated_at,
                        ];
                    })->toArray(),
                ];
            })
            ->values();

        return Inertia::render('dashboard', [
            'stats' => [
                'ownedModsCount' => $ownedModsCount,
                'collaborativeModsCount' => $collaborativeModsCount,
                'totalPagesCount' => $totalPagesCount,
                'publicViewsCount' => 0,
                'latestMods' => $latestMods,
            ],
        ]);
    })->name('dashboard');

    Route::resource('/mods', ModController::class)->except(['show']);
    Route::get('/mods/{mod:slug}', [ModController::class, 'show'])->name('mods.show');

    Route::get('/mods/{mod:slug}/collaborators', [ModController::class, 'manageCollaborators'])->name('mods.collaborators.index');
    Route::post('/mods/{mod:slug}/collaborators', [ModController::class, 'addCollaborator'])->name('mods.collaborators.store');
    Route::delete('/mods/{mod:slug}/collaborators/{collaborator}', [ModController::class, 'removeCollaborator'])->name('mods.collaborators.destroy');
    Route::patch('/mods/{mod:slug}/collaborators/{collaborator}', [ModController::class, 'updateCollaboratorRole'])->name('mods.collaborators.update');

    Route::get('/mods/{mod:slug}/pages', [PageController::class, 'index'])->name('pages.index');
    Route::get('/mods/{mod:slug}/pages/create', [PageController::class, 'create'])->name('pages.create');
    Route::post('/mods/{mod:slug}/pages', [PageController::class, 'store'])->name('pages.store');
    Route::get('/mods/{mod:slug}/pages/{page:slug}', [PageController::class, 'show'])->name('pages.show');
    Route::get('/mods/{mod:slug}/pages/{page:slug}/edit', [PageController::class, 'edit'])->name('pages.edit');
    Route::patch('/mods/{mod:slug}/pages/{page:slug}', [PageController::class, 'update'])->name('pages.update');
    Route::delete('/mods/{mod:slug}/pages/{page:slug}', [PageController::class, 'destroy'])->name('pages.destroy');

    Route::post('/mods/{mod:slug}/pages/reorder', [PageController::class, 'updateOrder'])->name('pages.reorder');
    Route::post('/mods/{mod:slug}/pages/{page:slug}/autosave', [PageController::class, 'autoSave'])->name('pages.autosave');
    Route::get('/mods/{mod:slug}/pages/search', [PageController::class, 'search'])->name('pages.search');

    Route::get('/mods/{mod:slug}/files', [FileController::class, 'index'])->name('files.index');
    Route::post('/mods/{mod:slug}/files', [FileController::class, 'store'])->name('files.store');
    Route::get('/mods/{mod:slug}/files/{file}', [FileController::class, 'show'])->name('files.show');
    Route::delete('/mods/{mod:slug}/files/{file}', [FileController::class, 'destroy'])->name('files.destroy');
    Route::get('/mods/{mod:slug}/files/{file}/download', [FileController::class, 'download'])->name('files.download');

    Route::post('/mods/{mod:slug}/files/quick-upload', [FileController::class, 'quickUpload'])->name('files.quick-upload');
    Route::get('/mods/{mod:slug}/pages/{page:slug}/files', [FileController::class, 'getPageFiles'])->name('files.page');
});

Route::get('/mod/{mod:slug}', [ModController::class, 'publicShow'])->name('public.mod');
Route::get('/mod/{mod:slug}/{page:slug}', [PageController::class, 'publicShow'])->name('public.page');

Route::get('invitations/{token}', [ModController::class, 'showInvitation'])->name('invitations.show');
Route::post('invitations/{token}/accept', [ModController::class, 'acceptInvitation'])->name('invitations.accept')->middleware('auth');
Route::post('invitations/{token}/reject', [ModController::class, 'rejectInvitation'])->name('invitations.reject')->middleware('auth');
Route::delete('invitations/{token}/cancel', [ModController::class, 'cancelInvitation'])->name('invitations.cancel')->middleware('auth');

require __DIR__.'/settings.php';
