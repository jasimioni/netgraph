const devicesModel = require('../models/devices');
const rrdModel     = require('../models/rrd');

const rrddir = '/opt/rrddata';

exports.graph = (req, res, next) => {
    const { node, type, oidindex } = req.params;
    console.log(req.params);
    let graphInfo = {};
    devicesModel.getInterfaceInfo(node, oidindex, type)
    .then( info => {
        graphInfo.title = info.if_name + ' ' + info.alias;

        const rrdfile = [ rrddir, type, node, oidindex + '.rrd' ].join('/');
        const inds  = type === 'interfaces' ? 'inoctets'  : 'rxbytes';
        const outds = type === 'interfaces' ? 'outoctets' : 'txbytes';

        return rrdModel.xport([ '--end', 'now', '--start', 'end-1d',
                                `DEF:ds0=${rrdfile}:${inds}:AVERAGE`, `DEF:ds1=${rrdfile}:${outds}:AVERAGE`,
                                'CDEF:ds0x=ds0,8,*', 'CDEF:ds1x=ds1,8,*',
                                'XPORT:ds0x:in XPORT:ds1x:ou' ]);
    })
    .then ( data => {
        // console.log(JSON.stringify(data, null, 4));;
        const graphData = [];
        let ts   = data.meta.start;
        let step = data.meta.step;
        data.data.forEach( row => {
            graphData.push( [ ts, ...row ] );
            ts += step;
        });
        res.json({
            graphTitle : graphInfo.title,
            graphData  : graphData
        });
    })
    .catch(err => {
        res.status(500).render('500', { err: err });
    });
}