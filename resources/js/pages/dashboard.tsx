import { Head, Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import {
  Plus,
  FileText,
  FolderOpen,
  Settings,
  HelpCircle,
  TrendingUp,
  EyeIcon,
  UsersIcon,
  FileTextIcon,
  ArrowDownFromLineIcon,
} from 'lucide-react';
import { useState } from 'react';
import { QuickActionButton } from '@/components/dashboard/quick-action-button';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import DashboardLayout from '@/layouts/dashboard-layout';
import type { DashboardStats, ModInfo, PageInfo, SharedData } from '@/types';

interface Props {
  stats: DashboardStats;
}

export default function Dashboard({ stats }: Props) {
  const totalMods = stats.ownedModsCount + stats.collaborativeModsCount;

  return (
    <DashboardLayout>
      <Head title="Dashboard" />
      <div className="relative">
        {/* the hero blob thing that fades into the content */}
        <div className="absolute inset-0 z-0 h-96 overflow-hidden bg-linear-to-br from-primary/10 via-purple-500/5 to-pink-500/10 mask-[linear-gradient(to_bottom,black_50%,transparent_100%)]">
          <div className="animate-blob absolute -top-4 -left-4 h-72 w-72 rounded-full bg-purple-500/15 mix-blend-multiply blur-3xl filter dark:mix-blend-normal" />
          <div className="animation-delay-2000 animate-blob absolute -top-4 -right-4 h-72 w-72 rounded-full bg-white/15 mix-blend-multiply blur-3xl filter dark:mix-blend-normal" />
        </div>
        <Hero />

        <div className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 pb-8">
          <div className="flex items-stretch gap-6 not-lg:flex-col">
            <div className="flex-1 lg:col-span-2">
              <RecentActivity stats={stats} />
            </div>
            <div className="my-4">
              <Separator orientation="vertical" />
            </div>
            <div className="w-xs space-y-6">
              <QuickActions />
              <div className="mx-4">
                <Separator />
              </div>
              <Stats stats={stats} totalMods={totalMods} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Hero() {
  const { auth } = usePage<SharedData>().props;

  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Greetings';
    return 'Good evening';
  });

  return (
    <div className="relative overflow-hidden border-border/50 md:p-10">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {greeting}
          </span>
          <span className="text-sm">{auth.user.name}</span>
        </div>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Welcome back to your workspace
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Manage your mods, collaborate with your team, and create
          documentation.
        </p>
        {/* <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/mods/create">
            <Button
              variant="outline"
              className="gap-2 transition-colors duration-300 hover:bg-primary hover:text-background bg-background/50"
            >
              <Plus className="h-4 w-4" />
              Create New Mod
            </Button>
          </Link>
          <Link href="/dashboard/mods">
            <Button
              variant="ghost"
              className="gap-2 transition-colors duration-300 hover:bg-primary/10"
            >
              <FolderOpen className="h-4 w-4" />
              Browse Your Mods
            </Button>
          </Link>
        </div> */}
      </div>
    </div>
  );
}

// function DashboardStats({
//   totalMods,
//   stats,
// }: {
//   totalMods: number;
//   stats: DashboardStats;
// }) {
//   return (
//     <>
//       <StatCard
//         title="Total Mods"
//         value={totalMods ?? 0}
//         icon={FolderOpen}
//         variant="white"
//         delay={0}
//       />
//       <StatCard
//         title="Documentation Pages"
//         value={stats.totalPagesCount ?? 0}
//         icon={FileText}
//         variant="white"
//         delay={100}
//       />
//       <StatCard
//         title="Collaborators"
//         value={stats.collaborativeModsCount ?? 0}
//         icon={Users}
//         variant="white"
//         delay={200}
//       />
//       <StatCard
//         title="Public Views"
//         value={stats.publicViewsCount ?? 0}
//         icon={EyeIcon}
//         variant="white"
//         delay={300}
//       />
//     </>
//   );
// }

function Stats({
  stats,
  totalMods,
}: {
  stats: DashboardStats;
  totalMods: number;
}) {
  const dashboardStats = [
    {
      title: 'Total Mods',
      value: totalMods ?? 0,
      icon: FolderOpen,
    },
    {
      title: 'Documentation Pages',
      value: stats?.totalPagesCount ?? 0,
      icon: FileText,
    },
    {
      title: 'Public Views',
      value: stats?.publicViewsCount ?? 0,
      icon: EyeIcon,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="flex items-center gap-2 font-semibold">Your Stats</h1>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border py-2">
        {dashboardStats.map((stat, index) => (
          <>
            <Stat
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
            {index < dashboardStats.length - 1 && <Separator />}
          </>
        ))}
      </div>
    </div>
  );

  function Stat({
    title,
    value,
    icon: Icon,
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
  }) {
    return (
      <div className="mx-4 flex items-center text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4" /> {title}
        </span>
        <span className="ml-auto font-mono font-semibold">{value}</span>
      </div>
    );
  }
}

function QuickActions() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="flex items-center gap-2 font-semibold">Quick Actions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Common tasks and shortcuts
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <QuickActionButton
          icon={Plus}
          label="New Mod"
          description="Start a new project"
          href="/dashboard/mods/create"
          variant="primary"
        />
        <QuickActionButton
          icon={FolderOpen}
          label="Browse Mods"
          description="View all projects"
          href="/dashboard/mods"
        />
        <QuickActionButton
          icon={Settings}
          label="Settings"
          description="Manage your account"
          href="/settings/profile"
        />
        <QuickActionButton
          icon={HelpCircle}
          label="Help & Support (WIP)"
          description="Get assistance"
          href="/help"
        />
      </div>
    </div>
  );
}

