import { Component, OnInit } from '@angular/core';

import { AppFlowService } from "../../services/app-flow-service";

@Component({
  standalone: false,
  selector: 'app-splashscreen',
  templateUrl: './splashscreen.page.html',
  styleUrls: ['./splashscreen.page.scss'],
})
export class SplashscreenPage implements OnInit {
  constructor(private readonly appFlow: AppFlowService) { }

  async ngOnInit() : Promise<void> {
    await this.appFlow.loadApplication();
  }
}
