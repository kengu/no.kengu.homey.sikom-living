import { SimpleClass } from 'homey';

import { SikomCredentials, SikomValueCodeCredentials, SikomBasicAuthCredentials } from './credentials';

const axios = require('axios');

class SikomGateway {

    /**
     * Gateway id
     */
    id: string;

    /**
     * Gateway name
     */
    name: string;

    constructor(id: string, name: string) {
      this.id = id;
      this.name = name;
    }

}

class SikomDevice {

    /**
     * Device id
     */
    id: string;

    /**
     * Device name
     */
    name: string;

    /**
     * Device data
     */
    data: any;

    constructor(id: string, name: string, data: any) {
      this.id = id;
      this.name = name;
      this.data = data;
    }

    toDeviceData(): any {
      return {
        name: this.name,
        data: {
          id: this.id,
          ...this.data,
        },
        store: {
          ...this.data,
        },
      };
    }

}

function whenType(types: Array<string>, device: any) {
  return types.length === 0
        || (device.device_model != null && types.includes(device.device_model.Value))
        || (device.product_code != null && types.includes(device.product_code.Value))
        || (device.vendor_type != null && types.includes(device.vendor_type.Value));
}

export default class SikomApiClient {

    logger: SimpleClass;

    constructor(logger: SimpleClass) {
      this.logger = logger;
    }

    async verifyCredentials(credentials: SikomCredentials): Promise<boolean> {
      try {
        const url = 'https://api.connome.com/api/VerifyCredentials';
        this.logger.log(`GET ${url}`);
        const credentialsAreValid = await axios.get(url, { auth: credentials.toAuth() });
        const isValid = credentialsAreValid.data.Data.scalar_result == 'True';
        this.logger.log(`Credentials are ${isValid ? 'valid' : 'invalid'}`);

        // return true to continue adding the device if the login succeeded
        // return false to indicate to the user the login attempt failed
        // thrown errors will also be shown to the user
        return isValid;
      } catch (error) {
        this.logger.error(`Verify credentials failed: ${error}`);
      }
      return false;
    }

    async getGateways(credentials: SikomCredentials): Promise<Array<SikomGateway>> {
      try {
        const url = 'https://api.connome.com/api/Gateway/All';
        this.logger.log(`GET ${url}`);
        const response = await axios.get(url, { auth: credentials.toAuth() });
        if (response.data.Data.bpapi_status == 'ok') {
          return response.data.Data.bpapi_array
            .map((item: any) => item.gateway.Controller.Properties.best_effort_name)
            .map((props: any) => new SikomGateway(props.GatewayId, props.Value));
        }
        this.logger.error(`Error: ${response.data.Data.bpapi_message}`);
      } catch (error) {
        this.logger.error(`Failed to get Sikom Gateways: ${error}`);
      }
      return [];
    }

    async getDevices(types: Array<string>, gateway: SikomGateway, credentials: SikomCredentials): Promise<SikomDevice[]> {
      try {
        const url = `https://api.connome.com/api/Device/All/${gateway.id}`;
        this.logger.log(`GET ${url} [${types}]`);
        const response = await axios.get(url, { auth: credentials.toAuth() });

        if (response.data.Data.bpapi_status == 'ok') {
          const devices = response.data.Data.bpapi_array
            .map((device: any) => device.device.Properties)
            .filter((device: any) => whenType(types, device))
            .map((device: any) => {
              const deviceProps = device.best_effort_name;
              const deviceType = device.device_type || device.vendor_type;
              return new SikomDevice(
                `${deviceType.Value}-${deviceProps.DeviceId}`,
                `${deviceProps.Value} (${gateway.name})`,
                {
                  meter_power: 100,
                  measure_power: 200,
                },
              );
            });

          this.logger.log(`Devices found: ${devices.length}`);

          return devices;
        }

        this.logger.error(`Error: ${response.data.Data.bpapi_message}`);
      } catch (error) {
        this.logger.error(`Failed to get Sikom Devices: ${error}`);
      }
      return [];
    }

}

export {
  SikomApiClient,
  SikomCredentials,
  SikomValueCodeCredentials,
  SikomBasicAuthCredentials,
  SikomGateway,
  SikomDevice,
};
