const DEFAULT_API_BASE_URL = 'https://muv1yg4vth.execute-api.us-east-1.amazonaws.com/prod';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

function unwrapApiPayload(payload) {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (error) {
      return payload;
    }
  }

  if (payload && typeof payload === 'object' && typeof payload.body === 'string') {
    try {
      return JSON.parse(payload.body);
    } catch (error) {
      return payload.body;
    }
  }

  return payload;
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const rawData = contentType.includes('application/json')
    ? await response.json()
    : await response.text();
  const data = unwrapApiPayload(rawData);

  if (!response.ok) {
    const message =
      (typeof data === 'object' && data && data.message) || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function submitApplication(applicationData) {
  return request('/applications', {
    method: 'POST',
    body: JSON.stringify(applicationData),
  });
}

export async function getApplication(applicationId) {
  return request(`/applications/${encodeURIComponent(applicationId)}`);
}
