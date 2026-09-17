const fs = require('fs');
const path = './src/index.css';

function generateStars(count) {
  let shadows = [];
  for(let i=0; i<count; i++) {
    shadows.push(`${Math.floor(Math.random() * 2500)}px ${Math.floor(Math.random() * 2500)}px #fff`);
  }
  return shadows.join(',\n  ');
}

let css = fs.readFileSync(path, 'utf8');

let cutoff = css.indexOf('#stars {');
if(cutoff !== -1) {
    css = css.substring(0, cutoff);
}

const s1 = generateStars(1200); 
const s2 = generateStars(600);  
const s3 = generateStars(300);  

const newStars = `#stars {
  width: 1px;
  height: 1px;
  background: transparent;
  box-shadow: ${s1};
  animation: animStar 100s linear infinite;
}

#stars:after {
  content: " ";
  position: absolute;
  top: 2500px;
  width: 1px;
  height: 1px;
  background: transparent;
  box-shadow: ${s1};
}

#stars2 {
  width: 2px;
  height: 2px;
  background: transparent;
  box-shadow: ${s2};
  animation: animStar 150s linear infinite;
}

#stars2:after {
  content: " ";
  position: absolute;
  top: 2500px;
  width: 2px;
  height: 2px;
  background: transparent;
  box-shadow: ${s2};
}

#stars3 {
  width: 3px;
  height: 3px;
  background: transparent;
  box-shadow: ${s3};
  animation: animStar 200s linear infinite;
}

#stars3:after {
  content: " ";
  position: absolute;
  top: 2500px;
  width: 3px;
  height: 3px;
  background: transparent;
  box-shadow: ${s3};
}
`;

css += newStars;
fs.writeFileSync(path, css);
console.log('Done!');
