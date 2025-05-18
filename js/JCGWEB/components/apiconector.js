
const Default_Headers = { "Content-Type": "application/json" };

const ParamTreat = (url, params) => {
  if (params) {
    url += '?';
    for (const key in params) url += `${key}=${params[key]}&`;
    url = url.slice(0, -1);
  }
  return url;
}

async function _fetch(url, method = 'GET', params, body, headers = Default_Headers, returnJson = true) {
  url = ParamTreat(url, params);
  const reqdata = {};
  if (body) reqdata.body = JSON.stringify(body);
  if (headers) reqdata.headers = headers;
  reqdata.method = method;
  const response = await fetch(url, reqdata);
  if (!returnJson) return response;
  const data = await response.json();
  return data;
}

async function get(url, params, headers = Default_Headers, returnJson = true) { return await _fetch(url, 'GET', params, null, headers, returnJson) };
async function post(url, params, body, headers = Default_Headers, returnJson = true) { return await _fetch(url, 'POST', params, body, headers, returnJson) };
async function put(url, params, body, headers = Default_Headers, returnJson = true) { return await _fetch(url, 'PUT', params, body, headers, returnJson) };
async function del(url, params, headers = Default_Headers, returnJson = true) { return await _fetch(url, 'DELETE', params, null, headers, returnJson) };

async function getendpointdata(host, endpoint) { return await get(`${host}/${endpoint}`)};
async function getInfo(host)  { return await getendpointdata(host, 'info')}

if (typeof module != 'undefined') module.exports = { get, post, put, del, getInfo, getendpointdata }