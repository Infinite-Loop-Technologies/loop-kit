import { pathToFileURL } from "node:url";

const DEFAULT_URL = "https://jsonplaceholder.typicode.com/posts/1";

const generatedModulePath =
  process.env.VOLT_INTEGRATION_FETCHCOMPONENT_GENERATED_MODULE_PATH;

if (!generatedModulePath) {
  throw new Error(
    "Missing VOLT_INTEGRATION_FETCHCOMPONENT_GENERATED_MODULE_PATH. Run this through Volt with the fetchComponent integration.",
  );
}

const componentModule = await import(pathToFileURL(generatedModulePath).href);
const simpleRequest = componentModule.simpleRequest;

if (!simpleRequest?.getJson) {
  throw new Error(
    `Generated component module did not expose simpleRequest.getJson: ${generatedModulePath}`,
  );
}

const rawUrl = process.argv[2] ?? DEFAULT_URL;
const result = await simpleRequest.getJson(rawUrl);

console.log(
  JSON.stringify(
    {
      generatedModulePath,
      result: {
        responseJson: JSON.parse(result.responseJson),
        url: result.url,
      },
    },
    null,
    2,
  ),
);
