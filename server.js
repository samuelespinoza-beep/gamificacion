// server.js
require("dotenv").config();
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next');
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            /* Se agregan los comandos recomendados para server en next
            @url: https://nextjs.org/docs/advanced-features/custom-server  */
            const parsedUrl = parse(req.url, true)
            await handle(req, res, parsedUrl)
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    }).once('error', (err) => {
        console.error(err);
        process.exit(1);
    }).listen(port, (err) => {
        if (err) throw err
        console.log(`> Ready Suplementos on http://${hostname}:${port}`)
    })
})
