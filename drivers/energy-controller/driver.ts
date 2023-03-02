import Homey from 'homey';

import SikomApiClient from '../../lib/sikom/client';
import onPairDevices from "../helpers";

class EnergyControllerDriver extends Homey.Driver {
  private api: SikomApiClient = new SikomApiClient(this);

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('EnergyControllerDriver has been initialized');
  }

  async onPair(session: any){
    return onPairDevices(
        this, session, this.api, ['ECOEnergyController'],
    );
  }

}

module.exports = EnergyControllerDriver;
