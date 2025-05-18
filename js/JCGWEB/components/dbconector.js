const apiconector = (typeof module != 'undefined') ? require('./apiconector.js') : window;

class dbconector {
  constructor(host = "http://192.168.1.250:3004", getEndpointsCallback, onErrorCallback) {
    this.host = host;
    this.endpoint = null;
    this.endpoints = {};
    this.getEndpointsCallback = getEndpointsCallback || function () {} ;
    this.onErrorCallback = onErrorCallback || function () {} ;
  }
  start = () => {
    apiconector.getInfo(this.host).then(data => {
      if(!data) throw new Error('No data received');
      this.info = data.response;
      this.endpoint = this.info.endpoint;
      apiconector.getendpointdata(this.host, this.endpoint).then(data => { 
        this.endpoints = data;
        if (this.getEndpointsCallback) this.getEndpointsCallback(data);
       }).catch(err => {
        console.log(err)
        if(this.onErrorCallback) this.onErrorCallback(err);
       })
    }).catch(err => {
      console.log(err);
      if(this.onErrorCallback) this.onErrorCallback(err);
    } )
  }
  post = async (endpoint, params, body, headers = {"Content-Type": "application/json"}) => {
    const endpointInfo = this.endpoints?.response?.endpoints?.api?.endpoints[endpoint];
    if (!endpointInfo) throw new Error('Endpoint not found');
    let url = this.host + endpointInfo.url;
    return await apiconector.post(url, params, body, headers); //global post function, is NOT the this.post
  }
  insert = async (DB, Collection, Data) => await this.post('insert', null, { DB, Collection, Data });
  find = async (DB, Collection, Query, Sort, Fields, Limit, LastUpdate) => await this.post('find', null, { DB, Collection, Query, Sort, Fields, Limit, LastUpdate });
  search = async (DB, Collection, Query, Fields, Sort, Page, Limit, FieldsNeg, LastUpdate) => await this.post('search', null, { DB, Collection, Query, Fields, Sort, Page, Limit, FieldsNeg, LastUpdate });
  update = async (DB, Collection, Query, Data) => await this.post('update', null, { DB, Collection, Query, Data });
  delete = async (DB, Collection, Query) => await this.post('delete', null, { DB, Collection, Query });
  parse = data => typeof data.response.result === 'object' ? data.response.result : JSON.parse(data.response.result);
  
}

if (typeof module != 'undefined') module.exports = dbconector
