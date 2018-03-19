/**
 * Copyright 2018 EntIT Software LLC, a Micro Focus company
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const colors = require('colors/safe'),
      os = require('os'),
      portfinder = require('portfinder'),
      auth = require('basic-auth'),
      cliui = require('cliui'),
      moment = require('moment'),
      express = require('express');

	  
module.exports = class Server {

  constructor(logger, options) {
    this.logger = logger;
    this.options = options;
  }

  requestHandler(req, res) {
    const body = [];
    const time = moment().format('DD-MMM-YYYY HH:mm:ss.SSS');

    this.logger.info('[%s] %s %s "%s"', time, colors.cyan(req.method), colors.cyan(req.url), req.headers['user-agent']);

    res.on('error', err => this.logger.error(colors.red('Error on response'), err));

    req.on('error', err => this.logger.error(colors.red('Error on request'), err))
      .on('data', chunk => body.push(chunk))
      .on('end', () => {
        this.logHeaders(req);
        this.logBody(body);

        res.statusCode = this.options.statusCode;
        let resBody = time + ' - Message received by alm-octane-webhooks-listener!';

        if (!this.validateBasicAuthentication(req)) {
          res.statusCode = 401;
          resBody += ' \nBasic Authentication - Access denied!';
        }

        res.end(resBody);
      });
  }

  validateBasicAuthentication(req) {
    if (!this.options.user && !this.options.pass) {
      return true;
    }

    const credentials = auth(req);

    if (!credentials || credentials.name !== this.options.user || credentials.pass !== this.options.pass) {
      this.logger.error(colors.red('ERROR: Basic Authentication - Access denied.'));
      return false;
    }

    this.logger.info(colors.green('Basic Authentication - Access granted.'));
    return true;
  }

  logHeaders(req) {
    if (!this.options.verbose) {
      return;
    }

    let prettyHeaders = JSON.stringify(req.headers, null, 2);
    prettyHeaders = prettyHeaders.replace(/": "/g, '":\t "');
    const ui = cliui();
    ui.div(prettyHeaders);
    this.logger.info(colors.cyan('Received headers:\n'), colors.yellow(ui.toString()));
  }

  logBody(body) {
    if (!this.options.verbose) {
      return;
    }

    let prettyBody;
    const strBody = Buffer.concat(body).toString();

    try {
      prettyBody = JSON.stringify(JSON.parse(strBody), null, 2);
    } catch (e) {
      prettyBody = strBody;
    }

    if (prettyBody) {
      this.logger.info(colors.cyan('Received body:\n'), colors.yellow(prettyBody));
    } else {
      this.logger.info(colors.cyan('Received empty body.'));
    }
  }

  getPort() {
    if (this.options.port) {
      return Promise.resolve(this.options.port);
    }

    portfinder.basePort = 8080;
    return portfinder.getPortPromise();
  }

  printServerAddresses(port) {
    const ifaces = os.networkInterfaces();
    let arrAddresses = [];

    Object.keys(ifaces).forEach(netAdapter => {
      ifaces[netAdapter].forEach(details => {
        if (details.family === 'IPv4' && !details.internal) {
          arrAddresses.push('  http://' + details.address + ':' + colors.green(port) + '\t  (' + netAdapter + ')');
        }
      });
    });

    const ui = cliui();
    ui.div(arrAddresses.join('\n'));
    this.logger.info(colors.yellow('Available on:'));
    this.logger.info(ui.toString());
  }

  async listen() {
    let port = await this.getPort();

	const app = express();
	app.all("*", this.requestHandler.bind(this));

    app.listen(port, () => {
      this.logger.info(colors.yellow('Starting up alm-octane-webhooks-listener.'));
      this.printServerAddresses(port);
      this.logger.info('Press CTRL-C to stop the server\n');
    });
  }

};

