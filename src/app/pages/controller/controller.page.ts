import { Component, type ElementRef, NgZone, type OnInit, ViewChild } from "@angular/core"
import { GestureController } from "@ionic/angular"

import { SoundEnum } from "../../enums/sound-enum";

import { SoundService } from "../../services/sounds/sound-service";
import { WidgetService } from "../../services/widgets/widget-service";
import { SocketService } from "../../services/requests/socket-service";

@Component({
  standalone: false,
  selector: 'app-controller',
  templateUrl: './controller.page.html',
  styleUrls: ['./controller.page.scss'],
})
export class ControllerPage implements OnInit {

  @ViewChild("leftStick", { static: true }) leftStickRef!: ElementRef
  @ViewChild("rightStick", { static: true }) rightStickRef!: ElementRef

  letterState: number = 0;
  directionState: number = 0;

  leftStickPosition = { x: 0, y: 0 }
  rightStickPosition = { x: 0, y: 0 }
  activeStick: "left" | "right" | null = null

  constructor(private readonly gestureCtrl: GestureController, private readonly ngZone: NgZone, private readonly socket: SocketService, private readonly sounds: SoundService, private readonly widgets: WidgetService) { }

  public ngOnInit() : void {
    this.initializeJoystickGestures(this.leftStickRef);
    this.initializeJoystickGestures(this.rightStickRef);
  }

  private initializeJoystickGestures(elementRef: ElementRef) : void {
    const gesture = this.gestureCtrl.create({
      el: elementRef.nativeElement,
      threshold: 0,
      gestureName: "joystick-move",
      onMove: (ev) => this.handleStickMove(ev),
    });

    gesture.enable();
  }

  private handleStickMove(event: any) {
    const stickRef = this.activeStick === "left" ? this.leftStickRef : this.rightStickRef;
    const rect = stickRef.nativeElement.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let x = (event.currentX - centerX) / (rect.width / 2);
    let y = (event.currentY - centerY) / (rect.height / 2);

    const magnitude = Math.sqrt(x * x + y * y);
    x /= magnitude;
    y /= magnitude;

    this.ngZone.run(() => {
      if (this.activeStick === "left")
        this.leftStickPosition = { x, y };
      else
        this.rightStickPosition = { x, y };

      this.socket.trySend(this.getControllerData());
    });
  }

  public handleStickSelect(stick: "left" | "right") : void {
    this.activeStick = stick;
  }

  public handleStickRelease(stick: "left" | "right") {
    if (stick === "left")
      this.leftStickPosition = { x: 0, y: 0 };
    else
      this.rightStickPosition = { x: 0, y: 0 };

    this.socket.trySend(this.getControllerData());
  }

  public onLetterButton(button: number) : void {
    this.letterState ^= (1 << button);
    this.socket.trySendImmediate(this.getControllerData());
  }

  public onDirectionButton(button: number) : void {
    this.directionState ^= (1 << button);
    this.socket.trySendImmediate(this.getControllerData());
  }

  public More() : void {
    this.sounds.playSound(SoundEnum.Click).then(async () => {
      let result = await this.widgets.presentLeaveChoice();
      if(result)
        this.socket.disconnect();
    });
  }

  private getControllerData() : Uint8Array {
    const bytes = new Uint8Array(20);
    const view = new DataView(bytes.buffer);

    view.setFloat32(0, this.rightStickPosition.x, true);
    view.setFloat32(4, this.rightStickPosition.y, true);
    view.setFloat32(8, this.leftStickPosition.x, true);
    view.setFloat32(12, this.leftStickPosition.y, true);

    view.setInt16(16, this.letterState, true);
    view.setInt16(18, this.directionState, true);

    return bytes;
  }
}
