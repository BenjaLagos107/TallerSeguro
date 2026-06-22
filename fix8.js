const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

const targetStr = `        } catch (error) {
            errorMsg.textContent = "Error: " + error.message;
            errorMsg.classList.add('hidden');
            showNotification(error.message, "error");
        }`;

const replaceStr = `        } catch (error) {
            errorMsg.textContent = "Error: " + error.message;
            errorMsg.classList.remove('hidden');
            showNotification(error.message, "error");
        }`;

// Try normal replace
let newCode = code.replace(targetStr, replaceStr);

// If it didn't work because of line endings, try standardizing
if (newCode === code) {
    code = code.replace(/\\r\\n/g, '\\n');
    let targetStrLf = targetStr.replace(/\\r\\n/g, '\\n');
    let replaceStrLf = replaceStr.replace(/\\r\\n/g, '\\n');
    newCode = code.replace(targetStrLf, replaceStrLf);
}

fs.writeFileSync('main.js', newCode);
