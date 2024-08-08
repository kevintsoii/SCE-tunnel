# SCE Tunnel

Mirror local host websites to your domain.
Based off of [localtunnel](https://github.com/localtunnel/localtunnel).

## How it works

Interactions happen between:

1. hoster (localhost)
2. server (domain)
3. visitor (anyone on the internet)

The server

- Hosts an HTTP server with a Client Manager storing client IDs matching with a client. Requests are forwarded to the appropriate client.
- Clients pump requests to the hoster, and results are pumped back and displayed on the website.

The hoster

- Connected to the server through a TCP server for a two-way connection and reliable data delivery

The visitor

- Visits a url and indicates the client ID through domain.com/clientID/path
