const dataset = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
const req = new XMLHttpRequest()




req.open('GET', dataset, true)
req.onload = () => {
    let data = JSON.parse(req.responseText)
    let baseTemp = data['baseTemperature']
    let values = data['monthlyVariance']

    // Canvas setup
    let svg = d3.select('#canvas')
    let width = 1200
    let height = 600
    let padding = 60
    svg.attr('width', width)
    svg.attr('height', height)

    // Define scales
    let yScale = d3.scaleTime()
        .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
        .range([padding, height - padding])

    let xScale = d3.scaleLinear()
        .domain([d3.min(values, (d) => {
            return d['year']
        }), d3.max(values, (d) => {
            return d['year']
        })])
        .range([padding, width - padding])


    //Setup axises
    let xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'))
    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0,' + (height - padding) + ')')

    let yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat('%B'))

    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding + ',0)')

    //Create tooltip to display selected bar values
    let tooltip = d3.select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('visibility', 'hidden')
        .style('width', 'auto')
        .style('height', 'auto')

    //Draw data points for scatter plot
    svg.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('data-month', (d) => {
            return d.month - 1
        })
        .attr('data-year', (d) => {
            return d.year
        })
        .attr('data-temp', (d) => {
            return baseTemp + d['variance']
        })
        .attr('height', (height - 2 * padding) / 12)
        .attr('y', (d) => {
            return yScale(new Date(0, d['month'] - 1, 0, 0, 0, 0, 0))
        })
        .attr('width', (d) => {
            return (width - 2 * padding) / (d3.max(values, (d) => {
                return d['year']
            }) - d3.min(values, (d) => {
                return d['year']
            }))
        })
        .attr('x', (d) => {
            return xScale(d.year)
        })
        .attr('fill', (d) => {
            let variance = d['variance']
            if (variance <= -2) {
                return '#fff33b'
            } else if (variance <= -1) {
                return '#fdc70c'
            } else if (variance <= 0) {
                return '#f3903f'
            } else if (variance <= 1) {
                return '#ED683C'
            } else {
                return '#e93e3a'
            }
        })

        //Code for tooltip updating 
        .on('mouseover', (d) => {

            tooltip.transition()
                .style('visibility', 'visible')
                .style('left', d3.event.pageX + 10 + 'px')
                .style('top', d3.event.pageY - 10 + 'px')
                .style('background-color', '#caf0f8')
                .text('Year ' + d['year'] + ' Month ' + d['month'] + ' Temperature ' + (baseTemp + d['variance']) + '℃')

            document.querySelector('#tooltip').setAttribute('data-year', d.year)

        })
        .on('mouseout', (d) => {
            tooltip.transition()
                .style('visibility', 'hidden')
        })
}

req.send()