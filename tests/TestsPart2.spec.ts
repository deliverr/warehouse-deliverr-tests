import axios, { AxiosBasicCredentials, AxiosInstance, AxiosResponse } from "axios";
import * as moment from "moment";
import * as Qs from "qs";
import ENV from "../util/env";
describe("WarehouseTests", () => {
  let serviceUrl: string;
  let username: string;
  let password: string;
  let warehouse: string;
  let testRun: Number;
  let auth: AxiosBasicCredentials;
  let ai: AxiosInstance;
  let currentDate: string;
  let currentUnix: number;

  beforeAll(() => {
    serviceUrl = ENV.SERVICE_URL;
    username = ENV.BASIC_AUTH_USERNAME;
    password = ENV.BASIC_AUTH_PASSWORD;
    warehouse = ENV.WAREHOUSE_ID;
    testRun = ENV.TEST_RUN;
    auth = { username, password };
    currentDate = moment().format("YYYY-MM-DDTHH:mm:ssZ");
    ai = axios.create();
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
    const response: AxiosResponse = await ai.request({
      method: "get",
      url: serviceUrl,
      auth,
      params: `/asn`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(asn);
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
    const response: AxiosResponse = await ai.request({
      method: "get",
      url: serviceUrl,
      auth,
      params: `/asn`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(asn);
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
    const response: AxiosResponse = await ai.request({
      method: "get",
      url: serviceUrl,
      auth,
      params: `/asn`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(asn);
  });

  it("GetInventoryStatus - 200", async () => {
    const expectedResponse = {
      sku: `HELLOKITTY${testRun}`,
      warehouse,
      inventoryOnHand: 10
    };
    const response: AxiosResponse = await ai.request({
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

  it("GetInventoryMovements - 200", async () => {
    const expectedResponse = {
      sku: `HELLOKITTY${testRun}`,
      warehouse,
      inventoryOnHand: 10
    };
    const response: AxiosResponse = await ai.request({
      method: "get",
      url: serviceUrl,
      auth,
      params: `/inventory/movements?warehouse=${warehouse}&fromTime=${moment(currentDate).subtract(3, 
        "hours").format("YYYY-MM-DDTHH:mm:ssZ")}&toTime=${moment(currentDate).format("YYYY-MM-DDTHH:mm:ssZ")}`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);
    const helloKittyReceives = response.data.filter((data: any) => data.movementType === "RECEIVE" && data.sku === `HELLOKITTY${testRun}`);

    expect(response.status).toEqual(200);
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
    const response: AxiosResponse = await ai.request({
      method: "post",
      url: serviceUrl,
      data: shipment,
      auth,
      params: `/shipment`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(shipment);
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
    const response: AxiosResponse = await ai.request({
      method: "post",
      url: serviceUrl,
      data: shipment,
      auth,
      params: `/shipment`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(shipment);
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
    const response: AxiosResponse = await ai.request({
      method: "post",
      url: serviceUrl,
      data: shipment,
      auth,
      params: `/shipment`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(shipment);
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
    const response: AxiosResponse = await ai.request({
      method: "post",
      url: serviceUrl,
      data: shipment,
      auth,
      params: `/shipment`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(shipment);
  });

  it("CreateShipment - 201 api to cancel", async () => {
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
    const response: AxiosResponse = await ai.request({
      method: "post",
      url: serviceUrl,
      data: shipment,
      auth,
      params: `/shipment`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(shipment);
  });

  it("CreateShipment - 204 cancel shipment", async () => {
    const shipmentId: number = Number.parseInt(`5${testRun}`);
    const response: AxiosResponse = await ai.request({
      method: "delete",
      url: serviceUrl,
      auth,
      params: `/shipment/${shipmentId}`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(204);
    expect(response.data).toBeUndefined();
  });
});
