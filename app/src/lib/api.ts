import type { KnowledgeSource, Overview, Recipe, WorkflowJob } from '@/lib/types';
import { getToken } from './auth';

const BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
  : '';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const url = `${BASE_URL}${path}`;
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }
    const body = await response.text();
    throw new Error(`API error ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

export function getOverview(): Promise<Overview> {
  return apiFetch<Overview>('/api/overview');
}

export function getRecipes(): Promise<Recipe[]> {
  return apiFetch<Recipe[]>('/api/recipes');
}

export function getRecipe(id: number): Promise<Recipe> {
  return apiFetch<Recipe>(`/api/recipes/${id}`);
}

export function createRecipe(payload: Partial<Recipe>): Promise<Recipe> {
  return apiFetch<Recipe>('/api/recipes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateRecipe(id: number, payload: Partial<Recipe>): Promise<Recipe> {
  return apiFetch<Recipe>(`/api/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function exportRecipe(id: number): void {
  const token = getToken();
  const url = `${BASE_URL}/api/recipes/${id}/export`;
  
  // Use fetch to download the file so we can pass auth header
  fetch(url, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  })
  .then(response => response.blob())
  .then(blob => {
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.download = `recipe_${id}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
  })
  .catch(console.error);
}

export function deleteRecipe(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/recipes/${id}`, {
    method: 'DELETE',
  });
}

export function getKnowledge(): Promise<KnowledgeSource[]> {
  return apiFetch<KnowledgeSource[]>('/api/knowledge');
}

export async function publishModel(modelId: number): Promise<any> {
  return apiFetch(`/api/models/${modelId}/publish`, {
    method: 'POST',
  });
}

export function getJobs(): Promise<WorkflowJob[]> {
  return apiFetch<WorkflowJob[]>('/api/jobs');
}

export function getJob(id: number): Promise<WorkflowJob> {
  return apiFetch<WorkflowJob>(`/api/jobs/${id}`);
}

export function createJob(payload: {
  objective: string;
}): Promise<WorkflowJob> {
  return apiFetch<WorkflowJob>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateJob(id: number, payload: Partial<WorkflowJob>): Promise<WorkflowJob> {
  return apiFetch<WorkflowJob>(`/api/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function getDatasets(): Promise<Array<{ id: number; name: string; source: string; token_count: number; quality: string }>> {
  return apiFetch('/api/datasets');
}

export function createDataset(payload: { name: string; source: string; token_count: number }): Promise<{ id: number }> {
  return apiFetch('/api/datasets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function uploadDataset(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiFetch('/api/datasets/upload', {
    method: 'POST',
    body: formData,
  });
}

export function generateHFPreview(payload: {
  model: string;
  prompt: string;
}): Promise<{ output: string }> {
  return apiFetch<{ output: string }>('/api/hf/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
