const fs = require('fs');
let lines = fs.readFileSync('main.js', 'utf8').split('\n');
// trim end
while(lines.length > 0 && lines[lines.length-1].trim() === '') {
    lines.pop();
}
// check last lines
if (lines[lines.length-1].trim() === '});' && lines[lines.length-2].trim() === '});') {
    // we have extra });?
    // Let's just fix it manually.
    // The structure is:
    // serviceButtons.forEach(btn => {
    //     btn.addEventListener('click', () => { ... });
    // });
    // So the end should be `    });\n});\n`
}
// actually let's just write exactly what it should be
lines = lines.slice(0, lines.length - 5);
lines.push('        });');
lines.push('    });');
lines.push('});');
fs.writeFileSync('main.js', lines.join('\n') + '\n');
