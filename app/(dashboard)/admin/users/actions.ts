'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import type { Profile, UserRole } from '@/types/database.types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface UserWithEmail extends Profile {
  email?: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

// -----------------------------------------------------------------------------
// Get All Users
// -----------------------------------------------------------------------------

export async function getUsers(): Promise<UserWithEmail[]> {
  const supabase = await createClient();

  // Get profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return profiles || [];
}

// -----------------------------------------------------------------------------
// Get Single User
// -----------------------------------------------------------------------------

export async function getUser(userId: string): Promise<UserWithEmail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

// -----------------------------------------------------------------------------
// Update User Role
// -----------------------------------------------------------------------------

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<ActionResult> {
  const supabase = await createClient();

  // Verify current user is admin
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) {
    return { success: false, error: 'No autenticado' };
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single();

  if (currentProfile?.role !== 'admin') {
    return { success: false, error: 'No tienes permisos para cambiar roles' };
  }

  // Prevent self-demotion
  if (userId === currentUser.id && role !== 'admin') {
    return { success: false, error: 'No puedes quitarte el rol de admin a ti mismo' };
  }

  // Update role
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating role:', error);
    return { success: false, error: 'Error al actualizar el rol' };
  }

  revalidatePath('/admin/users');
  return { success: true };
}

// -----------------------------------------------------------------------------
// Update User Profile
// -----------------------------------------------------------------------------

export async function updateUserProfile(
  userId: string,
  data: { full_name?: string; avatar_url?: string }
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Error al actualizar el perfil' };
  }

  revalidatePath('/admin/users');
  return { success: true };
}

// -----------------------------------------------------------------------------
// Delete User (Soft delete - just removes from profiles, auth user remains)
// -----------------------------------------------------------------------------

export async function deleteUser(userId: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Verify current user is admin
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) {
    return { success: false, error: 'No autenticado' };
  }

  // Prevent self-deletion
  if (userId === currentUser.id) {
    return { success: false, error: 'No puedes eliminarte a ti mismo' };
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single();

  if (currentProfile?.role !== 'admin') {
    return { success: false, error: 'No tienes permisos para eliminar usuarios' };
  }

  // Delete profile (this doesn't delete the auth user)
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Error al eliminar el usuario' };
  }

  revalidatePath('/admin/users');
  return { success: true };
}

// -----------------------------------------------------------------------------
// Get User Stats
// -----------------------------------------------------------------------------

export async function getUserStats(userId: string) {
  const supabase = await createClient();

  // Get transaction count for this user
  const { count: transactionCount } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get total sales for this user
  const { data: transactions } = await supabase
    .from('transactions')
    .select('total')
    .eq('user_id', userId)
    .eq('status', 'completed');

  const totalSales = transactions?.reduce((sum, t) => sum + (t.total || 0), 0) || 0;

  return {
    transactionCount: transactionCount || 0,
    totalSales,
  };
}

