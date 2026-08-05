import { Response } from 'express';
import { EventEmitter } from 'events';

class SseBroadcaster extends EventEmitter {}

export const sseEvents = new SseBroadcaster();

// Keep track of active SSE client connections
const clients: Set<Response> = new Set();

export function addSseClient(res: Response): void {
  clients.add(res);
  console.log(`[SSE] Client connected. Total clients: ${clients.size}`);

  res.on('close', () => {
    clients.delete(res);
    console.log(`[SSE] Client disconnected. Total clients: ${clients.size}`);
  });
}

export function broadcastSseEvent(event: string, data: any): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    res.write(payload);
  }
}
