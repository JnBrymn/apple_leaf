/**
 * One-time splitter: legacy index.html → CSS, markup, game script.
 * Run: node scripts/extract-restaurant-rush.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const legacyPath = path.join(root, 'public/legacy/restaurant-rush/index.html')
const outDir = path.join(root, 'src/games/restaurant-rush')

const html = fs.readFileSync(legacyPath, 'utf8')

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/)
const bodyMatch = html.match(/<body>([\s\S]*?)<script>/)
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/)

if (!styleMatch || !bodyMatch || !scriptMatch) {
  console.error('Could not parse legacy HTML sections')
  process.exit(1)
}

let css = styleMatch[1]
css = css.replace(/\bbody\b/g, '.root')
css = css.replace(/^\s*\*\s*\{/m, '.root * {')

const markup = bodyMatch[1].trim()
let script = scriptMatch[1]

// Scope imperative DOM to game root instead of document.body
script = script.replace(/document\.body/g, 'root')
script = script.replace(/document\.getElementById\(/g, 'getEl(')
script = script.replace(/document\.querySelectorAll\(/g, 'root.querySelectorAll(')
script = script.replace(/document\.querySelector\(/g, 'root.querySelector(')
script = script.replace(/document\.addEventListener\(/g, 'root.addEventListener(')

fs.mkdirSync(outDir, { recursive: true })
fs.mkdirSync(path.join(outDir, 'engine'), { recursive: true })

fs.writeFileSync(path.join(outDir, 'restaurant-rush.global.css'), css.trim() + '\n')
fs.writeFileSync(path.join(outDir, 'engine/gameMarkup.html'), markup + '\n')
fs.writeFileSync(path.join(outDir, 'engine/gameLogic.raw.js'), script.trim() + '\n')

console.log('Extracted:')
console.log('  restaurant-rush.global.css', css.length, 'chars')
console.log('  engine/gameMarkup.html', markup.length, 'chars')
console.log('  engine/gameLogic.raw.js', script.length, 'chars')
