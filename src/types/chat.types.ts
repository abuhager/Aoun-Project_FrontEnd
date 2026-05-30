export interface ChatMessage {
  _id: string;
  sender: string;
  senderName?: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface ConversationInfo {
  _id: string;
  participants: string[];
}