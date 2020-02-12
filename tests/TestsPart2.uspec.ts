jest.setTimeout(90000); //Setting a higher timeout value for jest is important otherwise it times out before tests are complete.
import axios, { AxiosInstance } from "axios"; // Removed Unused imports. Nodejs in strict mode generates warnings for unused imports.
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
    username = process.env.APIUSER || ""; //See .env file for explanation
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
      //CreatedDate timestamp is the time when CreateAsn test was run in TestPart1.uspec.ts file. It cannot match the timestamp of this test in this file.
      //So if we keep this property in the object, the test will never succeed. We need to remove it from test.
      //"createdDate": currentDate,
      "expectedDate": null,
      "shipToWarehouse": warehouse,
      "notes": "",
      "asnItems": [
        {
          "sku": `HELLOKITTY${testRun}`,//It should be testRun value since that was passed in when CreateAsn test was done. Not CurrentDate.
          "quantityExpected": 1,
          "quantityReceived": 0,
          "quantityStocked": 0
        }
      ]
    }
    const res = await ax.request({
      method: "get",
      url: `/asn/${asnId}`//Request URL cannot be complete without asnId at the end
    }).then(res => res)
      .catch(e => e);

    // In case of success, res object from axios request does not have a response property.
    expect(res.status).toEqual(200);
    expect(res.data).toEqual(asn);
  });

  it("GetAsnStatus - 200 qty 10 partially received", async () => {
    const asnId: number = Number.parseInt(`10${testRun}`);
    const asn = {
      "deliverrAsnId": asnId,
      //CreatedDate timestamp is the time when CreateAsn test was run in TestPart1.uspec.ts file. It cannot match the timestamp of this test in this file.
      //So if we keep this property in the object, the test will never succeed. We need to remove it from test.
      // "createdDate": currentDate,
      "expectedDate": null,
      "shipToWarehouse": warehouse,
      "notes": "",
      "asnItems": [
        {
          "sku": `HELLOKITTY${testRun}`,//It should be testRun value since that was passed in when CreateAsn test was done. Not CurrentDate.
          "quantityExpected": 10,
          "quantityReceived": 5,
          "quantityStocked": 5
        }
      ]
    }
    const res = await ax.request({
      method: "get",
      url: `/asn/${asnId}`,//Request URL cannot be complete withou asnId at the end
    }).then(res => res)
      .catch(e => e);

    // In case of success, res object from axios request does not have a response property.
    expect(res.status).toEqual(200);
    expect(res.data).toEqual(asn);
  });

  it("GetAsnStatus - 200 qty 5 fully received", async () => {
    const asnId: number = Number.parseInt(`5${testRun}`);
    const asn = {
      "deliverrAsnId": asnId,
      "asnItems": [
        {
          "sku": `HELLOKITTY${testRun}`,//It should be testRun value since that was passed in when CreateAsn test was done. Not CurrentDate.
          "quantityExpected": 5,
          "quantityReceived": 5,
          "quantityStocked": 5
        }
      ]
    }
    const res = await ax.request({
      method: "get",
      url: `/asn/${asnId}`,//Request URL cannot be complete withou asnId at the end
    }).then(res => res)
      .catch(e => e);

    // In case of success, res object from axios request does not have a response property.
     expect(res.status).toEqual(200);
     expect(res.data).toEqual(asn);
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

    // In case of success, res object from axios request does not have a response property.
    expect(res.status).toEqual(200);
    expect(res.data).toEqual(expectedResponse);
  });

  it("GetInventoryMovements - 200", async () => {
    const res = await ax.request({
      method: "get",
      url: `/inventory/movements?warehouse=${warehouse}&fromTime=${moment(currentDate).subtract(3, 
        "hours").format("YYYY-MM-DDTHH:mm:ssZ")}&toTime=${moment(currentDate).format("YYYY-MM-DDTHH:mm:ssZ")}`,
    }).then(res => res)
      .catch(e => e);
    // In case of success, res object from axios request does not have a response property.
    const helloKittyReceives = res.data.filter((data: any) => data.movementType === "RECEIVE" && data.sku === `HELLOKITTY${testRun}`);

    expect(res.status).toEqual(200);
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
		  "sku": `HELLOKITTY${testRun}`,//testRun value must be appended since that was passed in when Item was created.
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

    // In case of success, res object from axios request does not have a response property.
    expect(res.status).toEqual(200);
    expect(res.data).toEqual(shipment);
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
		  "sku": `HELLOKITTY${testRun}`,//testRun value must be appended since that was passed in when Item was created.
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

    // In case of success, res object from axios request does not have a response property.
    expect(res.status).toEqual(200);
    expect(res.data).toEqual(shipment);
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
		  "sku": `HELLOKITTY${testRun}`,//testRun value must be appended since that was passed in when Item was created.
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

    // In case of success, res object from axios request does not have a response property.
    expect(res.status).toEqual(200);
    expect(res.data).toEqual(shipment);
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
		  "sku": `HELLOKITTY${testRun}`,//testRun value must be appended since that was passed in when Item was created.
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

    // In case of success, res object from axios request does not have a response property.
    expect(res.status).toEqual(200);
    expect(res.data).toEqual(shipment);
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
		  "sku": `HELLOKITTY${testRun}`,//testRun value must be appended since that was passed in when Item was created.
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
      url: `/shipment`,//For delete request, we need to set URL not parameter.
    }).then(res => res)
      .catch(e => e);

    // In case of success, res object from axios request does not have a response property.
    expect(res.status).toEqual(200);
    expect(res.data).toEqual(shipment);
  });

  it("CreateShipment - 204 cancel shipment", async () => {
    const shipmentId: number = Number.parseInt(`5${testRun}`);
    const res = await ax.request({
      method: "delete",
      url: `/shipment/${shipmentId}`,//For delete request, we need to set shipmentId as URL not as a parameter.
    }).then(res => res)
      .catch(e => e);

    // In case of success, res object from axios request does not have a response property.
	expect(res.status).toEqual(204);
    expect(res.data).toEqual("");	//We cannot send undefined data with 204 status
  });
});
