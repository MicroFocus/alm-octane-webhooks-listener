# alm-octane-webhooks-listener
HTTP listener for ALM Octane webhooks with basic authentication.

## Installation:

Checkout this repository locally. In the alm-octane-webhooks-listener directory run:

    npm install

## Usage:

	node app [options]

#### Available Options:
	--port         Port to use (default: 8080)
	--rcode        Response status code (default: 200)
	-u             Username for basic authentication (default: none)
	-p             Password for basic authentication (default: none)
	---verbose     Print request headers and body (default: no)

	--help         Print help and exit.',

#### Example:
    node app --port=8090 --verbose -u user@domain -p secret

