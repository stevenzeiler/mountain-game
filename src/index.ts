import { Game } from './game/Game';

// Create loading screen
const loadingScreen = document.createElement('div');
loadingScreen.style.position = 'fixed';
loadingScreen.style.top = '0';
loadingScreen.style.left = '0';
loadingScreen.style.width = '100%';
loadingScreen.style.height = '100%';
loadingScreen.style.backgroundColor = '#333';
loadingScreen.style.color = 'white';
loadingScreen.style.fontFamily = 'Arial, sans-serif';
loadingScreen.style.display = 'flex';
loadingScreen.style.flexDirection = 'column';
loadingScreen.style.alignItems = 'center';
loadingScreen.style.justifyContent = 'center';
loadingScreen.style.zIndex = '1000';
loadingScreen.style.textAlign = 'center';
loadingScreen.style.padding = '20px';

// Add game title
const title = document.createElement('h1');
title.textContent = 'Andorora Mountain Explorer';
title.style.marginBottom = '30px';
title.style.fontSize = '36px';
title.style.color = '#ff6b6b';
loadingScreen.appendChild(title);

// Add game description
const description = document.createElement('p');
description.textContent = 'Explore the beautiful mountainous terrain of Andorora in this voxel-based adventure game.';
description.style.marginBottom = '30px';
description.style.maxWidth = '600px';
description.style.lineHeight = '1.5';
loadingScreen.appendChild(description);

// Add controls section
const controlsTitle = document.createElement('h2');
controlsTitle.textContent = 'Controls';
controlsTitle.style.marginBottom = '15px';
controlsTitle.style.color = '#4ecdc4';
loadingScreen.appendChild(controlsTitle);

// Create controls list
const controlsList = document.createElement('ul');
controlsList.style.listStyleType = 'none';
controlsList.style.padding = '0';
controlsList.style.marginBottom = '30px';
controlsList.style.textAlign = 'left';
controlsList.style.display = 'inline-block';

const controls = [
  { key: 'W', action: 'Move Forward' },
  { key: 'S', action: 'Move Backward' },
  { key: 'A', action: 'Move Left' },
  { key: 'D', action: 'Move Right' },
  { key: 'Space', action: 'Jump' },
  { key: 'Shift', action: 'Sprint' },
  { key: 'Mouse', action: 'Look Around' },
  { key: '← →', action: 'Turn Left/Right' }
];

controls.forEach(control => {
  const item = document.createElement('li');
  item.style.margin = '10px 0';
  
  const keySpan = document.createElement('span');
  keySpan.textContent = control.key;
  keySpan.style.display = 'inline-block';
  keySpan.style.width = '80px';
  keySpan.style.backgroundColor = '#222';
  keySpan.style.padding = '5px 10px';
  keySpan.style.borderRadius = '4px';
  keySpan.style.marginRight = '15px';
  keySpan.style.textAlign = 'center';
  
  item.appendChild(keySpan);
  item.appendChild(document.createTextNode(control.action));
  controlsList.appendChild(item);
});

loadingScreen.appendChild(controlsList);

// Add start button
const startButton = document.createElement('button');
startButton.textContent = 'Start Game';
startButton.style.padding = '12px 24px';
startButton.style.fontSize = '18px';
startButton.style.backgroundColor = '#4ecdc4';
startButton.style.color = 'white';
startButton.style.border = 'none';
startButton.style.borderRadius = '4px';
startButton.style.cursor = 'pointer';
startButton.style.transition = 'background-color 0.3s';

startButton.addEventListener('mouseover', () => {
  startButton.style.backgroundColor = '#3dbdb4';
});

startButton.addEventListener('mouseout', () => {
  startButton.style.backgroundColor = '#4ecdc4';
});

let game: Game | null = null;

startButton.addEventListener('click', () => {
  document.body.removeChild(loadingScreen);
  game = new Game();
});

loadingScreen.appendChild(startButton);
document.body.appendChild(loadingScreen);

// Handle cleanup on window unload
window.addEventListener('unload', () => {
  if (game) {
    game.destroy();
    game = null;
  }
}); 