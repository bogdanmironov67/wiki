import { Head, useForm } from '@inertiajs/react';
import { ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { visibilityOptions } from '@/utils/commonUtils';

interface Mod {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url?: string;
  visibility: 'public' | 'private' | 'unlisted';
  storage_driver: 'local';
}

interface Props {
  mod: Mod;
}

export default function EditMod({ mod }: Props) {
  const [iconPreview, setIconPreview] = useState<string | null>(
    mod.icon_url || null,
  );

  const { data, setData, patch, processing, errors } = useForm({
    name: mod.name,
    description: mod.description || '',
    visibility: mod.visibility,
    storage_driver: mod.storage_driver,
    icon: null as File | null,
  });

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('icon', file);
      const reader = new FileReader();
      reader.onload = (e) => setIconPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setData('icon', null);
      setIconPreview(mod.icon_url || null);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(`/dashboard/mods/${mod.slug}`, {
      forceFormData: true,
    });
  };

  const deleteMod = () => {
    // Handle delete
    fetch(`/dashboard/mods/${mod.slug}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-TOKEN':
          document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || '',
      },
    }).then(() => {
      window.location.href = '/dashboard/mods';
    });
  };

  return (
    <AppLayout>
      <Head title={`Edit ${mod.name}`} />

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="mb-4 text-sm text-primary">
            <a href={`/dashboard/mods/${mod.slug}`} className="hover:underline">
              {mod.name}
            </a>
            <ChevronRightIcon className="m-1 inline h-4 w-4" />
            <span>Settings</span>
          </nav>
          <h1 className="text-3xl font-bold text-primary">Mod Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Update your mod's details and configuration
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Mod Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="My Awesome Mod"
                    className={errors.name ? 'text-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.name}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    Changing the name will update the URL slug
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="A brief description of what your mod does..."
                    rows={4}
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="icon">Mod Icon</Label>
                  <div className="space-y-2">
                    <Input
                      id="icon"
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className={errors.icon ? 'border-destructive' : ''}
                    />
                    {iconPreview && (
                      <div className="mt-2">
                        <img
                          src={iconPreview}
                          alt="Icon preview"
                          className="h-16 w-16 rounded-lg border object-cover"
                        />
                      </div>
                    )}
                    {errors.icon && (
                      <p className="text-sm text-destructive">{errors.icon}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Optional. Upload a square image (PNG, JPG, GIF, WebP).
                      Maximum size: 2MB.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="visibility">Visibility *</Label>
                  <Select
                    value={data.visibility}
                    onValueChange={(value: 'public' | 'unlisted' | 'private') =>
                      setData('visibility', value)
                    }
                  >
                    <SelectTrigger
                      className={errors.visibility ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Choose visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="flex w-full"
                        >
                          <div className="hidden w-full items-center justify-between gap-4 sm:flex">
                            <div className="font-medium">{option.label}</div>
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
                  {errors.visibility && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.visibility}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button type="button" variant="outline" asChild>
                    <a href={`/dashboard/mods/${mod.slug}`}>Cancel</a>
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="text-lg font-medium">Delete Mod</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this mod and all its content. This action
                    cannot be undone.
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger>
                    <Button variant="destructive">
                      Delete Mod Permanently
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this mod? This will
                        permanently delete all pages, files, and collaborator
                        access. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="destructive" onClick={deleteMod}>
                        Confirm deletion
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
