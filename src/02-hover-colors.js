import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
}

let width = 700 - margin.left - margin.right
let height = 400 - margin.top - margin.bottom

// Add the canvas
let canvas = d3
  .select('#chart-2')
  .append('canvas')
  .attr('height', height + margin.left + margin.right)
  .attr('width', width + margin.left + margin.right)

// Get the context
var context = canvas.node().getContext('2d')
context.translate(margin.left, margin.top)

// Create a random other canvas
var offscreen = d3
  .select('#chart-2')
  .append('canvas')
  .attr('height', height + margin.left + margin.right)
  .attr('width', width + margin.left + margin.right)
  .style('display', 'none') // hide the canvas

var picker = offscreen.node().getContext('2d')

var projection = d3.geoNaturalEarth1()
var path = d3.geoPath().projection(projection).context(context)
var colorToNode = {}

d3.json(require('./world.topojson')).then(ready)

function getColor(i) {
  var red = i % 256
  var green = Math.floor(i / 256) % 256
  var blue = Math.floor(i / 65536) % 256
  return `rgb(${red},${green},${blue})`
}

function ready(world) {
  var countries = topojson.feature(world, world.objects.countries)

  projection.fitSize([width, height], countries)

  // console.log(getColor(0))
  // console.log(getColor(1))
  // console.log(getColor(2))
  // console.log(getColor(3))
  // console.log(getColor(300))
  // console.log(getColor(3000))
  // console.log(getColor(300000))

  // Let's draw on the fake canvas first
  path.context(picker)
  countries.features.forEach((country, i) => {
    var color = getColor(i * 100)
    // console.log(color)
    colorToNode[color] = country
    picker.strokeStyle = color
    picker.fillStyle = color
    picker.beginPath()
    path(country)
    picker.fill()
    picker.stroke()
  })

  // Function for drawing
  function draw() {
    path.context(context)
    context.clearRect(
      0,
      0,
      width + margin.left + margin.right,
      height + margin.top + margin.bottom
    )
    path({ type: 'Sphere' })
    context.fillStyle = '#63D1F4'
    context.fill()

    context.fillStyle = '#e1e1e1'
    context.strokeStyle = '#666666'
    countries.features.forEach(country => {
      context.beginPath()
      path(country)
      context.fill()
      context.stroke()
    })
  }

  canvas.on('mousemove', function() {
    const [mouseX, mouseY] = d3.mouse(this)
    console.log('I saw your mouse move')

    var color = picker.getImageData(mouseX, mouseY, 1, 1).data
    var key = `rgb(${color.slice(0, 3).toString()})`
    console.log(key)
    var country = colorToNode[key]
    console.log("Country is", country)
    console.log("data is", country.properties)

    // Hey! Clear the screen and redraw everything
    // in the normal color scheme
    draw()
    // Draw that country we're hovering on
    // and fill it in with red
    context.beginPath()
    context.fillStyle = 'red'
    path(country)
    context.fill()
  })

  draw()
}
