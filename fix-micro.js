const fs = require('fs');
const path = require('path');

function walk(dir, call) {
  for (let file of fs.readdirSync(dir)) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) walk(p, call);
    else if (p.endsWith('.tsx')) call(p);
  }
}

walk('./src', (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // A.1 Button scale
  // Match <button ... className="..."> that doesn't have active:scale
  const btnRegex = /<button[^>]+className=["']([^"']+)["'][^>]*>/g;
  content = content.replace(btnRegex, (match, classes) => {
    // Ignore checkboxes, absolute positioned grid resize handles, etc.
    if (classes.includes('active:scale') || classes.includes('cursor-n-resize') || classes.includes('cursor-s-resize')) {
      return match;
    }
    const newClasses = classes + ' active:scale-[0.97]';
    changed = true;
    return match.replace(classes, newClasses);
  });

  // A.2 Card Hover Lift
  // Match rounded-xl or rounded-2xl with bg-[#1A1A1A]
  const cardRegex = /className=["']([^"']*(?:rounded-xl|rounded-2xl)[^"']*bg-\[#1A1A1A\][^"']*)["']/g;
  content = content.replace(cardRegex, (match, classes) => {
    if (classes.includes('hover:-translate-y-0.5')) return match;
    const newClasses = classes + ' hover:-translate-y-0.5 hover:border-[#333333] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200';
    changed = true;
    return match.replace(classes, newClasses);
  });

  // A.4 Link Hover States
  const linkRegex = /<Link[^>]+className=["']([^"']+)["'][^>]*>/g;
  content = content.replace(linkRegex, (match, classes) => {
    if (classes.includes('hover:') || classes.includes('bg-') || classes.includes('btn')) return match;
    // Pure text links usually don't have bg- or p-
    if (!classes.includes('text-[#')) return match;
    const newClasses = classes + ' hover:text-[#F0F0F0] transition-colors duration-150';
    changed = true;
    return match.replace(classes, newClasses);
  });

  if (changed) fs.writeFileSync(file, content);
});
console.log('Done script A');
