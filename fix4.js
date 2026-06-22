const fs = require('fs');
let lines = fs.readFileSync('main.js', 'utf8').split('\n');
// Let's just find the end of the file
while(lines.length > 0 && lines[lines.length-1].trim() === '') {
    lines.pop();
}

// Ensure the last 3 lines are the proper closure
lines.pop();
lines.pop();
lines.pop();
lines.pop(); // remove } if present

lines.push('                }'); // close if (serviciosList)
lines.push('            }'); // close if (filtered.length === 0)
lines.push('        });');
lines.push('    });');
lines.push('});');
fs.writeFileSync('main.js', lines.join('\n') + '\n');
