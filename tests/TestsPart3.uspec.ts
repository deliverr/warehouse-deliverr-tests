jest.setTimeout(90000); //Setting a higher timeout value for jest is important otherwise it times out before tests are complete.
import axios, { AxiosInstance } from "axios"; // Removed Unused imports. Nodejs in strict mode generates warnings for unused imports.
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
    username = process.env.APIUSER || ""; //See .env file for explanation
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

    // In case of success, res object from axios request does not have a response property.
    expect(res.status).toEqual(201);
    expect(res.data).toEqual(status);
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

    expect(res.status).toEqual(201);
    expect(res.data).toEqual(status);
  });


  it("GetShipmentStatus - 201 shipped", async () => {
    const shipmentId: number = Number.parseInt(`2${testRun}`);
    const items = [{
      "sku": `HELLOKITTY${testRun}`,
      "quantity": 1
    }];
    const res = await ax.request({
      method: "get",
      url: `/shipment/${shipmentId}`
    }).then(res => res)
      .catch(e => e);

    expect(res.status).toEqual(201);
    expect(res.data.deliverrShipmentId).toEqual(shipmentId);
    expect(res.data.status).toEqual("SHIPPED");
    expect(res.data.shippedPackages[0].trackingNumber).toBeDefined();
    expect(res.data.shippedPackages[0].shippingMethod).toEqual("FEDEX.GROUND");
    expect(res.data.shippedPackages[0].actualWeight).toBeDefined();
    expect(res.data.shippedPackages[0].shipTime).toBeDefined();
    expect(res.data.shippedPackages[0].costInUSD).toBeDefined();
    expect(res.data.shippedPackages[0].items).toEqual(items);
  });

  it("GetShipmentStatus - 201 shipped", async () => {			//@NOTE for shipped, status in shipments-table must be 1, so need to set before run this
    const shipmentId: number = Number.parseInt(`3${testRun}`);
    const items = [{
      "sku": `HELLOKITTY${testRun}`,//property name is 'sku' not 'dsku'. testRun value must be appended since that was passed in when Item was created.
      "quantity": 1//Property name when saving shipment is 'quantity' not 'qty'.
    }];
    const res = await ax.request({
      method: "get",
      url: `/shipment/${shipmentId}`
    }).then(res => res)
      .catch(e => e);

    // In case of success, res object from axios request does not have a response property.
    expect(res.status).toEqual(201);
    expect(res.data.deliverrShipmentId).toEqual(shipmentId);
    expect(res.data.status).toEqual("SHIPPED");
    expect(res.data.shippedPackages[0].trackingNumber).toBeDefined();
    expect(res.data.shippedPackages[0].shippingMethod).toEqual("FEDEX.HOME.DELIVERY");
    expect(res.data.shippedPackages[0].actualWeight).toBeDefined();
    expect(res.data.shippedPackages[0].shipTime).toBeDefined();
    expect(res.data.shippedPackages[0].costInUSD).toBeDefined();
    expect(res.data.shippedPackages[0].items).toEqual(items);
  });

  it("GetShipmentStatus - 201 warehouse cancelled", async () => {	//@NOTE for cancelled, status in shipments-table must be 2, so need to set before run this
    const shipmentId: number = Number.parseInt(`4${testRun}`);
    const res = await ax.request({
      method: "get",
      url: `/shipment/${shipmentId}`
    }).then(res => res)
      .catch(e => e);

    // In case of success, res object from axios request does not have a response property.
    expect(res.status).toEqual(201);
    expect(res.data.deliverrShipmentId).toEqual(shipmentId);
    expect(res.data.status).toEqual("CANCELLED");
  });

  it("GetShipmentStatus - 201 api cancelled", async () => {
    const shipmentId: number = Number.parseInt(`5${testRun}`);
    const res = await ax.request({
      method: "get",
      url: `/shipment/${shipmentId}`
    }).then(res => res)
      .catch(e => e);

    // In case of success, res object from axios request does not have a response property.
    expect(res.status).toEqual(201);
    expect(res.data.deliverrShipmentId).toEqual(shipmentId);
    expect(res.data.status).toEqual("CANCELLED");
  });

  it("GetInventoryStatus - 200", async () => {	//@NOTE need to update system before this
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

    // In case of success, res object from axios request does not have a response property.
    expect(res.status).toEqual(200);
    expect(res.data).toEqual(expectedResponse);
  });
});