import {Driver} from "homey";
import {SikomBasicAuthCredentials} from "../lib/sikom/credentials";
import SikomApiClient, {SikomDevice, SikomGateway} from "../lib/sikom/client";

export default async function onPairDevices(
    driver: Driver, session: any, api: SikomApiClient, types: Array<string>) {
    // Initialize credentials
    let credentials = new SikomBasicAuthCredentials(
        driver.homey.settings.get('username') || "",
        driver.homey.settings.get('password') || "",
    );

    session.setHandler("showView", async (viewId: string) => {
        // Skip login?
        if(viewId === 'loading') {
            if(credentials.isNotEmpty()) {
                driver.log('Credentials found, verifying...');
                const isValid = await api.verifyCredentials(credentials);
                const viewId = isValid ? "list_devices" : "login";
                driver.log(`Goto "${viewId}"`);
                await session.showView(viewId);
            } else {
                await session.nextView();
            }
        }
    });

    session.setHandler("login", async (data: any) => {
        credentials = new SikomBasicAuthCredentials(
            data.username, data.password,
        );
        const isValid = await api.verifyCredentials(credentials);
        if(isValid) {
            driver.homey.settings.set('username', credentials.username);
            driver.homey.settings.set('password', credentials.password);
        }
        return isValid;

    });

    session.setHandler("list_devices", async () => {
        let devices = <any>[];
        try {
            const gateways = await api.getGateways(credentials);

            devices = await Promise.all(
                gateways.map(
                    async (gateway: SikomGateway) => {
                        return await api.getDevices(types, gateway, credentials);
                    }
                )
            );
            return devices.flat().map((device: SikomDevice) => {
                return device.toDeviceData()
            });

        } catch (error) {
            driver.error(`Failed to get ${types.length === 0 ? 'all devices' : types}: ${error}`);
        }
        return devices;
    });
}