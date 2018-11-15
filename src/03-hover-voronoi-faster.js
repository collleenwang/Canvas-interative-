import * as d3 from 'd3'
import { Delaunay } from 'd3-delaunay'

let margin = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 50
}

let width = 700 - margin.left - margin.right
let height = 400 - margin.top - margin.bottom

// Add the container the SVG and canvas will live in
let container = d3
  .select('#chart-3')
  .append('div')
  .style('position', 'relative')

let tooltip = d3.select('body')
  .append('div')
  .style('position', 'absolute')
  .style('left', 0)
  .style('top', 0)
  .html("HELLLLOOOO I'm a tooltip")

// Add the canvas
let canvas = container
  .append('canvas')
  .style('position', 'absolute')
  .style('top', 0)
  .style('left', 0)
  .style('z-index', 10)
  .attr('height', height + margin.left + margin.right)
  .attr('width', width + margin.left + margin.right)

var context = canvas.node().getContext('2d')
context.translate(margin.left, margin.top)

let svg = container
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var xPositionScale = d3.scaleLinear().range([0, width])
var yPositionScale = d3.scaleLinear().range([height, 0])
var radiusScale = d3.scaleSqrt().range([0, 10])
var colorScale = d3.scaleOrdinal(d3.schemeCategory10)

// Not doing anything, but it's nice to always keep a context
d3.csv(require('./imdb-5000.csv')).then(ready)

function ready(datapoints) {
  var maxBudget = d3.max(datapoints, d => +d.budget)
  var maxRevenue = d3.max(datapoints, d => +d.revenue)

  // x position is our imdb rating
  xPositionScale.domain([0, 10])
  yPositionScale.domain([0, maxBudget])
  radiusScale.domain([0, maxRevenue])

  // Adding a new column for x, y, radius and color
  datapoints.forEach(d => {
    d.x = xPositionScale(d.rating)
    d.y = yPositionScale(d.budget)
    d.r = radiusScale(d.revenue)
    d.color = colorScale(d.content_rating)
  })

  // Add a bit of transparency
  context.globalAlpha = 0.5

  // Draw using those columns
  datapoints.forEach(d => {
    context.beginPath()
    context.arc(d.x, d.y, d.r, 0, Math.PI * 2)
    context.closePath()
    context.fillStyle = d.color
    context.fill()
  })

  context.clearRect(0, height, width, height + margin.bottom)

  var yAxis = d3
    .axisLeft(yPositionScale)
    .tickSize(-width)
    .tickValues([0, 50000000, 1000000000, 200000000, 300000000])
    .tickFormat(d3.format('$,.0s'))

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  var xAxis = d3.axisBottom(xPositionScale)

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .lower()

  const delaunay = Delaunay.from(
    datapoints,
    d => xPositionScale(d.rating),
    d => yPositionScale(d.budget)
  )

  const voronoi = delaunay.voronoi([0, 0, width, height])
  console.log(voronoi)

  // // We're gonna draw some stuff!
  // context.beginPath()
  // // Draw the borders between regions
  // voronoi.render(context)
  // // And draw the outside border as well
  // voronoi.renderBounds(context)
  // // Outline it in black
  // context.strokeStyle = '#000'
  // context.stroke()

  var highlight = svg.append('circle')
    .attr('stroke-width', 2)
    .attr('stroke', 'red')
    .attr('fill', 'none')
    .attr('r', 10)
    .attr('opacity', 0)

  canvas.on('mousemove', function() {
    const [mouseX, mouseY] = d3.mouse(this)
    console.log('You are at', mouseX, mouseY)

    const index = delaunay.find(mouseX - margin.left, mouseY - margin.top)
    const d = datapoints[index]
    console.log('You are looking at', d)

    tooltip
      .style('left', d3.event.pageX + 'px')
      .style('top', d3.event.pageY + 'px')

    highlight
      // .transition()
      .attr('cx', xPositionScale(d.rating))
      .attr('cy', yPositionScale(d.budget))
      .attr('r', radiusScale(d.revenue))
      .attr('opacity', 1)
  })
}




