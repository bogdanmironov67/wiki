import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { visibilityOptions } from '@/utils/commonUtils';

export default function CreateMod() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    visibility: 'private',
    storage_driver: 'local',
  });

  const submit = (e: React.SubmitEvent) => {
    e.preventDefault();
    post('/dashboard/mods');
  };

  return (
    <AppLayout>
      <Head title="Create New Mod" />

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Create New Mod</h1>
          <p className="mt-2 text-muted-foreground">
            Start a new documentation space for your mod or project
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Details</CardTitle>
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
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                )}
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
                <Label htmlFor="visibility">Visibility *</Label>
                <Select
                  value={data.visibility}
                  onValueChange={(value) => setData('visibility', value)}
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
                              <div className="font-medium">{option.label}</div>
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
                  <a href="/dashboard/mods">Cancel</a>
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Mod'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
