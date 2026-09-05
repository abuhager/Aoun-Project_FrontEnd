export interface ChatDrawerProps {
  conversationId: string;
  itemTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export interface ChatPanelProps {
  conversationId: string;
  itemTitle: string;
  participantName?: string;
  participantAvatar?: string;
  onClose: () => void;
  onBack?: () => void;
  showClose?: boolean;
}
