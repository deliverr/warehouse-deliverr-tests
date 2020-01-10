import axios, { AxiosBasicCredentials, AxiosInstance, AxiosResponse } from "axios";
import { resolve } from "path"
import { config } from "dotenv"
config({ path: resolve(__dirname, "../.env") })
describe("WarehouseTests3", () => {
  let baseURL: string;
  let username: string;
  let password: string;
  let warehouse: string;
  let testRun: Number;
  let ax: AxiosInstance;

  beforeAll(() => {
    baseURL = process.env.SERVICE_URL || "";
    username = process.env.USERNAME || "";
    password = process.env.PASSWORD || "";
    warehouse = process.env.WAREHOUSE_ID || "";
    testRun = Number(process.env.TEST_RUN);
    ax = axios.create({ baseURL, auth: { username, password }, withCredentials: true, responseType: "json", headers: {"Accept":"application/json"}});
  });

  it("GetShipmentStatus - 201 processing", async () => {
    const shipmentId: number = Number.parseInt(`1${testRun}`);
    const status = {
      "deliverrShipmentId": shipmentId,
      "status": "PROCESSING",
      "shippedPackages": []
    };
    const res = await ax.request({
      method: "get",
      url: `/shipment/${shipmentId}`
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(201);
    expect(res.response.data).toEqual(status);
  });

  it("GetShipmentStatus - 201 shipped", async () => {
    const shipmentId: number = Number.parseInt(`2${testRun}`);
    const items = [{
      "dsku": "HELLOKITTY",
      "qty": 1
    }];
    const res = await ax.request({
      method: "get",
      url: `/shipment/${shipmentId}`
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(201);
    expect(res.response.data.deliverrShipmentId).toEqual(shipmentId);
    expect(res.response.data.status).toEqual("SHIPPED");
    expect(res.response.data.shippedPackages[0].trackingNumber).toBeDefined();
    expect(res.response.data.shippedPackages[0].shippingMethod).toEqual("FEDEX.GROUND");
    expect(res.response.data.shippedPackages[0].actualWeight).toBeDefined();
    expect(res.response.data.shippedPackages[0].shipTime).toBeDefined();
    expect(res.response.data.shippedPackages[0].costInUSD).toBeDefined();
    expect(res.response.data.shippedPackages[0].items).toEqual(items);
  });

  it("GetShipmentStatus - 201 shipped", async () => {
    const shipmentId: number = Number.parseInt(`3${testRun}`);
    const items = [{
      "dsku": "HELLOKITTY",
      "qty": 1
    }];
    const res = await ax.request({
      method: "get",
      url: `/shipment/${shipmentId}`
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(201);
    expect(res.response.data.deliverrShipmentId).toEqual(shipmentId);
    expect(res.response.data.status).toEqual("SHIPPED");
    expect(res.response.data.shippedPackages[0].trackingNumber).toBeDefined();
    expect(res.response.data.shippedPackages[0].shippingMethod).toEqual("FEDEX.HOME.DELIVERY");
    expect(res.response.data.shippedPackages[0].actualWeight).toBeDefined();
    expect(res.response.data.shippedPackages[0].shipTime).toBeDefined();
    expect(res.response.data.shippedPackages[0].costInUSD).toBeDefined();
    expect(res.response.data.shippedPackages[0].items).toEqual(items);
  });

  it("GetShipmentStatus - 201 warehouse cancelled", async () => {
    const shipmentId: number = Number.parseInt(`4${testRun}`);
    const res = await ax.request({
      method: "get",
      url: `/shipment/${shipmentId}`
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(201);
    expect(res.response.data.deliverrShipmentId).toEqual(shipmentId);
    expect(res.response.data.status).toEqual("CANCELLED");
  });

  it("GetShipmentStatus - 201 api cancelled", async () => {
    const shipmentId: number = Number.parseInt(`5${testRun}`);
    const res = await ax.request({
      method: "get",
      url: `/shipment/${shipmentId}`
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(201);
    expect(res.response.data.deliverrShipmentId).toEqual(shipmentId);
    expect(res.response.data.status).toEqual("CANCELLED");
  });

  it("GetInventoryStatus - 200", async () => {
    const expectedResponse = {
      sku: `HELLOKITTY${testRun}`,
      warehouse,
      inventoryOnHand: 2
    };
    const res = await ax.request({
      method: "get",
      url: `/inventory?sku=HELLOKITTY${testRun}&warehouse=${warehouse}`
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(200);
    expect(res.response.data).toEqual(expectedResponse);
  });
});