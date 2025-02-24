export abstract class Service {
  private initialised: boolean = false;

  IsInitialised() : boolean {
    return this.initialised;
  }

  protected initialise(): void {
    if(this.initialised) {
      return;
    }

    this.initialised = true;
  }
}
