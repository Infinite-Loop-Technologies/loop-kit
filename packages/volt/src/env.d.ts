declare module "bun:bundle" {
  interface Registry {
    features:
      | "VOLT_MODE_DEVELOPMENT"
      | "VOLT_MODE_PRODUCTION"
      | "VOLT_RUNTIME_BUN_FULLSTACK"
      | "VOLT_RUNTIME_BUN_SERVER"
      | "VOLT_RUNTIME_ELECTROBUN"
      | "VOLT_TARGET_BROWSER"
      | "VOLT_TARGET_BUN";
  }
}
