import { Client, Message as StompMessage } from '@stomp/stompjs';
import type { Message } from '../types';

class WebSocketService {
  private client: Client | null = null;
  private messageHandlers: ((message: Message) => void)[] = [];

  constructor() {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('Connected to WebSocket');
      this.subscribeToMessages();
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error', frame);
    };

    this.client.activate();
  }

  private subscribeToMessages(): void {
    if (!this.client?.connected) return;

    this.client.subscribe('/topic/messages', (message: StompMessage) => {
      const receivedMessage = JSON.parse(message.body) as Message;
      this.messageHandlers.forEach((handler) => handler(receivedMessage));
    });
  }

  public sendMessage(message: Partial<Message>): void {
    if (!this.client?.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat',
      body: JSON.stringify(message),
    });
  }

  public onMessage(handler: (message: Message) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  public disconnect(): void {
    this.client?.deactivate();
  }
}

export const webSocketService = new WebSocketService();