import { Injectable } from "@angular/core";
import { AlertController } from "@ionic/angular";

import { Service } from "../service";

@Injectable()
export class WidgetService extends Service
{
  constructor(private readonly alertController: AlertController) {
    super();

    this.initialise();
  }

  public async presentMessage(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['Close'],
    });

    await alert.present();
  }
}
