const fs = require('fs');
let content = fs.readFileSync('main.js', 'utf8');
content = content.replace(/\\s*\\}\\s*\\}\\);\\s*\\}\\);\\s*\\}\\);\\s*$/g, '\n                }\n            }\n        });\n    });\n});\n');
fs.writeFileSync('main.js', content);
