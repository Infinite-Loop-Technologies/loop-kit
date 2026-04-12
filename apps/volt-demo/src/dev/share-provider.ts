export interface ShareProvider {
  name: string;
  publish: (serviceName: string, port: number) => Promise<string | null>;
}
