import { AxiosBasicCredentials, AxiosInstance, AxiosResponse } from "axios";
import * as moment from "moment";
import * as Qs from "qs";
import ENV from "../util/env";
describe("WarehouseTests1", () => {
  let serviceUrl: string;
  let username: string;
  let password: string;
  let warehouseId: string;
  let testRun: Number;
  let auth: AxiosBasicCredentials;
  let axios: AxiosInstance;
  let currentDate: string;

  beforeAll(() => {
    serviceUrl = ENV.SERVICE_URL;
    username = ENV.BASIC_AUTH_USERNAME;
    password = ENV.BASIC_AUTH_PASSWORD;
    warehouseId = ENV.WAREHOUSE_ID;
    testRun = ENV.TEST_RUN;
    auth = { username, password };
    currentDate = moment().format("YYYY-MM-DDTHH:mm:ssZ");
  });

  it("GetProductDetails - 404 not found", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const response: AxiosResponse = await axios.request({
      method: "get",
      url: serviceUrl,
      auth,
      params: `/product/${dsku}`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(404);
    expect(response.data).toBeUndefined();
  });

  it("CreateProductDetails - 201", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const product = {
      "product": {
        "sku": dsku,
        "name": dsku,
        "description": `${dsku} likes HELLOKITTY`,
        "cost": 13,
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
      }
    };
    const response: AxiosResponse = await axios.request({
      method: "post",
      url: serviceUrl,
      auth,
      params: `/product`,
      data: product,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(201);
    expect(response.data).toEqual(product);
  });

  it("CreateProductDetails - 409 duplicate sku", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const product = {
      "product": {
        "sku": dsku,
        "name": dsku,
        "description": `${dsku} likes bananas`,
        "cost": 13,
        "weight": 5.2,
        "length": 3,
        "width": 2,
        "height": 1,
        "caseQty": 0,
        "weightUnit": "lb",
        "lengthUnit": "in",
        "hsTariffCode": "123-456",
        "countryOfOrigin": "US",
        "barcodes": [`${dsku}banana`]
      }
    };
    const response: AxiosResponse = await axios.request({
      method: "post",
      url: serviceUrl,
      auth,
      params: `/product`,
      data: product,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(409);
    expect(response.data.error).toEqual("DUPLICATE_SKU");
  });

  it("CreateProductDetails - 409 duplicate barcode", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const product = {
      "product": {
        "sku": `${dsku}banana`,
        "name": dsku,
        "description": `${dsku} likes bananas`,
        "cost": 13,
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
      }
    };
    const response: AxiosResponse = await axios.request({
      method: "post",
      url: serviceUrl,
      auth,
      params: `/product`,
      data: product,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(409);
    expect(response.data.error).toEqual("DUPLICATE_BARCODE");
  });

  it("CreateProductDetails - 409 missing barcode", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const product = {
      "product": {
        "sku": `${dsku}banana`,
        "name": dsku,
        "description": `${dsku} likes bananas`,
        "cost": 13,
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
      }
    };
    const response: AxiosResponse = await axios.request({
      method: "post",
      url: serviceUrl,
      auth,
      params: `/product`,
      data: product,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(409);
    expect(response.data.error).toEqual("MISSING_BARCODE");
  });

  it("UpdateProductDetails - 200", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const product = {
      "product": {
        "sku": dsku,
        "name": dsku,
        "description": `${dsku} likes HELLOKITTY`,
        "cost": 13,
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
      }
    };
    const response: AxiosResponse = await axios.request({
      method: "put",
      url: serviceUrl,
      auth,
      params: `/product`,
      data: product,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(product);
  });

  it("GetProductDetails - 200", async () => {
    const dsku: string = `HELLOKITTY${testRun}`;
    const response: AxiosResponse = await axios.request({
      method: "get",
      url: serviceUrl,
      auth,
      params: `/product/${dsku}`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual({
      "sku": dsku,
      "name": dsku,
      "description": `${dsku} likes HELLOKITTY`,
      "cost": 13,
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
    const response: AxiosResponse = await axios.request({
      method: "get",
      url: serviceUrl,
      auth,
      params: `/asn/${asnId}`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(404);
    expect(response.data).toBeUndefined();
  });

  it("CreateAsn - 201 qty 1", async () => {
    const asnId: number = Number.parseInt(`1${testRun}`);
    const asn = {
      "deliverrAsnId": asnId,
      "createdDate": currentDate,
      "expectedDate": null,
      "shipToWarehouse": warehouseId,
      "notes": "",
      "items": [
        {
          "sku": `HELLOKITTY${currentDate}`,
          "quantityExpected": 1
        }
      ]
    }
    const response: AxiosResponse = await axios.request({
      method: "post",
      url: serviceUrl,
      data: asn,
      auth,
      params: `/asn`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(asn);
  });

  it("CreateAsn - 201 qty 5", async () => {
    const asnId: number = Number.parseInt(`5${testRun}`);
    const asn = {
      "deliverrAsnId": asnId,
      "createdDate": currentDate,
      "expectedDate": null,
      "shipToWarehouse": warehouseId,
      "trackingNumber": "12345",
      "notes": "",
      "items": [
        {
          "sku": `HELLOKITTY${currentDate}`,
          "quantityExpected": 5
        }
      ]
    }
    const response: AxiosResponse = await axios.request({
      method: "post",
      url: serviceUrl,
      data: asn,
      auth,
      params: `/asn`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(asn);
  });

  it("CreateAsn - 201 qty 10", async () => {
    const asnId: number = Number.parseInt(`10${testRun}`);
    const asn = {
      "deliverrAsnId": asnId,
      "createdDate": currentDate,
      "expectedDate": null,
      "shipToWarehouse": warehouseId,
      "notes": "",
      "items": [
        {
          "sku": `HELLOKITTY${currentDate}`,
          "quantityExpected": 10
        }
      ]
    }
    const response: AxiosResponse = await axios.request({
      method: "post",
      url: serviceUrl,
      data: asn,
      auth,
      params: `/asn`,
      paramsSerializer(params) {
        return Qs.stringify(params, { arrayFormat: "repeat" });
      }
    }).then(res => res);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(asn);
  });
});