import { PlusIcon, UsersIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Head, useForm, router } from '@inertiajs/react';
import { ChevronRightIcon, DotIcon } from 'lucide-react';
import { useState } from 'react';
import { sileo } from 'sileo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserInfo } from '@/components/user-info';
import { useInitials } from '@/hooks/use-initials';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import AppLayout from '@/layouts/app-layout';
import type { User } from '@/types';
import { getRoleColor } from '@/utils/commonUtils';

type Role = 'admin' | 'editor' | 'viewer';

interface Collaborator extends User {
  pivot: {
    role: Role;
    invited_by: number;
    created_at: string;
  };
}

interface PendingInvitation {
  id: string;
  token: string;
  role: Role;
  expires_at: string;
  user: User;
  inviter: User;
}

interface CollaboratorOrInvite {
  id: number;
  name: string;
  username: string;
  avatar_url?: string;
  role: Role;
  invited_by: number;
  created_at?: string;
  expires_at?: string;
  token?: string;
  isPending: boolean;
}

interface Mod {
  id: string;
  name: string;
  slug: string;
  description: string;
  visibility: 'public' | 'private' | 'unlisted';
  owner: User;
  collaborators: Collaborator[];
}

interface Props {
  mod: Mod;
  pendingInvitations: PendingInvitation[];
  canManage: boolean;
}

const roleOptions = [
  {
    value: 'admin',
    label: 'Admin',
    description:
      'Can create, edit, and delete pages. Can manage collaborators and invite new members.',
  },
  {
    value: 'editor',
    label: 'Editor',
    description:
      'Can create, edit, and publish pages. Cannot manage collaborators or mod settings.',
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description:
      'Can only view private mod content. Cannot edit or create pages.',
  },
];

