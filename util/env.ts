import * as dotenv from "dotenv";

dotenv.config();

function getEnv<X>(
  variable: string,
  parser: (v: string) => X,
  defaultValue: X
): X {
  const envString = process.env[variable];
  if (envString) {
    try {
      return parser(envString);
    } catch (error) {
      console.log(
        { envString, variable, error },
        "Unable to parse environment variable"
      );
      return defaultValue;
    }
  } else {
    return defaultValue;
  }
}

export default {
  SERVICE_URL: getEnv(
    "SERVICE_URL",
    String,
    "https://warehouse.service.url.com"
  ),
  BASIC_AUTH_USERNAME: getEnv("USERNAME", String, "deliverruser"),
  BASIC_AUTH_PASSWORD: getEnv("PASSWORD", String, "deliverrpw"),
  WAREHOUSE_ID: getEnv("WAREHOUSE_ID", String, "WAREHOUSE1"),
  TEST_RUN: getEnv("TEST_RUN", Number, 0)
};