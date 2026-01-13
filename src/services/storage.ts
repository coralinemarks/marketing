import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedPlan } from '../types/savedPlan';

const KEY = 'marketing_plans_v1';

export async function loadSavedPlans(): Promise<SavedPlan[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedPlan[];
  } catch {
    return [];
  }
}

export async function savePlans(plans: SavedPlan[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(plans));
}

export async function addSavedPlan(plan: SavedPlan): Promise<SavedPlan[]> {
  const existing = await loadSavedPlans();
  const next = [plan, ...existing].slice(0, 20);
  await savePlans(next);
  return next;
}

export async function deleteSavedPlan(id: string): Promise<SavedPlan[]> {
  const existing = await loadSavedPlans();
  const next = existing.filter((p) => p.id !== id);
  await savePlans(next);
  return next;
}

