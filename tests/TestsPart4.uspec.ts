import { AxiosBasicCredentials, AxiosInstance, AxiosResponse } from "axios";
import * as Qs from "qs";
import ENV from "../util/env";
describe("WarehouseTests4", () => {
  let serviceUrl: string;
  let username: string;
  let password: string;
  let warehouse: string;
  let testRun: Number;
  let auth: AxiosBasicCredentials;
  let axios: AxiosInstance;

  beforeAll(() => {
    serviceUrl = ENV.SERVICE_URL;
    username = ENV.BASIC_AUTH_USERNAME;
    password = ENV.BASIC_AUTH_PASSWORD;
    warehouse = ENV.WAREHOUSE_ID;
    testRun = ENV.TEST_RUN;
    auth = { username, password };
  });

  it("GetShipmentStatus - 201 processing", async () => {
    const shipmentId: number = Number.parseInt(`1${testRun}`);
    const status = {
      "deliverrShipmentId": shipmentId,
      "status": "PROCESSING",
      "shippedPackages": []
    };
    const response: AxiosResponse = await axios.request({
      method: "get",
      url: serviceUrl,
      auth,
      params: `/shipment/${shipmentId}`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(201);
    expect(response.data).toEqual(status);
  });

  it("GetShipmentStatus - 201 shipped", async () => {
    const shipmentId: number = Number.parseInt(`2${testRun}`);
    const items = [{
      "dsku": "HELLOKITTY",
      "qty": 1
    }];
    const response: AxiosResponse = await axios.request({
      method: "get",
      url: serviceUrl,
      auth,
      params: `/shipment/${shipmentId}`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(201);
    expect(response.data.deliverrShipmentId).toEqual(shipmentId);
    expect(response.data.status).toEqual("SHIPPED");
    expect(response.data.shippedPackages[0].trackingNumber).toBeDefined();
    expect(response.data.shippedPackages[0].shippingMethod).toEqual("FEDEX.GROUND");
    expect(response.data.shippedPackages[0].actualWeight).toBeDefined();
    expect(response.data.shippedPackages[0].shipTime).toBeDefined();
    expect(response.data.shippedPackages[0].costInUSD).toBeDefined();
    expect(response.data.shippedPackages[0].items).toEqual(items);
  });

  it("GetShipmentStatus - 201 shipped", async () => {
    const shipmentId: number = Number.parseInt(`3${testRun}`);
    const items = [{
      "dsku": "HELLOKITTY",
      "qty": 1
    }];
    const response: AxiosResponse = await axios.request({
      method: "get",
      url: serviceUrl,
      auth,
      params: `/shipment/${shipmentId}`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(201);
    expect(response.data.deliverrShipmentId).toEqual(shipmentId);
    expect(response.data.status).toEqual("SHIPPED");
    expect(response.data.shippedPackages[0].trackingNumber).toBeDefined();
    expect(response.data.shippedPackages[0].shippingMethod).toEqual("FEDEX.HOME.DELIVERY");
    expect(response.data.shippedPackages[0].actualWeight).toBeDefined();
    expect(response.data.shippedPackages[0].shipTime).toBeDefined();
    expect(response.data.shippedPackages[0].costInUSD).toBeDefined();
    expect(response.data.shippedPackages[0].items).toEqual(items);
  });

  it("GetShipmentStatus - 201 warehouse cancelled", async () => {
    const shipmentId: number = Number.parseInt(`4${testRun}`);
    const response: AxiosResponse = await axios.request({
      method: "get",
      url: serviceUrl,
      auth,
      params: `/shipment/${shipmentId}`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(201);
    expect(response.data.deliverrShipmentId).toEqual(shipmentId);
    expect(response.data.status).toEqual("CANCELLED");
  });

  it("GetShipmentStatus - 201 api cancelled", async () => {
    const shipmentId: number = Number.parseInt(`5${testRun}`);
    const response: AxiosResponse = await axios.request({
      method: "get",
      url: serviceUrl,
      auth,
      params: `/shipment/${shipmentId}`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(201);
    expect(response.data.deliverrShipmentId).toEqual(shipmentId);
    expect(response.data.status).toEqual("CANCELLED");
  });

  it("GetInventoryStatus - 200", async () => {
    const expectedResponse = {
      sku: `HELLOKITTY${testRun}`,
      warehouse,
      inventoryOnHand: 2
    };
    const response: AxiosResponse = await axios.request({
      method: "get",
      url: serviceUrl,
      auth,
      params: `/inventory?sku=HELLOKITTY${testRun}&warehouse=${warehouse}`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(expectedResponse);
  });
});