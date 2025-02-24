import { Injectable } from "@angular/core";

import { Service } from "../service";
import { decode, getWS, latency } from "./services";

class NetworkQueue {
  private queue: Uint8Array[] = [];
  private sending: boolean = false;

  constructor(private socketSend: (data: Uint8Array) => any) {}

  public enqueue(data: Uint8Array) : void {
    this.queue.push(data);
    this.processQueue().then();
  }

  public enqueueImmediate(data: Uint8Array) : void {
    this.queue.splice(0, this.queue.length);
    this.enqueue(data);
  }

  private async processQueue() : Promise<void> {
    if (this.sending)
      return;

    this.sending = true;

    while (this.queue.length > 0) {
      const data = this.queue.shift();
      if (data)
        this.socketSend(data);

      await new Promise((resolve) => setTimeout(resolve, latency));
    }

    this.sending = false;
  }
}

@Injectable()
export class SocketService extends Service {
  private socket: WebSocket | undefined = undefined;
  public IsConnected() { return this.socket && this.socket.readyState === WebSocket.OPEN; }

  private queue: NetworkQueue = new NetworkQueue(this.send);

  constructor() {
    super();

    this.initialise();
  }

  public tryConnect(code: string, onOpen : () => any | null, onClose : (event: CloseEvent) => any | null, onError : () => any | null, onMessage : (event: MessageEvent) => any | null) : void {
    if (this.IsConnected())
      return;

    try {
      const ws = getWS(decode(code));
      console.log(ws);
      this.socket = new WebSocket(ws);

      this.socket.onopen = onOpen;
      this.socket.onclose = onClose;

      this.socket.onerror = onError;
      this.socket.onmessage = onMessage;
    }
    catch (e) {
      if(typeof e === "string")
        onClose(new CloseEvent("Failed to connect to local room:"));
      else if(e instanceof Error)
        onClose(new CloseEvent("Failed to connect to local room:" + e.message));
    }
  }

  public disconnect() : void {
    if(!this.IsConnected())
      return;

    this.socket?.close();
    this.socket = undefined;
  }

  public trySend(data: Uint8Array) : void {
    if(!this.IsConnected())
      return;

    this.queue.enqueue(data);
  }

  public trySendImmediate(data: Uint8Array) : void {
    if(!this.IsConnected())
      return;

    this.queue.enqueueImmediate(data);
  }

  private send(data: Uint8Array) : void {
    this.socket?.send(data);
  }
}
