import Koa from 'koa';
import Debug from 'debug';
import http from 'http';
import { hri } from 'human-readable-ids';
import Router from 'koa-router';

import ClientManager from './lib/ClientManager.js';

const debug = Debug('server');

export default function(opt) {
    opt = opt || {};

    const landingPage = opt.landing || 'https://localtunnel.github.io/www/';

    function GetClientIdFromRequest(req) {
        const referrer = req.headers.referer || req.headers.referrer;
        return referrer?.toLowerCase().split('/').pop() || req.url.toLowerCase().split('/')[1];
    }

    const manager = new ClientManager(opt);

    const schema = opt.secure ? 'https' : 'http';

    const app = new Koa();
    const router = new Router();

    router.get('/api/status', async (ctx, next) => {
        const stats = manager.stats;
        ctx.body = {
            tunnels: stats.tunnels,
            mem: process.memoryUsage(),
        };
    });

    router.get('/api/tunnels/:id/status', async (ctx, next) => {
        const clientId = ctx.params.id;
        const client = manager.getClient(clientId);
        if (!client) {
            ctx.throw(404);
            return;
        }

        const stats = client.stats();
        ctx.body = {
            connected_sockets: stats.connectedSockets,
        };
    });

    router.get('/createTunnel', async (ctx, next) => {
        let requestedPath = ctx.query.path;

        if (requestedPath === undefined) {
            requestedPath = hri.random();
        }
        if (! /^(?:[a-z0-9\-]{3,50})$/.test(requestedPath)) {
            const msg = 'Requested path must be lowercase, between 4 and 50 characters, and contain only hypens or alphanumeric characters.';
            ctx.status = 403;
            ctx.body = {
                message: msg,
            };
            return;
        }

        debug('making new client with id %s', requestedPath);
        const info = await manager.newClient(requestedPath);
        const url = schema + '://' + ctx.request.host + '/' + info.id;
        info.url = url;
        ctx.body = info;
        return;
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    app.use(async (ctx, next) => {
        const path = ctx.request.path;

        // no client, and not root endpoint
        if (path !== '/') {
            ctx.throw(404);
            return;
        }

        ctx.redirect(landingPage);
    });

    const server = http.createServer();

    const appCallback = app.callback();

    server.on('request', (req, res) => {
        const clientId = GetClientIdFromRequest(req);
        const client = manager.getClient(clientId);

        if (!client) {
            appCallback(req, res);
            return;
        }

        client.handleRequest(req, res);
    });

    server.on('upgrade', (req, socket, head) => {
        const clientId = GetClientIdFromRequest(req);
        const client = manager.getClient(clientId);
        
        if (!client) {
            socket.destroy();
            return;
        }

        client.handleUpgrade(req, socket);
    });

    return server;
};
