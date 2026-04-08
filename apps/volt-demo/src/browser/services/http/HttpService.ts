// HttpService keeps fetch details out of the demo panels.
export interface HttpService {
  getJson: <TResponse>(url: string) => Promise<TResponse>;
  postJson: <TBody, TResponse>(url: string, body: TBody) => Promise<TResponse>;
}

const parseJson = async <TResponse>(response: Response): Promise<TResponse> => {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<TResponse>;
};

export const createHttpService = (): HttpService => ({
  getJson: async (url) => parseJson(await fetch(url)),
  postJson: async (url, body) =>
    parseJson(
      await fetch(url, {
        body: JSON.stringify(body),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    ),
});
