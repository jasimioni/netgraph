const { exec } = require('child-process-promise');
const rrdtool = '/usr/bin/rrdtool';

exports.xport = params => {
    const cmd = [ rrdtool, 'xport', '--json', ...params ].join(' ');
    return exec(cmd)
    .then(result => {
        let lines = result.stdout.split("\n");
        lines[0] = '{';
        lines[1] = lines[1].replace(/meta/, '"meta"');
        let i = 6;
        while (! lines[i].match(/]/)) {
            lines[i] = lines[i].replace(/^(\s*)'/g, '$1"');
            lines[i] = lines[i].replace(/'(,)?/g, '"$1');
            i++;
        }
        var jsonData = JSON.parse(lines.join(''));
        return jsonData;
    });
}