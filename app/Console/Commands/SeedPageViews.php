<?php

namespace App\Console\Commands;

use App\Models\Page;
use App\Models\PageView;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SeedPageViews extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'seed:page-views
                           {--pages=10 : Number of pages to add views to}
                           {--views=100 : Total number of views to create}';

    /**
     * The console command description.
     */
    protected $description = 'Seed the database with sample page views for testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $pagesCount = $this->option('pages');
        $viewsCount = $this->option('views');

        $this->info("Seeding {$viewsCount} page views across {$pagesCount} pages...");

        // Get published pages
        $pages = Page::where('published', true)
            ->inRandomOrder()
            ->limit($pagesCount)
            ->get();

        if ($pages->isEmpty()) {
            $this->error('No published pages found. Please create some pages first.');
            return;
        }

        $this->info("Found {$pages->count()} published pages to add views to.");

        $bar = $this->output->createProgressBar($viewsCount);
        $bar->start();

        for ($i = 0; $i < $viewsCount; $i++) {
            $page = $pages->random();

            // Generate random view data
            $viewedAt = Carbon::now()
                ->subDays(rand(0, 90))
                ->subHours(rand(0, 23))
                ->subMinutes(rand(0, 59));

            PageView::create([
                'page_id' => $page->id,
                'ip_address' => $this->generateRandomIp(),
                'user_agent' => $this->getRandomUserAgent(),
                'referrer' => $this->getRandomReferrer(),
                'user_id' => null, // Anonymous views for testing
                'viewed_at' => $viewedAt,
            ]);

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Successfully created {$viewsCount} page views!");

        // Show some stats
        $totalViews = PageView::count();
        $uniqueIpViews = PageView::distinct('ip_address')->count();
        $pagesWithViews = PageView::distinct('page_id')->count();

        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Views', $totalViews],
                ['Unique IP Addresses', $uniqueIpViews],
                ['Pages with Views', $pagesWithViews],
            ]
        );
    }

    private function generateRandomIp(): string
    {
        return implode('.', [
            rand(1, 254),
            rand(0, 255),
            rand(0, 255),
            rand(1, 254),
        ]);
    }

    private function getRandomUserAgent(): string
    {
        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/119.0 Firefox/119.0',
        ];

        return $userAgents[array_rand($userAgents)];
    }

    private function getRandomReferrer(): ?string
    {
        $referrers = [
            null, // Direct traffic
            'https://google.com/search',
            'https://github.com/',
            'https://stackoverflow.com/',
            'https://reddit.com/',
            'https://discord.com/',
            'https://twitter.com/',
        ];

        return $referrers[array_rand($referrers)];
    }
}
