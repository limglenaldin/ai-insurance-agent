"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/lib/types";
import { quickTemplates } from "@/lib/constants";
import { Menu, Trash2, Send } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

// Function to render message content with simple bold support
function renderMessageContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the ** markers and render as bold
      const boldText = part.slice(2, -2);
      return (
        <span key={index} className="font-medium">
          {boldText}
        </span>
      );
    }
    return part;
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("insurai_chat_history");
    
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages).map((msg: ChatMessage) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("insurai_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const savedProfile = localStorage.getItem("insurai_profile");
      const userProfile = savedProfile ? JSON.parse(savedProfile) : null;
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          profile: userProfile,
          conversationHistory: [...messages, userMessage], // Include current conversation + new message
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        citations: data.citations,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem("insurai_chat_history");
  };


  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={setIsSidebarOpen}
      >
        {/* Template Questions */}
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-gray-300 text-sm font-medium mb-3">Tanya Miria</h3>
            <div className="space-y-2 mb-4">
              {quickTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3 text-gray-300 hover:text-white hover:bg-gray-800 whitespace-normal text-sm"
                  onClick={() => handleSendMessage(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
            
            {/* Clear Chat Button */}
            <Button 
              variant="outline" 
              className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={handleClearChat}
              disabled={messages.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          </div>
        </div>
      </Sidebar>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Chat dengan Miria
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Asisten asuransi yang ramah dan berpengalaman
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-lg">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">M</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  Halo! Saya Miria 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Saya adalah asisten asuransi yang siap membantu Anda memahami produk asuransi dengan penjelasan yang mudah dipahami. Saya akan selalu memberikan informasi yang akurat berdasarkan dokumen resmi.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>Tips:</strong> Pilih pertanyaan dari sidebar kiri atau ketik pertanyaan Anda sendiri. Jangan ragu untuk menyapa saya dengan nama!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="max-w-4xl mx-auto">
                  <div className={`flex gap-2 sm:gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-lg p-3 sm:p-4 ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white ml-4 sm:ml-12' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white mr-4 sm:mr-12'
                      }`}>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {renderMessageContent(message.content)}
                        </div>
                        
                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
                            <p className="text-xs font-medium mb-2 opacity-75">Sumber:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.citations.map((citation, index) => (
                                <div key={index} className="text-xs bg-white/10 rounded px-2 py-1 inline-block">
                                  {citation.source ? (
                                    <a
                                      href={citation.source}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline cursor-pointer"
                                    >
                                      <span className="font-medium">{citation.docTitle}</span>
                                      {citation.section && (
                                        <span className="opacity-75 ml-1">• {citation.section}</span>
                                      )}
                                    </a>
                                  ) : (
                                    <>
                                      <span className="font-medium">{citation.docTitle}</span>
                                      {citation.section && (
                                        <span className="opacity-75 ml-1">• {citation.section}</span>
                                      )}
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs mt-3 opacity-75">
                          {message.timestamp.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="max-w-4xl mx-auto">
                  <div className="flex gap-2 sm:gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 sm:p-4 mr-4 sm:mr-12">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tanya Miria tentang asuransi..."
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSendMessage()} 
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Selalu verifikasi informasi penting dengan profesional asuransi berlisensi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}