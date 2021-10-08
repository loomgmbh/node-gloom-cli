const Http = require('http');
const Https = require('https');
const Path = require('path');

module.exports = class Request {

  static get SERVER() {
    return 'http://localhost:3001';
  }

  /**
   * @param {import('../Interface/Command')} command 
   */
  constructor(command) {
    this.command = command;
    this._logger = this.command.logger;
    this._encoder = new TextEncoder();
  }

  /**
   * @param {string} url 
   * @returns {string}
   */
  getUrl(url) {
    return Path.join(Request.SERVER, url);
  }

  GET(url) {
    return new Promise((res, rej) => {
      const options = this.getRequestOptions(url, {method: 'GET'});
      let Lib = Http;

      if (options.protocol.startsWith('https')) {
        Lib = Https;
      }

      const req = Lib.request(options, (response) => {
        let content = '';
        response.on('data', (data) => {
          content += data;
        });
        response.on('end', () => {
          res(content);
        });
      });

      req.on('error', (error) => {
        this._logger.error(error);
        rej(error);
      });

      req.end();
    });
  }

  JSON(url) {
    return this.GET(url).then(json => JSON.parse(json));
  }

  POST(url, data) {
    return new Promise((res, rej) => {
      const options = this.getRequestOptions(url, {method: 'POST'});
      let Lib = Http;

      if (options.protocol.startsWith('https')) {
        Lib = Https;
      }

      const req = Lib.request(options, (response) => {
        let content = '';
        response.on('data', (data) => {
          content += data;
        });
        response.on('end', () => {
          res(content);
        });
      });

      req.on('error', error => {
        this._logger.error(error);
        rej(error);
      });
      
      req.write(data);
      req.end();
    });
  }

  POST_JSON(url, json) {
    return this.POST(url, this._encoder.encode(JSON.stringify(json))).then((json) => JSON.parse(json));
  }

  getRequestOptions(url, options = {}) {
    const path = new URL(url);
    options.hostname = path.hostname;
    options.port = path.port;
    options.path = path.pathname;
    options.protocol = path.protocol;
    return options;
  }

}