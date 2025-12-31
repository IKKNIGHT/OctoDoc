const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface CreatePasteRequest {
  encryptedContent: string;
  iv: string;
  burnAfterReading?: boolean;
  expiresIn?: string;
}

export interface CreatePasteResponse {
  id: string;
}

export interface GetPasteResponse {
  encryptedContent: string;
  iv: string;
  burnAfterReading: boolean;
}

export async function createPaste(data: CreatePasteRequest): Promise<CreatePasteResponse> {
  const response = await fetch(`${API_URL}/api/pastes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create paste');
  }

  return response.json();
}

export async function getPaste(id: string): Promise<GetPasteResponse> {
  const response = await fetch(`${API_URL}/api/pastes/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch paste');
  }

  return response.json();
}
