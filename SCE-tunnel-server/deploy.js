import 'localenv';
import optimist from 'optimist';

import log from 'book';
import Debug from 'debug';

import CreateServer from './server.js';

const debug = Debug('localtunnel');

const argv = optimist
    .usage('Usage: $0 --port [num]')
    .options('secure', {
        default: false,
        describe: 'use this flag to indicate proxy over https'
    })
    .options('port', {
        default: '80',
        describe: 'listen on this port for outside requests'
    })
    .options('address', {
        default: '0.0.0.0',
        describe: 'IP address to bind to'
    })
    .options('max-sockets', {
        default: 10,
        describe: 'maximum number of tcp sockets each client is allowed to establish at one time (the tunnels)'
    })
    .argv;

if (argv.help) {
    optimist.showHelp();
    process.exit();
}

console.log('creating server')

const server = CreateServer({
    max_tcp_sockets: argv['max-sockets'],
    secure: argv.secure,
});

console.log('server created')

server.listen(argv.port, argv.address, () => {
    console.log('server listening on port: %d', server.address().port);
});

process.on('SIGINT', () => {
    process.exit();
});

process.on('SIGTERM', () => {
    process.exit();
});

process.on('uncaughtException', (err) => {
    log.error(err);
});

process.on('unhandledRejection', (reason, promise) => {
    log.error(reason);
});
