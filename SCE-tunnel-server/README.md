# SCE tunnel server

Based off https://github.com/localtunnel/server

## How to run:

```
node deploy.js
```

## Run on Docker:

```
docker build -t tunnel-image .
docker run -d -p 5000:5000 --name sce-tunnel tunnel-image
```
