// components/ui/common/Chatbot.tsx
"use client";

import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useChat } from 'ai/react';
import { Message } from 'ai';

interface ChatbotProps {
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat'
  });

  if (error) {
    console.error("Error from useChat:", error);
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <h3 className="font-semibold">Asistente Virtual</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-primary/80 rounded-full transition-colors"
          aria-label="Cerrar chat"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-4">
            ¿En qué puedo ayudarte hoy?
          </div>
        )}
        {messages.map((msg: Message) => (
          <div
            key={msg.id}
            className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user'
                ? 'ml-auto bg-accent text-accent-foreground'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {msg.content.split('\n').map((line: string, i: number) => (
              <span key={i}>{line}<br/></span>
            ))}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-[80%] animate-pulse">
            Escribiendo...
          </div>
        )}
        {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg max-w-[80%]">
                Lo siento, ocurrió un error: {error.message}
            </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Escribe tu mensaje..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`p-2 rounded-lg ${
              isLoading || !input.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 active:bg-primary/80'
            } text-primary-foreground transition-colors`}
            aria-label="Enviar mensaje"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;