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
    '  ---verbose     Print request headers and body (default: no)',
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
