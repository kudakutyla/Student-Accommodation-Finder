'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listUsersRequest, suspendUserRequest } from '@/services/admin.service';
import { Role, User } from '@/types';
import { formatDate } from '@/lib/format';
import { ApiClientError } from '@/lib/api-client';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  function loadUsers() {
    setIsLoading(true);
    listUsersRequest(roleFilter === 'all' ? undefined : (roleFilter as Role))
      .then((res) => setUsers(res.data))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadUser resets the loading flag before a new fetch on filter change
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  async function handleToggleSuspend(user: User) {
    try {
      await suspendUserRequest(user.id, !user.isSuspended);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isSuspended: !u.isSuspended } : u)));
      toast.success(user.isSuspended ? 'User unsuspended' : 'User suspended');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to update user.');
    }
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage all student and landlord accounts."
        action={
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? 'all')}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="STUDENT">Students</SelectItem>
              <SelectItem value="LANDLORD">Landlords</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      {isLoading ? (
        <LoadingState />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <StatusBadge status={user.isSuspended ? 'SUSPENDED' : 'ACTIVE'} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {user.role !== 'ADMIN' && (
                      <Button
                        size="sm"
                        variant={user.isSuspended ? 'outline' : 'destructive'}
                        onClick={() => handleToggleSuspend(user)}
                      >
                        {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