function RecentActivity({ stats }: { stats: DashboardStats }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="flex items-center gap-2 font-semibold">
          <TrendingUp className="h-5 w-5" />
          Pick up where you left off
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your latest mods and documentation updates
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {stats.latestMods?.length > 0 ? (
          stats.latestMods.map((mod) => (
            <RecentModCard key={mod.slug} mod={mod} />
          ))
        ) : (
          <div className="py-12 text-center">
            <FolderOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">No mods yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Get started by creating your first mod
            </p>
            <Link href="/dashboard/mods/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Mod
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  function RecentModCard({ mod }: { mod: ModInfo }) {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="flex flex-col">
        <Link href={`/dashboard/mods/${mod.slug}`} className="block">
          <div
            key={mod.slug}
            className="rounded-md border bg-background p-4 transition-colors hover:bg-accent"
          >
            <h3 className="text-lg font-semibold">{mod.name}</h3>
            <p className="text-sm text-muted-foreground">
              {mod.description || 'No description provided'}
            </p>
            <div className="mt-2 flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <Tooltip>
                <TooltipTrigger>
                  <span className="flex items-center gap-2">
                    <FileTextIcon className="size-4" />
                    {mod.pages_count}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    {mod.pages_count} documentation page
                    {mod.pages_count !== 1 ? 's' : ''}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <span className="flex items-center gap-2">
                    <UsersIcon className="size-4" />
                    {mod.collaborators_count}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    {mod.collaborators_count} collaborator
                    {mod.collaborators_count !== 1 ? 's' : ''}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger className="ml-auto">
                  <span className="text-end">
                    {new Date(mod.updated_at).toLocaleDateString()}
                  </span>
                </TooltipTrigger>

                <TooltipContent side="bottom">
                  <p>
                    Last updated on{' '}
                    {new Date(mod.updated_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Link>
        {mod.latest_pages.length > 0 && (
          <div className="mx-4 overflow-hidden rounded-b-md border border-t-0 bg-background">
            <Button
              variant="ghost"
              className="group h-8 w-full justify-start rounded-none text-xs text-muted-foreground"
              onClick={() => setExpanded((prev) => !prev)}
            >
              <ArrowDownFromLineIcon
                className="size-4 transition-transform duration-300"
                style={{
                  rotate: expanded ? '180deg' : '0deg',
                }}
              />{' '}
              <p className="opacity-0 transition-opacity group-hover:opacity-100">
                Click to show recent pages
              </p>
            </Button>
            <div
              className="grid duration-300 ease-in-out"
              style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
            >
              <div className="divide-y divide-border overflow-hidden">
                {mod.latest_pages.map((page, index) => (
                  <RecentPage
                    key={page.slug}
                    page={page}
                    mod_slug={mod.slug}
                    isFirst={index === 0}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );

    function RecentPage({
      page,
      mod_slug,
      isFirst = false,
    }: {
      page: PageInfo;
      mod_slug: string;
      isFirst?: boolean;
    }) {
      console.log(page.updated_at);

      return (
        <Link
          href={`/dashboard/mods/${mod_slug}/pages/${page.slug}`}
          className="flex gap-2 px-4 py-1 text-sm hover:bg-accent"
          style={{
            borderTopWidth: isFirst ? '1px' : '0px',
          }}
        >
          <FileTextIcon className="inline-block size-4 text-muted-foreground" />
          {page.title}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-auto text-xs text-muted-foreground">
                {new Date(page.updated_at).toLocaleDateString()}
              </span>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>
                Last updated on{' '}
                {new Date(page.updated_at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </TooltipContent>
          </Tooltip>
        </Link>
      );
    }
  }
}
