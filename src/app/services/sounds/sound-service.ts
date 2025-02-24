import { Injectable } from "@angular/core";
import { NativeAudio } from '@capgo/native-audio';

import { SoundEnum } from "../../enums/sound-enum";

import { Service } from "../service";

@Injectable()
export class SoundService extends Service {
  constructor() {
    super();
  }

  public async initialiseSoundAffects() : Promise<void> {
    if(this.IsInitialised()) {
      return;
    }

    const values = Object.values(SoundEnum);

    try {
      for(let i: number = 0; i < values.length; i++) {
        await NativeAudio.preload({
          assetId: values[i],
          assetPath: "assets/sounds/" + values[i] + ".mp3",

          isUrl: false,
          audioChannelNum: 1
        });
      }

      this.initialise();
    }
    catch(e) {
      if(typeof e === "string")
        console.log("ERROR DURING AUDIO READ:" + e);
      else if(e instanceof Error)
        console.log("ERROR DURING AUDIO READ:" + e.message);
    }
  }

  public async playSound(sound: SoundEnum) : Promise<void> {
    if(!this.IsInitialised()) {
      return;
    }

    await NativeAudio.play({
      assetId: sound,
      time: 0
    });
  }
}
