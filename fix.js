const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');
code = code.replace('    await window.showAssistantDiagnosis(`Problema descrito por el cliente: "${userText}"`, \'Mecánica General\');\r\n});', '    });\r\n');
code = code.replace('    await window.showAssistantDiagnosis(`Problema descrito por el cliente: "${userText}"`, \'Mecánica General\');\n});', '    });\n');
fs.writeFileSync('main.js', code);
