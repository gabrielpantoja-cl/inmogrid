// Barrel público del feature `chat` (Sofia).

export { default as Chatbot } from './components/Chatbot';
export { faqs, SOFIA_SYSTEM_PROMPT } from './lib/faqs';
export { saveUserMessage, saveBotMessage } from './lib/persistence';
