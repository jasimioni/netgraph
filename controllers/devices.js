const devicesModel = require('../models/devices');

exports.listDevices = (req, res, next) => {
    devicesModel.listDevices()
    .then( devices => {
        res.render('devices/list', {
            devices : devices
        });
    }).catch(err => {
        console.log(err.stack);
        res.status(500).render('500', { err: err });
    });
}

exports.listNodeInterfaces = (req, res, next) => {
    const node = req.params.node;
    const type = req.params.type;
    const oidindex = req.params.oidindex;
    console.log("Entered Path with params:");
    console.log(req.params);
    devicesModel.listAllInterfaces( { node : node })
    .then( interfaces => {
        res.render('devices/listNodeInterfaces', {
            interfaces : interfaces,
            node     : node,
            type     : type,
            oidindex : oidindex
        });
    }).catch(err => {
        console.log(err);
        res.status(500).render('500', { err: err });
    });
}

exports.listInterfaces = (req, res, next) => {
    devicesModel.listAllInterfaces( req.body )
    .then( interfaces => {
        res.json(interfaces);
    }).catch(err => {
        res.status(500).render('500', { err: err });
    });
}