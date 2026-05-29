const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file === 'route.ts' && fullPath.includes('[')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Fix param types
            content = content.replace(/{ params }: { params: { (\w+): string } }/g, '{ params }: { params: Promise<{ $1: string }> }');
            content = content.replace(/{ params }: { params: { (\w+): string; } }/g, '{ params }: { params: Promise<{ $1: string }> }');
            content = content.replace(/{ params }: { params: { id: string } }/g, '{ params }: { params: Promise<{ id: string }> }');
            
            // Fix await params
            content = content.replace(/const { (\w+) } = params;/g, 'const { $1 } = await params;');
            
            fs.writeFileSync(fullPath, content);
        }
    }
}

processDir('/Users/glorylion/topicnest/src/app/api');
console.log('Done fixing Next.js params');
