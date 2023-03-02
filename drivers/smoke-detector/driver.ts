import Homey from 'homey';
import onPairDevices from "../helpers";
import SikomApiClient from "../../lib/sikom/client";

class SmokeDetectorDriver extends Homey.Driver {
  private api: SikomApiClient = new SikomApiClient(this);
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('SmokeDetectorDriver has been initialized');
  }

  async onPair(session: any){
    return onPairDevices(
        this, session, this.api, ['ECOSmokeDetector'],
    );
  }

}

module.exports = SmokeDetectorDriver;
