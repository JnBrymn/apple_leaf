# Fire Field Simulation in CoffeeScript
# Controls: tree growth chance, lightning chance, simulation speed
# Click to start fires, watch them spread!

canvas = document.getElementById 'canvas'
ctx = canvas.getContext '2d'

CELL_SIZE = 4
COLS = Math.floor canvas.width / CELL_SIZE
ROWS = Math.floor canvas.height / CELL_SIZE

grid = []
nextGrid = []
running = true
frameCount = 0

# States: 0 = empty, 1 = tree, 2 = fire, 3 = burned
initGrid = ->
	grid = []
	nextGrid = []
	for y in [0...ROWS]
		grid[y] = []
		nextGrid[y] = []
		for x in [0...COLS]
			grid[y][x] = 0
			nextGrid[y][x] = 0

draw = ->
	ctx.fillStyle = '#000'
	ctx.fillRect 0, 0, canvas.width, canvas.height
	
	for y in [0...ROWS]
		for x in [0...COLS]
			state = grid[y][x]
			px = x * CELL_SIZE
			py = y * CELL_SIZE
			
			if state is 1  # Tree
				ctx.fillStyle = '#228B22'
			else if state is 2  # Fire
				ctx.fillStyle = "hsl(#{Math.random() * 30 + 10}, 100%, #{50 + Math.random() * 20}%)"
			else if state is 3  # Burned
				ctx.fillStyle = '#1a1a1a'
			else  # Empty
				ctx.fillStyle = '#000'
			
			ctx.fillRect px, py, CELL_SIZE, CELL_SIZE

countNeighbors = (x, y, state) ->
	count = 0
	for dy in [-1..1]
		for dx in [-1..1]
			continue if dx is 0 and dy is 0
			nx = x + dx
			ny = y + dy
			if nx >= 0 and nx < COLS and ny >= 0 and ny < ROWS
				count++ if grid[ny][nx] is state
	count

update = ->
	treeChance = parseFloat(document.getElementById('treeChance').value) / 10000
	lightningChance = parseFloat(document.getElementById('lightningChance').value) / 100000000
	
	# Copy current grid to next
	for y in [0...ROWS]
		for x in [0...COLS]
			nextGrid[y][x] = grid[y][x]
	
	# Update each cell
	for y in [0...ROWS]
		for x in [0...COLS]
			current = grid[y][x]
			
			if current is 0  # Empty
				# Random tree growth
				nextGrid[y][x] = 1 if Math.random() < treeChance
			else if current is 1  # Tree
				# Check if fire nearby
				fireNeighbors = countNeighbors x, y, 2
				if fireNeighbors > 0
					nextGrid[y][x] = 2  # Tree catches fire
				else
					# Random lightning strike
					nextGrid[y][x] = 2 if Math.random() < lightningChance
			else if current is 2  # Fire
				nextGrid[y][x] = 3  # Fire becomes burned
			else if current is 3  # Burned
				# Eventually becomes empty (very slowly)
				nextGrid[y][x] = 0 if Math.random() < 0.01
	
	# Swap grids
	temp = grid
	grid = nextGrid
	nextGrid = temp

gameLoop = ->
	if running
		speed = parseInt document.getElementById('speed').value
		frameCount++
		
		update() if frameCount % (101 - speed) is 0
		draw()
	requestAnimationFrame gameLoop

# Controls
document.getElementById('treeChance').addEventListener 'input', (e) ->
	value = (parseFloat(e.target.value) / 10000).toFixed 6
	document.getElementById('treeChanceValue').textContent = value + '%'

document.getElementById('lightningChance').addEventListener 'input', (e) ->
	value = (parseFloat(e.target.value) / 100000000).toFixed 8
	document.getElementById('lightningValue').textContent = value + '%'

document.getElementById('speed').addEventListener 'input', (e) ->
	document.getElementById('speedValue').textContent = e.target.value

document.getElementById('playPause').addEventListener 'click', ->
	running = not running
	document.getElementById('playPause').textContent = if running then 'Pause' else 'Play'

document.getElementById('reset').addEventListener 'click', ->
	initGrid()
	draw()

document.getElementById('clear').addEventListener 'click', ->
	initGrid()
	draw()

# Click to start fire
canvas.addEventListener 'click', (e) ->
	rect = canvas.getBoundingClientRect()
	x = Math.floor (e.clientX - rect.left) / CELL_SIZE
	y = Math.floor (e.clientY - rect.top) / CELL_SIZE
	
	if x >= 0 and x < COLS and y >= 0 and y < ROWS
		grid[y][x] = 2 if grid[y][x] is 1  # Only light trees on fire

# Initialize
initGrid()
draw()
gameLoop()

