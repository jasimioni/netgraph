document.addEventListener("DOMContentLoaded", function(event) { 
    document.querySelectorAll('.lnk-plot-graph').forEach(item => {
       item.addEventListener('click', function(event) {
            var node = item.getAttribute('node');
            var type = item.getAttribute('type');
            var oidindex = item.getAttribute('oidindex');
            var url = '/devices/' + [ node, type, oidindex ].join('/');

            window.history.pushState({ node : node, type : type, oidindex : oidindex }, "", url);
            console.log(url);
            console.log(window.history.length);

            document.querySelectorAll('.pure-menu-selected').forEach(item => {
                item.classList.remove('pure-menu-selected');
            });

            this.parentElement.classList.add('pure-menu-selected');

            plotGraph(node, type, oidindex);
       })
    });

    document.getElementById('cstGraphLegend').onclick = function (event) {
        if (event.target.className == 'dygraph-legend-line') {
            if (matches = event.target.nextSibling.textContent.match(/(R|T)X/)) {
                var pos = matches[1] == 'R' ? 0 : 1;
                var visibility = dyGraph.visibility()[pos];
                visibility = !visibility;
                dyGraph.setVisibility(pos, visibility);
            };
        }
    }
});

window.onpopstate = (event) => {
    if (event.state) {
        plotGraph(event.state.node, event.state.type, event.state.oidindex);
    } else {
        if (matches = location.href.match(/devices\/(.*)\/(.*)\/(.*)/)) {
            plotGraph(matches[1], matches[2], matches[3]);
        } else {
            document.getElementById("graph").innerHTML = '';
        }
    }
}

function plotGraph(node, type, oidindex) {
    var url = [ '', 'graph', node, type, oidindex ].join('/');
    fetch(url, {
        method : 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        // , body: JSON.stringify({ node : node, type : type, oidindex : oidindex })
    })
    .then(response => {
        return response.json();
    })
    .then(json => {
        var tzoffset = (new Date()).getTimezoneOffset() * 60000;
        dyGraph = new Dygraph(
            document.getElementById("graph"),
            json.graphData,
            {
                title : json.graphTitle,
                labels: ['X', 'RX', 'TX' ],
                animatedZooms: true,
                labelsKMG2 : true,
                legend : 'always',
                series : {
                    TX : {
                        fillGraph : true
                    }
                },
                zoomCallback: ( minDate, maxDate, yRange ) => {
                    console.log(minDate, maxDate, yRange);
                },                    
                axes : {
                    x : {
                        valueFormatter: x => {
                            [ date, time ] = new Date(x * 1000 - tzoffset).toISOString().split(/[T\.]/);
                            return date + ' ' + time;
                        },
                        axisLabelFormatter: x => {
                            [ date, time ] = new Date(x * 1000 - tzoffset).toISOString().split(/[T\.:]/);
                            return date + ' ' + time + 'h';
                        }
                    }
                },
                labelsDiv: 'cstGraphLegend',
                legendFormatter: function(data) {
                    if (data.x == null) {
                        return '<br>' + data.series.map(function(series) { return series.dashHTML + ' ' + series.labelHTML }).join('<br>');
                    }

                    var html = data.xHTML;
                    data.series.forEach(function(series) {
                        if (!series.isVisible) return;
                        var labeledData = series.labelHTML + ': ' + series.yHTML;
                        if (series.isHighlighted) {
                            labeledData = '<b>' + labeledData + '</b>';
                        }
                        html += '<br>' + series.dashHTML + ' ' + labeledData;
                    });
                    return html;                    
                }
            }
        );
    })
    .catch(err => {
        alert(err);
    })
}
    