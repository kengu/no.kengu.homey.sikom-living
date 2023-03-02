import Homey from 'homey';

class SikomLivingApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('SikomLivingApp has been initialized');
  }

}

module.exports = SikomLivingApp;
