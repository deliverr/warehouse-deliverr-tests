# warehouse-deliverr-tests
A test suite for 3PLs to run and test their Deliverr integration

Assuming that the warehouse has implemented API as per [the Postman documentation](https://identity.getpostman.com/handover/multifactor?user=6596490&handover_token=fda040e0-77b1-45c1-b1c8-36e7ef903a11)

This test suite will test the endpoints from the Postman documentation. The following needs to be defined in the .env file before running the test suite

- `SERVICE_URL` the endpoint for your backend service
- `USERNAME` Deliverr's basic authentication username 
- `PASSWORD` Deliverr's basic authentication password
- `WAREHOUSE_ID` A ID for one of your warehouse facilities 
- `TEST_RUN` the i<sup>th</sup> run of the tests

## Tests
A single test run is divided into 4 parts.

After each test part is run, you are expected to handle the entities that have been created in your warehouse system (receiving ASN, fulfilling an order, cancelling an order,...), prior to running the next test part:

| Test Part | Details |
| :--: | -- |
| 1 |<ul><li>Get Product Details</li><li>Create Product</li><li>Update Product</li><li>Get Asn Status</li><li>Create ASN</li></ul>|
| After 1 |<ul><li>Receive Asn Partially</li><li>Receive Asn Completely</li><li>Generate Inventory Movements (damaged, return, receive)</li></ul>|
| 2 |<ul><li>Get ASN Status</li><li>Get Inventory Movements</li><li>Get Inventory Status</li><li>Create Shipments</li></ul>|
| After 2 |<ul><li>Fulfill orders (shipment)</li><li>Cancel a shipment</li></ul>|
| 3 |<ul><li>Get Inventory Status</li><li>Get Shipment Status</li><ul>|
| After 3 |<ul><li>Mark damaged units</li><ul>|
| 4 |<ul><li>Get Inventory Movements</li><ul>|

## How to run tests
1. Clone the repository: `git clone git@github.com:deliverr/warehouse-deliverr-tests.git`
2. Fill in `.env`. `TEST_RUN` is a number that has not yet been used before, starting at `0`. For every new test run (after going through all test parts), increment this by 1 so that it can be tracked in the warehouse's system.
3. Run Tests Part 1: `npm run test1`
4. In your warehouse system, fully receive the ASN that has expected quantity of 5 units, and receive 5 units of the ASN that has expected quantity of 10. Do not receive the ASN that has quantity of 1 unit.
5. Run Test Part 2: `npm run test2`
6. Cancel the order that has a note of `"cancel this order"`. Fulfill all other orders with fake tracking numbers.
7. Run Test Part 3: `npm run test3`
8. Mark 2 units as damaged, with inventory movement type of `ADJUSTMENT`