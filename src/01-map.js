import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = {
  top: 0,
  right: 10,
  bottom: 0,
  left: 10
}

let width = 700 - margin.left - margin.right
let height = 400 - margin.top - margin.bottom

// Add the canvas
let canvas = d3
  .select('#chart-1')
  .append('canvas')
  .attr('height', height + margin.left + margin.right)
  .attr('width', width + margin.left + margin.right)

// Get the context
var context = canvas.node().getContext('2d')
context.translate(margin.left, margin.top)

var projection = d3.geoNaturalEarth1()
var path = d3
  .geoPath()
  .projection(projection)
  .context(context)

d3.json(require('./world.topojson')).then(ready)

function ready(world) {
  // Let's pull out the countries...
  var countries = topojson.feature(world, world.objects.countries)

  // ...and fit the projection to match the size of our canvas
  projection.fitSize([width, height], countries)
  // ...and zoom out a little bit
  // projection.scale(projection.scale() * 0.95)

  // Let's draw the oceans!
  context.beginPath()
  path({'type': 'Sphere'})
  context.fillStyle = 'cyan'
  context.fill()
  context.lineWidth = 3
  context.stroke()

  console.log(countries.features)

  // If you want to draw each feature separately
  context.fillStyle = 'red'
  context.strokeStyle = 'purple'
  context.lineWidth = 2
  context.beginPath()
  countries.features.forEach(country => {
    path(country)
  })
  context.fill()
  context.stroke()

  // If you just want to draw outlines
  // context.beginPath()
  // path(topojson.mesh(world))
  // context.strokeStyle = 'black'
  // context.fillStyle = 'black'
  // context.stroke()
}





