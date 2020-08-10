const { devicesdb } = require('../utils/databases');
const SqlGenerator  = require('sql-generator');
const sqlgen = new SqlGenerator();

exports.listDevices = () => {
    return devicesdb.query('SELECT DISTINCT node FROM equip_interfaces ORDER BY node')
    .then( ( [ result, metadata ] ) => {
        const devList = [];

        result.map( value => {
            devList.push(value.node);
        });

        return devList;
    });
};

exports.getInterfaceInfo = ( node, oidindex, type ) => {
    const table = {
        interfaces : 'equip_interfaces',
        vrtrif     : 'equip_vrtr_interfaces',
        sap        : 'equip_saps'
    };

    let { sql, values } = sqlgen.select( table[type], '*', { node : node, oidindex : oidindex });

    return devicesdb.query(sql, { bind: values })
    .then( ( [ result, metadata ] ) => {
        return result[0];
    });
};

listInterfaces = ( params, table, fields ) => {
    const sqlFilter = {};

    if ('node' in params) {
        sqlFilter['UPPER(node)'] = params.node.toUpperCase();
    }

    if ('filter' in params) {
        const or = {};
        fields.forEach( (field) => {
            or[`${field}::text`] = { '~*' : params.filter };
        });
        sqlFilter['-or'] = or;
    }

    let { sql, values } = sqlgen.select( table, 
                                         [ 'node', ...fields, 'oidindex' ], 
                                         sqlFilter, 
                                         { order : [ 'node', 'if_name' ] });

    console.log(sql, values);                                     
    return devicesdb.query(sql, { bind: values });
}

exports.listAllInterfaces = params => {
    console.log("Listing all interfaces: ", params);
    const resData = [];                                         
    return listInterfaces(params, 'equip_interfaces', [ 'if_name', 'descr', 'alias', 'label', 'speed' ])
    .then( ( [ result, metadata ] ) => {
        resData.push(...result.map( row => {
            row.type = 'interfaces';
            return row;
        }));
        return listInterfaces(params, 'equip_vrtr_interfaces', [ 'if_name', 'descr', 'svlan', 'cvlan' ]);
    })
    .then( ( [ result, metadata ] ) => {
        resData.push(...result.map( row => {
            row.type = 'vrtrif';
            return row;
        }));
        return listInterfaces(params, 'equip_saps', [ 'if_name', 'descr', 'svlan', 'cvlan', 
                                                      'ingress_sched_policy', 'egress_sched_policy' ]);
    })
    .then( ( [ result, metadata ] ) => {
        resData.push(...result.map( row => {
            row.type = 'sap';
            return row;
        }));
        return resData;
    });
};

