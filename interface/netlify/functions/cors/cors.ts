import { Handler } from '@netlify/functions'
import fetch from 'node-fetch';

export const handler: Handler = async (event, context) => {
  const { url } = event.queryStringParameters
  const { body, httpMethod, headers } = event

  console.log('request', event)

  const responseHeaders = {}
  responseHeaders['Access-Control-Allow-Origin'] = headers['origin']
  responseHeaders['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS, DELETE'
  responseHeaders['Access-Control-Max-Age'] = '86400'
  responseHeaders['Access-Control-Allow-Headers'] = '*'
  responseHeaders['Content-Type'] = 'application/json'

  if (httpMethod == 'OPTIONS') {

    const lambdaResponse = {
      statusCode: 200,
      headers: responseHeaders,
      body: '',
    }
    console.log('response', lambdaResponse)
    return lambdaResponse
  }

  try {
    const response = await fetch(url, {
      method: httpMethod,
      body: body,
      headers: headers, 
    });

    const responseJson = await response.json()
  } catch(err) {
    return {status: 200, body: JSON.stringify({"error": JSON.stringify(err)}, reponseHeaders)}
  }

  // TODO: consider adding headers
  //const responseHeaders = response.headers.raw()

  const lambdaResponse = {
    statusCode: response.status,
    headers: responseHeaders,
    body: JSON.stringify(responseJson), // assume always json
  }
  console.log('response', lambdaResponse)
  return lambdaResponse

}
