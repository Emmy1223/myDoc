// Test script for the CV parser logic
// This extracts the parseCVText function from Dropzone.tsx and tests it with sample CV text

const fs = require('fs');
const path = require('path');

// Read the Dropzone.tsx file
const filePath = path.join(__dirname, '..', 'components', 'builder', 'Dropzone.tsx');
const source = fs.readFileSync(filePath, 'utf8');

// Extract the parseCVText function (from "function parseCVText" to the end of the file)
const startIdx = source.indexOf('function parseCVText');
const endIdx = source.lastIndexOf('}');
const parserCode = source.slice(startIdx, endIdx + 1);

// Also extract the interfaces needed
const interfaceStart = source.indexOf('interface ParsedExperience');
const parserStart = source.indexOf('function parseCVText');
const interfacesCode = source.slice(interfaceStart, parserStart);

// Create a test harness
const testCode = `
${interfacesCode}
${parserCode}

// Sample CV text with multiple experience entries
const sampleCV = \`
John Doe
Senior Software Engineer
john.doe@example.com
(555) 123-4567
San Francisco, CA

SUMMARY
Experienced software engineer with 8+ years building scalable web applications.

EXPERIENCE
Senior Software Engineer
Acme Corp | 2020 - Present
- Led a team of 5 engineers building a microservices platform
- Reduced deployment time by 60% using CI/CD pipelines
- Mentored 3 junior developers

Software Engineer
Tech Solutions Inc | 2018 - 2020
- Built REST APIs serving 2M+ daily requests
- Migrated legacy monolith to Kubernetes
- Implemented GraphQL gateway

Junior Developer
Startup Labs | 2016 - 2018
- Developed React components for the main product
- Fixed 100+ bugs across the codebase

EDUCATION
BSc Computer Science
University of California, Berkeley | 2012 - 2016

SKILLS
JavaScript, TypeScript, React, Node.js, AWS, Docker, Kubernetes
\`;

const result = parseCVText(sampleCV);
console.log('=== PARSED RESULT ===');
console.log('Name:', result.fullName);
console.log('Title:', result.title);
console.log('Email:', result.email);
console.log('Phone:', result.phone);
console.log('Location:', result.location);
console.log('Summary:', result.summary.substring(0, 80) + '...');
console.log('Skills:', result.skills.join(', '));
console.log('Experience entries:', result.experience.length);
result.experience.forEach((exp, i) => {
  console.log(\`  [\${i + 1}] \${exp.role} at \${exp.company} (\${exp.start} - \${exp.end})\`);
  console.log(\`      Bullets: \${exp.bullets.split('\\n').length}\`);
});
console.log('Education entries:', result.education.length);
result.education.forEach((edu, i) => {
  console.log(\`  [\${i + 1}] \${edu.degree} at \${edu.school} (\${edu.start} - \${edu.end})\`);
});
`;

// Write and run the test
const testFile = path.join(__dirname, 'run-parser-test.ts');
fs.writeFileSync(testFile, testCode);
console.log('Test file written to', testFile);
