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

const colors     = require('colors/safe'),
      Server     = require('./lib/server'),
      argv       = require('optimist').argv;

if (argv.help) {
  console.log([
    '\nUsage: node app [options]',
    '',
    'Options:',
    '  --port         Port to use (default: 8080)',
    '  --rcode        Response status code (default: 200)',
    '  -u             Username for basic authentication (default: none)',
    '  -p             Password for basic authentication (default: none)',
    '  --verbose      Print request headers and body (default: no)',
    '',
    '  --help         Print this list and exit.',
    '',
    'Example:',
    'node app --port=8090 --verbose -u user@domain -p secret'
  ].join('\n'));
  process.exit();
} else {
	console.log('For more options run: node app --help\n');
}

const logger = {
	info: console.log,
	error: console.error
};

const options = {
	port: argv.port || parseInt(process.env.PORT, 10),
	statusCode: argv.rcode || 200,
	user: argv.u,
	pass: argv.p,
	verbose: !!argv.verbose
};

const server = new Server(logger, options);
server.listen();



// Termination //
/////////////////
if (process.platform === 'win32') {
  require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  }).on('SIGINT', () => process.emit('SIGINT'));
}

process.on('SIGINT', () => {
  logger.info(colors.red('alm-octane-webhooks-listener stopped.'));
  process.exit();
});

process.on('SIGTERM', () => {
  logger.info(colors.red('alm-octane-webhooks-listener stopped.'));
  process.exit();
});
