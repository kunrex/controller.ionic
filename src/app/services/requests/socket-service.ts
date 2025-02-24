import { Injectable } from "@angular/core";

import { Service} from "../service";
import { decode, getWS, latency } from "./services";

import { SoundEnum } from "../../enums/sound-enum";

import { SoundService } from "../sounds/sound-service";
import { WidgetService } from "../widgets/widget-service";

class NetworkQueue {
  private queue: Uint8Array[] = [];
  private sending: boolean = false;

  constructor(private socketSend: (data: Uint8Array) => any) {}

  public enqueue(data: Uint8Array) : void {
    this.queue.push(data);
    this.processQueue().then();
  }

  public enqueueImmediate(data: Uint8Array) : void {
    this.queue.splice(0, 0, data)
  }

  private async processQueue() : Promise<void> {
    if (this.sending) return;

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

  constructor(private readonly widget: WidgetService, private readonly sounds: SoundService) {
    super();

    this.initialise();
  }

  public tryConnect(code: string, onOpen : any | null) : void {
    if (this.IsConnected())
      return;

    try {
      const ws = getWS(decode(code));
      console.log(ws);
      this.socket = new WebSocket(ws);

      this.socket.onopen = onOpen;

      this.socket.onclose = () => { this.onConnectionClose(); };
      this.socket.onerror = (e) => { this.onConnectionError(e) };
      this.socket.onmessage = (e) => { this.onConnectionMessage(e); };
    }
    catch (e) {
      if(typeof e === "string")
        this.onConnectionError("Failed to connect to local room:" + e);
      else if(e instanceof Error)
        this.onConnectionError("Failed to connect to local room:" + e.message);
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

  private onConnectionClose() : void {
    console.log('Connection closed');
  }

  private onConnectionError(error : any) : void {
    this.sounds.playSound(SoundEnum.Error).then(() => this.widget.presentMessage("Something went wrong...", error));
  }

  private onConnectionMessage(message: any) : void {
    this.sounds.playSound(SoundEnum.Alert).then(() => this.widget.presentMessage("Hold up...", message));
  }
}