export default function ManageCollaborators({
  mod,
  pendingInvitations,
  canManage,
}: Props) {
  useFlashMessages();
  const getInitials = useInitials();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    username: '',
    role: 'viewer' as Role,
  });

  const { delete: deleteRequest } = useForm();

  const allPeople: CollaboratorOrInvite[] = [
    ...mod.collaborators.map((collab) => ({
      id: collab.id,
      name: collab.name,
      username: collab.username,
      avatar_url: collab.avatar_url,
      role: collab.pivot.role,
      invited_by: collab.pivot.invited_by,
      created_at: collab.pivot.created_at,
      isPending: false,
    })),
    ...pendingInvitations.map((invitation) => ({
      id: invitation.user.id,
      name: invitation.user.name,
      username: invitation.user.username,
      avatar_url: invitation.user.avatar_url,
      role: invitation.role,
      invited_by: invitation.inviter.id,
      expires_at: invitation.expires_at,
      token: invitation.token,
      isPending: true,
    })),
  ];

  const addCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/dashboard/mods/${mod.slug}/collaborators`, {
      onSuccess: () => {
        reset();
        setShowAddDialog(false);
        sileo.success({
          title: 'Invitation Sent!',
          description: `Invitation has been sent to ${data.username}`,
        });
      },
      onError: (errors) => {
        if (errors.email) {
          sileo.error({
            title: 'Email Failed',
            description: errors.email,
          });
        } else if (errors.username) {
          sileo.error({
            title: 'Invalid User',
            description: errors.username,
          });
        } else {
          sileo.error({
            title: 'Error',
            description: 'Failed to send invitation. Please try again.',
          });
        }
      },
    });
  };

  const removeCollaborator = (person: CollaboratorOrInvite) => {
    const actionText = person.isPending
      ? 'cancel this invitation'
      : 'remove this collaborator';
    if (confirm(`Are you sure you want to ${actionText}?`)) {
      const endpoint = person.isPending
        ? `/dashboard/invitations/${person.token}/cancel`
        : `/dashboard/mods/${mod.slug}/collaborators/${person.id}`;

      deleteRequest(endpoint, {
        onSuccess: () => {
          const successText = person.isPending
            ? 'Invitation cancelled'
            : 'Collaborator removed';
          sileo.success({
            title: successText,
            description: `${person.name} has been ${person.isPending ? 'uninvited' : 'removed'} from the mod`,
          });
        },
        onError: () => {
          sileo.error({
            title: 'Error',
            description: `Failed to ${person.isPending ? 'cancel invitation' : 'remove collaborator'}. Please try again.`,
          });
        },
      });
    }
  };

  const updateRole = (collaboratorId: number, newRole: string) => {
    const collaboratorToUpdate = mod.collaborators.find(
      (c) => c.id === collaboratorId,
    );
    const collaboratorName = collaboratorToUpdate?.name || 'collaborator';

    console.log('Updating role for:', collaboratorId, 'to:', newRole);
    console.log(
      'URL:',
      `/dashboard/mods/${mod.slug}/collaborators/${collaboratorId}`,
    );
    console.log('Data:', { role: newRole });

    router.patch(
      `/dashboard/mods/${mod.slug}/collaborators/${collaboratorId}`,
      { role: newRole },
      {
        onSuccess: () => {
          sileo.success({
            title: 'Role Updated',
            description: `${collaboratorName}'s role has been updated to ${newRole}`,
          });
        },
        onError: (errors) => {
          console.error('Update role errors:', errors);
          sileo.error({
            title: 'Error',
            description: `Failed to update role. ${JSON.stringify(errors)}`,
          });
        },
      },
    );
  };

  if (!canManage) {
    return (
      <AppLayout>
        <Head title={`Collaborators - ${mod.name}`} />
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="mb-2 text-lg font-medium">Access Denied</h3>
              <p className="mb-4 text-muted-foreground">
                You don't have permission to manage collaborators for this mod.
              </p>
              <Button asChild>
                <a href={`/dashboard/mods/${mod.slug}`}>Back to Mod</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title={`Manage Collaborators - ${mod.name}`} />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="mb-4 text-sm text-muted-foreground">
            <a href={`/dashboard/mods/${mod.slug}`} className="hover:underline">
              {mod.name}
            </a>
            <ChevronRightIcon className="m-1 inline h-4 w-4" />
            <span>Collaborators</span>
          </nav>
          <div className="mt-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Manage Collaborators</h1>
              <p className="mt-2 text-muted-foreground">
                Invite team members and manage their access to this mod
              </p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Invite Collaborator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New Collaborator</DialogTitle>
                </DialogHeader>
                <form onSubmit={addCollaborator} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={data.username}
                      onChange={(e) => setData('username', e.target.value)}
                      placeholder="Enter username"
                      className={errors.username ? 'border-destructive' : ''}
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={data.role}
                      onValueChange={(value) =>
                        setData('role', value as 'admin' | 'editor' | 'viewer')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="flex w-full"
                          >
                            <div className="hidden w-full items-center justify-between gap-4 sm:flex">
                              <Badge className={getRoleColor(option.value)}>
                                {option.label}
                              </Badge>
                              <div className="text-sm text-muted-foreground">
                                {option.description}
                              </div>
                            </div>

                            {/* Mobile view */}
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex w-full items-center justify-between gap-4 sm:hidden">
                                  <div className="font-medium">
                                    {option.label}
                                  </div>
                                  <div className="truncate text-sm text-muted-foreground">
                                    {option.description}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm text-muted-foreground">
                                  {option.description}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Inviting...' : 'Send Invitation'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Bento Box Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Owner and Collaborators */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UsersIcon className="mr-2 h-5 w-5" />
                  Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative flex items-center justify-between overflow-hidden rounded-lg p-4">
                  <div className="flex items-center">
                    <UserInfo user={mod.owner} />

                    <div className="ml-4">
                      <p className="text-sm font-bold text-primary">
                        {mod.owner.name}
                      </p>
                      <p className="flex items-center text-sm">
                        @{mod.owner.username}
                        <DotIcon />
                        Joined{' '}
                        {new Date(mod.owner.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getRoleColor('owner')}>Owner</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <UsersIcon className="mr-2 h-5 w-5" />
                    Collaborators ({allPeople.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allPeople.length === 0 ? (
                  <div className="py-8 text-center">
                    <UsersIcon className="mx-auto mb-4 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-medium text-primary">
                      No collaborators yet
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      Invite team members to help build this mod's documentation
                    </p>
                    <Button
                      onClick={() => setShowAddDialog(true)}
                      variant="outline"
                      className="gap-2 border-primary/50 bg-primary/40 transition-all duration-300 hover:bg-primary hover:text-background"
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Invite First Collaborator
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allPeople.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="flex items-center justify-between rounded-sm border p-4"
                      >
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                            <AvatarImage
                              src={collaborator.avatar_url}
                              alt={collaborator.name}
                            />
                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                              {getInitials(collaborator.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <p className="text-sm font-medium">
                              {collaborator.name}
                              {collaborator.isPending && (
                                <Badge className="ml-2 border-yellow-100 bg-transparent text-yellow-100">
                                  Pending
                                </Badge>
                              )}
                            </p>
                            <p className="flex items-center text-sm">
                              @{collaborator.username}
                              <DotIcon />
                              {collaborator.isPending
                                ? 'Invited'
                                : 'Joined'}{' '}
                              {collaborator.isPending
                                ? `Expires ${new Date(collaborator.expires_at!).toLocaleDateString()}`
                                : collaborator.created_at
                                  ? new Date(
                                      collaborator.created_at,
                                    ).toLocaleDateString()
                                  : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {!collaborator.isPending && (
                          <div className="flex items-center space-x-3">
                            <Select
                              value={collaborator.role}
                              onValueChange={(value) =>
                                updateRole(collaborator.id, value as Role)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:bg-destructive hover:text-primary focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Remove Collaborator</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to remove this
                                    collaborator?
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    onClick={() =>
                                      removeCollaborator(collaborator)
                                    }
                                    variant="destructive"
                                  >
                                    Remove
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Permissions Levels */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Permission Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roleOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-start space-x-3"
                    >
                      <Badge className={getRoleColor(option.value)}>
                        {option.label}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
