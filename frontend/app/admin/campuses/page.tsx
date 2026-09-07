'use client';

import { useEffect, useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { listCampusesRequest, createCampusRequest, updateCampusRequest, CampusPayload } from '@/services/campus.service';
import { Campus } from '@/types';
import { ApiClientError } from '@/lib/api-client';

const EMPTY_FORM: CampusPayload = { name: '', institution: '', address: '', latitude: 0, longitude: 0, isActive: true };

export default function AdminCampusesPage() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Campus | null>(null);
  const [form, setForm] = useState<CampusPayload>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadCampuses() {
    listCampusesRequest(true)
      .then((res) => setCampuses(res.data))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadCampuses();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(campus: Campus) {
    setEditing(campus);
    setForm({
      name: campus.name,
      institution: campus.institution,
      address: campus.address,
      latitude: campus.latitude,
      longitude: campus.longitude,
      isActive: campus.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editing) {
        await updateCampusRequest(editing.id, form);
        toast.success('Campus updated');
      } else {
        await createCampusRequest(form);
        toast.success('Campus created');
      }
      setDialogOpen(false);
      loadCampuses();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to save campus.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleActive(campus: Campus) {
    try {
      await updateCampusRequest(campus.id, { isActive: !campus.isActive });
      setCampuses((prev) => prev.map((c) => (c.id === campus.id ? { ...c, isActive: !c.isActive } : c)));
      toast.success(campus.isActive ? 'Campus deactivated' : 'Campus activated');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to update campus.');
    }
  }

  return (
    <div>
      <PageHeader
        title="Campuses"
        description="Manage the campuses students and landlords can select from."
        action={<Button onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> Add campus</Button>}
      />
      {isLoading ? (
        <LoadingState />
      ) : campuses.length === 0 ? (
        <EmptyState title="No campuses yet" />
      ) : (
        <div className="space-y-3">
          {campuses.map((campus) => (
            <Card key={campus.id}>
              <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{campus.name}</p>
                    <StatusBadge status={campus.isActive ? 'ACTIVE' : 'UNAVAILABLE'} />
                  </div>
                  <p className="text-sm text-muted-foreground">{campus.institution} &middot; {campus.address}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(campus)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant={campus.isActive ? 'destructive' : 'outline'} onClick={() => toggleActive(campus)}>
                    {campus.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit campus' : 'Add campus'}</DialogTitle>
            <DialogDescription>Campuses appear as selectable options for students and landlords.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Campus name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Institution</Label>
              <Input required value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input type="number" step="any" required value={form.latitude} onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input type="number" step="any" required value={form.longitude} onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? 'Save changes' : 'Create campus'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
