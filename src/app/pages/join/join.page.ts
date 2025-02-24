import {Component, OnDestroy, OnInit} from '@angular/core';

import { SoundEnum } from "../../enums/sound-enum";

import { AppFlowService } from "../../services/app-flow-service";
import { SoundService } from "../../services/sounds/sound-service";

@Component({
  standalone: false,
  selector: 'app-join',
  templateUrl: './join.page.html',
  styleUrls: ['./join.page.scss'],
})
export class JoinPage implements OnInit, OnDestroy {
  username: string = "";
  roomCode: string = "";

  public IsDisabled() : boolean { return this.username == "" || this.roomCode == "" /*|| !/^[a-zA-Z]+$/.test(this.roomCode);*/ }

  constructor(private readonly appFlow: AppFlowService, private readonly sounds: SoundService) {
    appFlow.getUsername().then(x => {
      this.username = x == null ? "" : x;
    });
  }

  public ngOnInit() : void { }

  public joinRoom() : void {
    this.playClick();
    this.appFlow.setUsername(this.username).then(() => this.appFlow.tryJoinRoom(this.roomCode));
  }

  public playClick() : void {
    this.sounds.playSound(SoundEnum.Click).then();
  }

  public ngOnDestroy() : void {
    if(this.username != "")
      this.appFlow.setUsername(this.username).then();
  }
}
