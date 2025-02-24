import {Router} from "@angular/router";
import {Injectable, NgZone} from "@angular/core";
import {Preferences} from '@capacitor/preferences';

import {PageEnum} from "../enums/page-enum";

import {Service} from "./service";
import {SoundService} from "./sounds/sound-service"
import {SocketService} from "./requests/socket-service";

const name: string = "name";

@Injectable()
export class AppFlowService extends Service {
  current: PageEnum = PageEnum.Splashscreen;

  userName: string = "";
  public Username() : string { return this.userName; }

  constructor(private readonly ngZone: NgZone, private readonly router: Router, private readonly sounds: SoundService, private readonly socket: SocketService) {
    super();
  }

  public async loadApplication() : Promise<void> {
    if(this.IsInitialised())
      return;

    const { value } = await Preferences.get( { key: name });
    if(value != null)
      this.userName = value;

    await this.sounds.initialiseSoundAffects();

    this.initialise();
    this.navigate(PageEnum.Join);
  }

  public async tryJoinRoom(code: string) : Promise<void> {
    if(this.current != PageEnum.Join)
      return;

    this.socket.tryConnect(code, () => {
      this.navigate(PageEnum.Controller);
    });
  }

  public async leaveRoom() : Promise<void> {
    if(this.current != PageEnum.Controller)
      return;

    this.socket.disconnect();
    this.navigate(PageEnum.Join);
  }

  public async getUsername() : Promise<string | null> {
    const { value } = await Preferences.get( { key: name });
    return value;
  }

  public async setUsername(value: string) : Promise<void> {
    this.userName = value;

    await Preferences.set({
      key: name,
      value: value
    });
  }

  private navigate(page: PageEnum) : void {
    if(this.current != page) {
      this.ngZone.run(async () => {
        this.current = page;
        await this.router.navigateByUrl('/' + page);
      }).then();
    }
  }
}
