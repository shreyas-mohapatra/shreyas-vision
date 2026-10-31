import api from './axios.js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export async function getScanChat(scanId: string): Promise<{ messages: ChatMessage[] }> {
  const res = await api.get(`/scans/${scanId}/chat`);
  return res.data;
}

export async function sendChatMessage(scanId: string, message: string): Promise<{ reply: ChatMessage }> {
  const res = await api.post(`/scans/${scanId}/chat`, { message });
  return res.data;
}
