import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.join(__dirname, 'dist')
const feedbackFile = path.join(__dirname, 'feedback.json')
const port = 3000

const ensureDataFile = () => {
  if (!fs.existsSync(feedbackFile)) {
    fs.writeFileSync(feedbackFile, '[]', 'utf8')
  }
}

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(payload))
}

const serveStaticFile = (res, filePath) => {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404)
      res.end('Not found')
      return
    }

    const extension = path.extname(filePath)
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
    }

    res.writeHead(200, { 'Content-Type': contentTypes[extension] || 'application/octet-stream' })
    res.end(content)
  })
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end()
    return
  }

  if (req.url === '/api/feedback' && req.method === 'GET') {
    ensureDataFile()
    const data = JSON.parse(fs.readFileSync(feedbackFile, 'utf8'))
    sendJson(res, 200, data)
    return
  }

  if (req.url === '/api/feedback' && req.method === 'POST') {
    ensureDataFile()

    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}')
        const name = String(parsed.name || '').trim()
        const remark = String(parsed.remark || '').trim()

        if (!name || !remark) {
          sendJson(res, 400, { message: 'Name and remark are required.' })
          return
        }

        const allFeedback = JSON.parse(fs.readFileSync(feedbackFile, 'utf8'))
        const entry = {
          id: Date.now() + '-' + Math.random().toString(16).slice(2),
          name,
          remark,
        }

        const updated = [entry, ...allFeedback]
        fs.writeFileSync(feedbackFile, JSON.stringify(updated, null, 2), 'utf8')
        sendJson(res, 201, entry)
      } catch {
        sendJson(res, 400, { message: 'Invalid JSON payload.' })
      }
    })
    return
  }

  if (req.url === '/') {
    serveStaticFile(res, path.join(distDir, 'index.html'))
    return
  }

  const safePath = req.url === '/' ? '/index.html' : req.url
  const requestedPath = path.join(distDir, safePath)

  if (requestedPath.startsWith(distDir)) {
    serveStaticFile(res, requestedPath)
    return
  }

  res.writeHead(403)
  res.end('Forbidden')
})

server.listen(port, () => {
  console.log(`App running on http://localhost:${port}`)
})
