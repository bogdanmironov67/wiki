import { PlusIcon, BookOpenIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/commonUtils';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface Mod {
  id: string;
  name: string;
  slug: string;
  description: string;
  visibility: 'public' | 'private' | 'unlisted';
  pages_count: number;
  collaborators_count: number;
  updated_at: string;
}

interface Props {
  ownedMods: Mod[];
  collaborativeMods: Mod[];
}

export default function ModsIndex({ ownedMods, collaborativeMods }: Props) {
  useFlashMessages();

  return (
    <AppLayout>
      <Head title="Your Mods" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Mods</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your mod documentation and collaborate with others.
            </p>
          </div>
          <Button asChild size="lg" className="shadow-md">
            <a href="/dashboard/mods/create">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Mod
            </a>
          </Button>
        </div>

        {/* Owned Mods */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-secondary-foreground">
            Owned Mods ({ownedMods.length})
          </h2>
          {ownedMods.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpenIcon className="mx-auto mb-4 h-12 w-12 text-secondary-foreground" />
                <h3 className="mb-2 text-lg font-medium text-secondary-foreground">
                  No mods yet
                </h3>
                <p className="mb-4 text-muted-foreground">
                  Create your first mod to start building documentation
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ownedMods.map((mod) => (
                <ModCard key={mod.id} mod={mod} />
              ))}
            </div>
          )}
        </div>

        {/* Collaborative Mods */}
        {collaborativeMods.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-secondary-foreground">
              Collaborative Mods ({collaborativeMods.length})
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collaborativeMods.map((mod) => (
                <ModCard key={mod.id} mod={mod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const getVisibilityColor = (visibility: string) => {
  switch (visibility) {
    case 'public':
      return 'bg-green-100 text-green-800';
    case 'private':
      return 'bg-red-100 text-red-800';
    case 'unlisted':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

function ModCard({ mod }: { mod: Mod }) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-sm border-border/50 bg-linear-to-br transition-all duration-300 ease-in-out',
        'hover:scale-[1.02] hover:shadow-sm',
        'from-primary/10 to-card',
        'hover:shadow-primary/10',
      )}
    >
      <a href={`/dashboard/mods/${mod.slug}`}>
        <CardHeader>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-start justify-between">
                <CardTitle className="truncate text-lg">{mod.name}</CardTitle>
                <Badge
                  className={`text-xs ${getVisibilityColor(mod.visibility)}`}
                >
                  {mod.visibility}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>{mod.name}</TooltipContent>
          </Tooltip>
          <CardDescription>{mod.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="m-4 flex items-center justify-between text-sm text-secondary-foreground">
            <div className="flex-col items-center space-y-4">
              <span className="flex items-center">
                <BookOpenIcon className="mr-1 h-4 w-4" />
                {mod.pages_count} pages
              </span>
              <span className="flex items-center">
                <UsersIcon className="mr-1 h-4 w-4" />
                {mod.collaborators_count} collaborators
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="h-full flex-col items-end justify-end text-muted-foreground">
          <span>Updated {formatDate(mod.updated_at)}</span>
        </CardFooter>
      </a>
    </Card>
  );
}
