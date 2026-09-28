import apiClient from './apiClient';

export const aiService = {
  async askAssistant(message, conversationHistory = []) {
    const res = await apiClient.post('/ai/chat', { message, conversationHistory });
    return res;
  },
};

export default aiService;
