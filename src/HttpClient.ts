import HTTPResponse = GoogleAppsScript.URL_Fetch.HTTPResponse

export interface HttpClient {
  get: (uri: string) => JSON,
  post: (uri: string, payload: any) => JSON
}

const doRequest = (uri: string, options?: Object): HTTPResponse => {
  if (options == null) return UrlFetchApp.fetch(uri)
  else return UrlFetchApp.fetch(uri, options)
}

const httpResponseToJson = (response: HTTPResponse): JSON => 
  JSON.parse(response.getContentText())

export const HttpClientImpl = (): HttpClient => ({
  get: (uri: string): JSON => {
    const httpResponse = doRequest(uri)
    return httpResponseToJson(httpResponse)
  },
  post: (uri: string, payload: any): JSON => {
    const options = {
      method: "post",
      payload: payload
    }
    const httpResponse = doRequest(uri, options)
    return httpResponseToJson(httpResponse)
  }
})