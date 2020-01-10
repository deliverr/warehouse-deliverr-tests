import axios, { AxiosBasicCredentials, AxiosInstance, AxiosResponse } from "axios";
import * as moment from "moment";

import { resolve } from "path"
import { config } from "dotenv"
config({ path: resolve(__dirname, "../.env") })
describe("WarehouseTests2", () => {
  let baseURL: string;
  let username: string;
  let password: string;
  let warehouse: string;
  let testRun: Number;
  let ax: AxiosInstance;
  let currentDate: string;

  beforeAll(() => {
    baseURL = process.env.SERVICE_URL || "";
    username = process.env.USERNAME || "";
    password = process.env.PASSWORD || "";
    warehouse = process.env.WAREHOUSE_ID || "";
    testRun = Number(process.env.TEST_RUN);
    ax = axios.create({ baseURL, auth: { username, password }, withCredentials: true, responseType: "json", headers: {"Accept":"application/json"}});
    currentDate = moment().format("YYYY-MM-DDTHH:mm:ssZ");
  });

  it("GetAsnStatus - 200 qty 1 unreceived", async () => {
    const asnId: number = Number.parseInt(`1${testRun}`);
    const asn = {
      "deliverrAsnId": asnId,
      "createdDate": currentDate,
      "expectedDate": null,
      "shipToWarehouse": warehouse,
      "notes": "",
      "items": [
        {
          "sku": `HELLOKITTY${currentDate}`,
          "quantityExpected": 1,
          "quantityReceived": 0,
          "quantityStocked": 0
        }
      ]
    }
    const res = await ax.request({
      method: "get",
      url: `/asn`
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(200);
    expect(res.response.data).toEqual(asn);
  });

  it("GetAsnStatus - 200 qty 10 partially received", async () => {
    const asnId: number = Number.parseInt(`10${testRun}`);
    const asn = {
      "deliverrAsnId": asnId,
      "createdDate": currentDate,
      "expectedDate": null,
      "shipToWarehouse": warehouse,
      "notes": "",
      "items": [
        {
          "sku": `HELLOKITTY${currentDate}`,
          "quantityExpected": 10,
          "quantityReceived": 5,
          "quantityStocked": 5
        }
      ]
    }
    const res = await ax.request({
      method: "get",
      url: `/asn`,
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(200);
    expect(res.response.data).toEqual(asn);
  });

  it("GetAsnStatus - 200 qty 5 fully received", async () => {
    const asnId: number = Number.parseInt(`5${testRun}`);
    const asn = {
      "deliverrAsnId": asnId,
      "items": [
        {
          "sku": `HELLOKITTY${currentDate}`,
          "quantityExpected": 5,
          "quantityReceived": 5,
          "quantityStocked": 5
        }
      ]
    }
    const res = await ax.request({
      method: "get",
      url: `/asn`,
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(200);
    expect(res.response.data).toEqual(asn);
  });

  it("GetInventoryStatus - 200", async () => {
    const expectedResponse = {
      sku: `HELLOKITTY${testRun}`,
      warehouse,
      inventoryOnHand: 10
    };
    const res = await ax.request({
      method: "get",
      url: `/inventory?sku=HELLOKITTY${testRun}&warehouse=${warehouse}`,
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(200);
    expect(res.response.data).toEqual(expectedResponse);
  });

  it("GetInventoryMovements - 200", async () => {
    const res = await ax.request({
      method: "get",
      url: `/inventory/movements?warehouse=${warehouse}&fromTime=${moment(currentDate).subtract(3, 
        "hours").format("YYYY-MM-DDTHH:mm:ssZ")}&toTime=${moment(currentDate).format("YYYY-MM-DDTHH:mm:ssZ")}`,
    }).then(res => res)
      .catch(e => e);
    const helloKittyReceives = res.response.data.filter((data: any) => data.movementType === "RECEIVE" && data.sku === `HELLOKITTY${testRun}`);

    expect(res.response.status).toEqual(200);
    expect(helloKittyReceives).toHaveLength(2);
  });

  it("CreateShipment - 201 do not fulfill", async () => {
    const shipmentId: number = Number.parseInt(`1${testRun}`);
    const shipment = {
      "deliverrShipmentId": shipmentId,
      "shippingAddress": {
        "name": "Vicki Chow",
        "street1": "110 Sutter St",
        "street2": "Floor 9",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94104",
        "country": "US",
        "email": "vicki+test@deliverr.com"
      },
      "shippingMethod": "FEDEX.GROUND",
      "lineItems": [
        {
          "sku": "HELLOKITTY",
          "quantity": 1
        }
      ],
      "boxName": "10x10x10 Box",
      "notes": "do not fulfill",
      warehouse
    };
    const res = await ax.request({
      method: "post",
      data: shipment,
      url: `/shipment`,
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(200);
    expect(res.response.data).toEqual(shipment);
  });

  it("CreateShipment - 201", async () => {
    const shipmentId: number = Number.parseInt(`2${testRun}`);
    const shipment = {
      "deliverrShipmentId": shipmentId,
      "shippingAddress": {
        "name": "Vicki Chow",
        "street1": "110 Sutter St",
        "street2": "Floor 9",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94104",
        "country": "US",
        "email": "vicki+test@deliverr.com"
      },
      "shippingMethod": "FEDEX.GROUND",
      "lineItems": [
        {
          "sku": "HELLOKITTY",
          "quantity": 1
        }
      ],
      "boxName": "10x10x10 Box",
      "notes": "fulfill this order with a tracking id",
      warehouse
    };
    const res = await ax.request({
      method: "post",
      data: shipment,
      url: `/shipment`,
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(200);
    expect(res.response.data).toEqual(shipment);
  });

  it("CreateShipment - 201 with carrierAccount", async () => {
    const shipmentId: number = Number.parseInt(`3${testRun}`);
    const shipment = {
      "deliverrShipmentId": shipmentId,
      "shippingAddress": {
        "name": "Vicki Chow",
        "street1": "110 Sutter St",
        "street2": "Floor 9",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94104",
        "country": "US",
        "email": "vicki+test@deliverr.com"
      },
      "shippingMethod": "FEDEX.HOME.DELIVERY",
      "lineItems": [
        {
          "sku": "HELLOKITTY",
          "quantity": 1
        }
      ],
      "boxName": "10x10x10 Box",
      "notes": "fulfill this order with a tracking id",
      warehouse,
      "carrierAccount": "908245393"
    };
    const res = await ax.request({
      method: "post",
      data: shipment,
      url: `/shipment`,
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(200);
    expect(res.response.data).toEqual(shipment);
  });

  it("CreateShipment - 201 warehouse to cancel", async () => {
    const shipmentId: number = Number.parseInt(`4${testRun}`);
    const shipment = {
      "deliverrShipmentId": shipmentId,
      "shippingAddress": {
        "name": "Vicki Chow",
        "street1": "110 Sutter St",
        "street2": "Floor 9",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94104",
        "country": "US",
        "email": "vicki+test@deliverr.com"
      },
      "shippingMethod": "FEDEX.GROUND",
      "lineItems": [
        {
          "sku": "HELLOKITTY",
          "quantity": 1
        }
      ],
      "boxName": "10x10x10 Box",
      "notes": "cancel this order",
      warehouse
    };
    const res = await ax.request({
      method: "post",
      data: shipment,
      url: `/shipment`,
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(200);
    expect(res.response.data).toEqual(shipment);
  });

  it("CreateShipment - 201 to cancel via api", async () => {
    const shipmentId: number = Number.parseInt(`5${testRun}`);
    const shipment = {
      "deliverrShipmentId": shipmentId,
      "shippingAddress": {
        "name": "Vicki Chow",
        "street1": "110 Sutter St",
        "street2": "Floor 9",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94104",
        "country": "US",
        "email": "vicki+test@deliverr.com"
      },
      "shippingMethod": "FEDEX.GROUND",
      "lineItems": [
        {
          "sku": "HELLOKITTY",
          "quantity": 1
        }
      ],
      "boxName": "10x10x10 Box",
      "notes": "",
      warehouse
    };
    const res = await ax.request({
      method: "post",
      data: shipment,
      params: `/shipment`,
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(200);
    expect(res.response.data).toEqual(shipment);
  });

  it("CreateShipment - 204 cancel shipment", async () => {
    const shipmentId: number = Number.parseInt(`5${testRun}`);
    const res = await ax.request({
      method: "delete",
      params: `/shipment/${shipmentId}`,
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(204);
    expect(res.response.data).toBeUndefined();
  });
});
