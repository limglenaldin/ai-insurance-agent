import { UserProfile, ChatMessage } from "./types";
import { STORAGE_KEYS } from "./constants";
import { createLogger } from "./logger";

const log = createLogger('local-storage');

export class LocalStorageManager {
  private static isClient = typeof window !== "undefined";

  // Profile management
  static saveProfile(profile: UserProfile): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (error) {
      log.error({ err: error }, "Failed to save profile to localStorage");
    }
  }

  static getProfile(): UserProfile | null {
    if (!this.isClient) return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      log.error({ err: error }, "Failed to get profile from localStorage");
      return null;
    }
  }

  static clearProfile(): void {
    if (!this.isClient) return;
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    } catch (error) {
      log.error({ err: error }, "Failed to clear profile from localStorage");
    }
  }

  // Chat history management
  static saveChatHistory(messages: ChatMessage[]): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    } catch (error) {
      log.error({ err: error }, "Failed to save chat history to localStorage");
    }
  }

  static getChatHistory(): ChatMessage[] {
    if (!this.isClient) return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      if (!saved) return [];

      const parsed = JSON.parse(saved);
      return parsed.map((msg: ChatMessage) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      log.error({ err: error }, "Failed to get chat history from localStorage");
      return [];
    }
  }

  static clearChatHistory(): void {
    if (!this.isClient) return;
    try {
      localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    } catch (error) {
      log.error({ err: error }, "Failed to clear chat history from localStorage");
    }
  }

  static addMessageToChatHistory(message: ChatMessage): void {
    const currentHistory = this.getChatHistory();
    const updatedHistory = [...currentHistory, message];
    this.saveChatHistory(updatedHistory);
  }

  // Clear all data
  static clearAllData(): void {
    this.clearProfile();
    this.clearChatHistory();
  }

  // Check if user has completed profile setup
  static hasProfile(): boolean {
    const profile = this.getProfile();
    return (
      profile !== null &&
      profile.vehicleType !== "" &&
      profile.city !== "" &&
      profile.usageType !== ""
    );
  }

  // Get storage size info
  static getStorageInfo(): { used: number; available: number } {
    if (!this.isClient) return { used: 0, available: 0 };

    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith("insurai_")) {
          used += localStorage.getItem(key)!.length;
        }
      }

      // Rough estimate of localStorage limit (most browsers: 5-10MB)
      const available = 5 * 1024 * 1024; // 5MB

      return { used, available };
    } catch (error) {
      log.error({ err: error }, "Failed to get storage info");
      return { used: 0, available: 0 };
    }
  }

  // Export data for backup/transfer
  static exportData(): string {
    const profile = this.getProfile();
    const chatHistory = this.getChatHistory();

    return JSON.stringify(
      {
        profile,
        chatHistory,
        exportDate: new Date().toISOString(),
        version: "1.0",
      },
      null,
      2
    );
  }

  // Import data from backup
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.profile) {
        this.saveProfile(data.profile);
      }

      if (data.chatHistory && Array.isArray(data.chatHistory)) {
        const messages = data.chatHistory.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        this.saveChatHistory(messages);
      }

      return true;
    } catch (error) {
      log.error({ err: error }, "Failed to import data");
      return false;
    }
  }
}

// Hook for React components
export function useLocalStorage() {
  return {
    profile: {
      save: LocalStorageManager.saveProfile,
      get: LocalStorageManager.getProfile,
      clear: LocalStorageManager.clearProfile,
      has: LocalStorageManager.hasProfile,
    },
    chatHistory: {
      save: LocalStorageManager.saveChatHistory,
      get: LocalStorageManager.getChatHistory,
      clear: LocalStorageManager.clearChatHistory,
      add: LocalStorageManager.addMessageToChatHistory,
    },
    utils: {
      clearAll: LocalStorageManager.clearAllData,
      getInfo: LocalStorageManager.getStorageInfo,
      export: LocalStorageManager.exportData,
      import: LocalStorageManager.importData,
    },
  };
}
