/* tslint:disable */ 
jest.setTimeout(90000); //Setting a higher timeout value for jest is important otherwise it times out before tests are complete.
import axios, { AxiosInstance } from "axios";
import * as moment from "moment";
import { resolve } from "path"
import { config } from "dotenv"
config({ path: resolve(__dirname, "../.env") })
describe("WarehouseTests1", () => {
  let baseURL: string;
  let username: string;
  let password: string;
  let warehouseId: string;
  let testRun: Number;
  let ax: AxiosInstance;
  let currentDate: string;
  let futureDate: string;

  beforeAll(() => {
    baseURL = process.env.SERVICE_URL || "";
    username = process.env.APIUSER || ""; //See .env file for explanation
    password = process.env.PASSWORD || "";
    warehouseId = process.env.WAREHOUSE_ID || "";
    testRun = Number(process.env.TEST_RUN);
    ax = axios.create({ baseURL, auth: { username, password }, withCredentials: true, responseType: "json", headers: {"Accept":"application/json"}});
    currentDate = moment().format("YYYY-MM-DDTHH:mm:ssZ");
    futureDate = moment().add(2, "week").format("YYYY-MM-DDTHH:mm:ssZ");
  });

  it("GetProductDetails - 404 not found", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const res = await ax.request({
      method: "get",
      url: `/product/${dsku}`
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toEqual(404);
  });

  it("CreateProductDetails - 201", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const product = {
      "sku": dsku,
      "name": dsku,
      "description": `${dsku} likes HELLOKITTY`,
      "costInUSD": 13,
      "weight": 5.2,
      "length": 3,
      "width": 2,
      "height": 1,
      "caseQty": 0,
      "weightUnit": "lb",
      "lengthUnit": "in",
      "hsTariffCode": "123-456",
      "countryOfOrigin": "US",
      "barcodes": [`${dsku}`]
    };
    const res = await ax.request({
      method: "post",
      url: `/product`,
      data: product,
    }).then(res => res)
      .catch(e => e);
    // In case of success, res object from axios request does not have a response property.
    // data and status properties are directly available on res object hence 'res.response' is replaced with 'res'.
    expect(res.data).toEqual(product);
    expect(res.status).toEqual(201);
  });

  it("CreateProductDetails - 409 duplicate sku", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const product = {
      "sku": dsku,
      "name": dsku,
      "description": `${dsku} likes bananas`,
      "costInUSD": 13,
      "weight": 5.2,
      "length": 3,
      "width": 2,
      "height": 1,
      "caseQty": 0,
      "weightUnit": "lb",
      "lengthUnit": "in",
      "hsTariffCode": "123-456",
      "countryOfOrigin": "US",
      "barcodes": [`${dsku}`]
    };
    const res = await ax.request({
      method: "post",
      url: `/product`,
      data: product,
    }).then(res => res)
      .catch(e => e);

    expect(res.response.status).toBeGreaterThanOrEqual(400);
    expect(res.response.data.error).toBeDefined();
  });

  it("CreateProductDetails - 409 duplicate barcode", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const product = {
        "sku": `${dsku}banana`,
        "name": dsku,
        "description": `${dsku} likes bananas`,
        "costInUSD": 13,
        "msku": dsku,
        "weight": 5.2,
        "length": 3,
        "width": 2,
        "height": 1,
        "caseQty": 0,
        "weightUnit": "lb",
        "lengthUnit": "in",
        "hsTariffCode": "123-456",
        "countryOfOrigin": "US",
        "barcodes": [`${dsku}`]
    };
    const res = await ax.request({
      method: "post",
      url: `/product`,
      data: product,
    }).then(res => res)
    .catch(e => e);

    expect(res.response.status).toBeGreaterThanOrEqual(400);
    expect(res.response.data.error).toEqual("DUPLICATE_BARCODE");
  });

  it("CreateProductDetails - 409 missing barcode", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const product = {
        "sku": `${dsku}banana`,
        "name": dsku,
        "description": `${dsku} likes bananas`,
        "costInUSD": 13,
        "msku": dsku,
        "weight": 5.2,
        "length": 3,
        "width": 2,
        "height": 1,
        "caseQty": 0,
        "weightUnit": "lb",
        "lengthUnit": "in",
        "hsTariffCode": "123-456",
        "countryOfOrigin": "US",
        "barcodes": []
    };
    const res = await ax.request({
      method: "post",
      url: `/product`,
      data: product,
    }).then(res => res)
    .catch(e => e);
    
    expect(res.response.status).toBeGreaterThanOrEqual(409);
    expect(res.response.data.error).toEqual("MISSING_BARCODE");
  });

  it("UpdateProductDetails - 201", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const product = {
        "sku": dsku,
        "name": dsku,
        "description": `${dsku} likes HELLOKITTY`,
        "costInUSD": 13,
        "msku": dsku,
        "weight": 5.2,
        "length": 3,
        "width": 2,
        "height": 1,
        "caseQty": 0,
        "weightUnit": "lb",
        "lengthUnit": "in",
        "hsTariffCode": "123-456",
        "countryOfOrigin": "US",
        "barcodes": [`${dsku}`, `${testRun}-HELLOKITTY`]
      };
    const res = await ax.request({
      method: "put",
      url: `/product`,
      data: product,
    }).then(res => res)
    .catch(e => e);
    // In case of success, res object from axios request does not have a response property.
    // data and status properties are directly available on res object hence 'res.response' is replaced with 'res'.
    expect(res.status).toEqual(201);
    expect(res.data).toEqual(product);
  });

  it("GetProductDetails - 200", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const res = await ax.request({
      method: "get",
      url: `/product/${dsku}`,
    }).then(res => res)
      .catch(e => e);
    

    expect(res.status).toEqual(200)
    // In case of success, res object from axios request does not have a response property.
    // data and status properties are directly available on res object hence 'res.response' is replaced with 'res'.
    expect(res.data).toEqual({
      "sku": dsku,
      "name": dsku,
      "description": `${dsku} likes HELLOKITTY`,
      "costInUSD": 13,
      "weight": 5.2,
      "length": 3,
      "width": 2,
      "height": 1,
      "caseQty": 0,
      "weightUnit": "lb",
      "lengthUnit": "in",
      "hsTariffCode": "123-456",
      "countryOfOrigin": "US",
      "barcodes": [`${dsku}`, `${testRun}-HELLOKITTY`]
    });
  });

  it("GetAsn - 404 not found", async () => {
    const asnId: Number = Number.parseInt(`5${testRun}`);
    const res = await ax.request({
      method: "get",
      url: `/asn/${asnId}`,
    }).then(res => res)
    .catch(e => e);

    expect(res.response.status).toEqual(404);
  });

  it("CreateAsn - 201 qty 1", async () => {
    const asnId: number = Number.parseInt(`1${testRun}`);
    const asn = {
      "deliverrAsnId": asnId,
      "createdDate": currentDate,
      "expectedDate": futureDate,
      "shipToWarehouse": warehouseId,
      "notes": "",
      "asnItems": [
        {
          "sku": `HELLOKITTY${testRun}`,
          "quantityExpected": 1
        }
      ]
    }
    const res = await ax.request({
      method: "post",
      data: asn,
      url: `/asn`,
    }).then(res => res)
      .catch(e => e);
    // In case of success, res object from axios request does not have a response property.
    // data and status properties are directly available on res object hence 'res.response' is replaced with 'res'.
    expect(res.status).toEqual(200);
    expect(res.data).toEqual(asn);
  });

  it("CreateAsn - 201 qty 5", async () => {
    const asnId: number = Number.parseInt(`5${testRun}`);
    const asn = {
      "deliverrAsnId": asnId,
      "createdDate": currentDate,
      "expectedDate": futureDate,
      "shipToWarehouse": warehouseId,
      "trackingNumber": "12345",
      "notes": "",
      "asnItems": [
        {
          "sku": `HELLOKITTY${testRun}`,
          "quantityExpected": 5
        }
      ]
    }
    const res = await ax.request({
      method: "post",
      data: asn,
      url: `/asn`,
    }).then(res => res)
    .catch(e => e);
    // In case of success, res object from axios request does not have a response property.
    // data and status properties are directly available on res object hence 'res.response' is replaced with 'res'.
    expect(res.status).toEqual(200);
    expect(res.data).toEqual(asn);
  });

  it("CreateAsn - 201 qty 10", async () => {
    const asnId: number = Number.parseInt(`10${testRun}`);
    const asn = {
      "deliverrAsnId": asnId,
      "createdDate": currentDate,
      "expectedDate": futureDate,
      "shipToWarehouse": warehouseId,
      "notes": "",
      "asnItems": [
        {
          "sku": `HELLOKITTY${testRun}`,
          "quantityExpected": 10
        }
      ]
    }
    const res = await ax.request({
      method: "post",
      data: asn,
      url: `/asn`,
    }).then(res => res)
    .catch(e => e);
    // In case of success, res object from axios request does not have a response property.
    // data and status properties are directly available on res object hence 'res.response' is replaced with 'res'.
    expect(res.status).toEqual(200);
    expect(res.data).toEqual(asn);
  });
});