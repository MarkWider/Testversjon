// Only changes the preview artifact. The application's normal root stays intact.
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const destination = process.argv[2]
if (!destination) throw new Error('Supply the existing Sites checkout path')
const output = resolve(destination, 'dist')
await mkdir(output, { recursive: true })
await cp(resolve('dist'), output, { recursive: true })
await mkdir(resolve(output, 'pilot'), { recursive: true })
await cp(resolve('dist/index.html'), resolve(output, 'pilot/index.html'))
const uxPath = resolve(output, 'ux-exploration/index.html')
const html = await readFile(uxPath, 'utf8')
await writeFile(uxPath, html.replaceAll('href="/"', 'href="/pilot/index.html"'))
await writeFile(resolve(output, 'index.html'), `<!doctype html>
<html lang="no"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="0;url=/ux-exploration/index.html">
<title>Norge i tall – forslag C</title></head>
<body><a href="/ux-exploration/index.html">Åpne forslag C – Tall som forklarer Norge</a></body></html>`)
console.log('Packaged preview: root opens C; A/B retained; pilot at /pilot/index.html')
