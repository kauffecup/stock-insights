//------------------------------------------------------------------------------
// Copyright IBM Corp. 2015
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

import d3      from 'd3';
import Actions from '../Actions';

var StockVisualizerD3 = {};
var svg;
var html;
var bubble;
var diameter;

var legendRectSize = 18;
var legendSpacing = 3;

var colorRange = [
  // oranges from dark to light
  "#990000", "#d7301f", "#ef6548", "#fc8d59", "#fdbb84", "#fdd49e", "#fee8c8", "#fff7ec",
  //neutral grey
  "#f0f0f0",
  // blues from light to dark
  "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"
];
var colorLegend = colorRange.slice(0).reverse().map((c, i) => {
  var ret = {color: c};
  // TODO don't hardcode these
  if (i === 0) {
    ret.text = '(+) Change';
  } else if (i === 8) {
    ret.text = '';
  } else if (i === 16) {
    ret.text='(-) Change';
  } 
  return ret;
});
var selectedColor = '#737373';
var selectedTextColor = '#d9d9d9';

StockVisualizerD3.create = function (el, state) {
  diameter = Math.min(el.offsetWidth, el.offsetHeight);

  svg = d3.select(el).append('svg')
    .attr('width', diameter)
    .attr('height', diameter)
    .style('position', 'relative')
    .style('top', (el.offsetHeight-diameter)/2 + 'px') // center vertically
    .attr('class', 'bubble-chart-d3');

  html = d3.select(el).append('div')
    .style('width', diameter + 'px')
    .style('height', diameter + 'px')
    .style('position', 'absolute')
    .style('top', (el.offsetHeight-diameter)/2 + 'px') // center vertically
    .style('left', (el.offsetWidth-diameter)/2 + 'px') // center horizontally
    .attr('class', 'bubble-chart-text');

  var legendHeight = colorLegend.length * (legendRectSize + legendSpacing) - legendSpacing;
  var legend = d3.select(el).append('svg')
    .attr('class', 'bubble-legend')
    .style('position', 'absolute')
    .style('height', legendHeight + 'px')
    .style('width', '100px')
    .style('top', (el.offsetHeight - legendHeight)/2 + 'px')
    .style('left', 60 + 'px');

  // for each color in the legend, create a g and set its transform
  var legendKeys = legend.selectAll('.legend-key')
    .data(colorLegend)
    .enter()
    .append('g')
    .attr('class', 'legend-key')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var vert = i * height;
      return 'translate(' + 0 + ',' + vert + ')';
    });

  // for each <g> create a rect and have its color... be the color
  legendKeys.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', c => c.color)
    .style('stroke', c => c.color);

  // add necessary labels to the legend
  legendKeys.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(c => c.text);

  bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(3);

  this.update(el, state);
}

StockVisualizerD3.update = function (el, state) {
  var data = state.stockData;
  if (!data) return;
  data = data.map(s => ({
    value: s.close,
    symbol: s.symbol,
    change: s.change
  })).sort((s1, s2) => s2.value - s1.value);
  
  // define a color scale for our sentiment analysis
  var color = d3.scale.quantize()
    .domain([d3.min(data, d => d.change), d3.max(data, d => d.change)])
    .range(colorRange);

  // generate data with calculated layout values
  var nodes = bubble.nodes({children: data})
    .filter(function(d) { return !d.children; }); // filter out the outer bubble

  // assign new data to existing DOM 
  var circles = svg.selectAll('circle')
    .data(nodes, function(d) { return 'g' + d.symbol; });

  var labels = html.selectAll('.bubble-label')
    .data(nodes, function(d) { return 'g' + d.symbol; });

  // enter data -> remove, so non-exist selections for upcoming data won't stay -> enter new data -> ...

  // To chain transitions, 
  // create the transition on the updating elements before the entering elements 
  // because enter.append merges entering elements into the update selection

  var duration = 500;
  var delay = 0;

  // update - this is created before enter.append. it only applies to updating nodes.
  circles.transition()
    .duration(duration)
    .delay(function(d, i) {delay = i * 7; return delay;})
    .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
    .attr('r', function(d) { return d.r; })
    .style('opacity', 1)
    .style('fill', d => d.selected ? selectedColor : color(d.change));;

  labels.transition()
    .duration(duration)
    .delay(function(d, i) {delay = i * 7; return delay;})
    .style('height', d => 2 * d.r + 'px')
    .style('width', d => 2 * d.r + 'px')
    .style('left', d =>  d.x - d.r + 'px')
    .style('top', d =>  d.y - d.r + 'px')
    .style('opacity', 1);

  // enter - only applies to incoming elements (once emptying data)
  if (data.length) {
    circles.enter().append('circle')
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
      .attr('r', function(d) { return 0; })
      .attr('class', 'bubble')
      .style('fill', d => d.selected ? selectedColor : color(d.change))
      .transition()
      .duration(duration * 1.2)
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
      .attr('r', function(d) { return d.r; })
      .style('opacity', 1);

     labels.enter().append('div')
      .attr('class', 'bubble-label')
      .text(d => d.symbol)
      .on('click', (d,i) => {d3.event.stopPropagation(); Actions.loadArticlesForEntity(d);})
      .style('position', 'absolute')
      .style('height', d => 2 * d.r + 'px')
      .style('width', d => 2 * d.r + 'px')
      .style('left', d =>  d.x - d.r + 'px')
      .style('top', d =>  d.y - d.r + 'px')
      .style('opacity', 0)
      .transition()
      .duration(duration * 1.2)
      .style('opacity', 1);
  }

  // exit
  circles.exit()
    .transition()
    .duration(duration)
    .attr('transform', function(d) { 
      var dy = d.y - diameter/2;
      var dx = d.x - diameter/2;
      var theta = Math.atan2(dy,dx);
      var destX = diameter * (1 + Math.cos(theta) )/ 2;
      var destY = diameter * (1 + Math.sin(theta) )/ 2; 
      return 'translate(' + destX + ',' + destY + ')'; })
    .attr('r', function(d) { return 0; })
    .remove();

  labels.exit()
    .transition()
    .duration(duration)
    .style('top', function(d) { 
      var dy = d.y - diameter/2;
      var dx = d.x - diameter/2;
      var theta = Math.atan2(dy,dx);
      var destY = diameter * (1 + Math.sin(theta) )/ 2; 
      return destY + 'px'; })
    .style('left', function(d) { 
      var dy = d.y - diameter/2;
      var dx = d.x - diameter/2;
      var theta = Math.atan2(dy,dx);
      var destX = diameter * (1 + Math.cos(theta) )/ 2;
      return destX + 'px'; })
    .style('opacity', 0)
    .style('width', 0)
    .style('height', 0)
    .remove();
}

StockVisualizerD3.destroy = function (el) {}

export default StockVisualizerD3;
