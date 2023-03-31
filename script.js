$(function() {
  // Set up the scene, camera, and renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create the ground
  const loader = new THREE.TextureLoader();
  const groundTexture = loader.load('images/snow.jpg');
  const groundGeometry = new THREE.PlaneGeometry(10, 10);
  const groundMaterial = new THREE.MeshBasicMaterial({map: groundTexture});
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Load the texture
  const treeTextures = [ loader.load('images/tree3.png'), loader.load('images/tree4.png'), loader.load('images/tree5.png') ];

  // Create the tree material with the texture
  const treeGeometry = new THREE.BoxGeometry(1, 3, 0);

  // Create an array to store the trees
  const trees = [];

  // Create the trees with the textured material
  for (let i = 0; i < 10; i++) {
    const treeMaterial = new THREE.MeshBasicMaterial({map: treeTextures[Math.floor(Math.random() * 3)], transparent: true});
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    tree.position.set(Math.random() * 10 - 5, 0.5, Math.random() * 10 - 5);
    scene.add(tree);
    trees.push(tree);
  }

  // Create the rock geometry and material
  const rockTextures = [ loader.load('images/rock1.jpg'), loader.load('images/rock2.jpg'), loader.load('images/rock3.jpg'), loader.load('images/rock4.png') ];
  const rockGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

  // Create a function to add a row of rocks along one side of the ground
  const rocks = [];
  function addRockRow(x, zStart, zEnd) {
      for (let z = zStart; z <= zEnd; z += 0.5) {
          const rockMaterial = new THREE.MeshBasicMaterial({map: rockTextures[Math.floor(Math.random() * 4)], transparent: true});
          const rock = new THREE.Mesh(rockGeometry, rockMaterial);
          rock.position.set(x, 0.25, z);
          scene.add(rock);
          rocks.push(rock);
      }
  }

  // Add rows of rocks along each side of the ground
  addRockRow(-5, -5, 5);
  addRockRow(5, -5, 5);
  for (let x = -4.5; x <= 4.5; x += 0.5) {
      addRockRow(x, -5, -5);
      addRockRow(x, 5, 5);
  }

  // Create the treasure geometry and material
  const treasureTexture = loader.load('images/treasure.png');
  const treasureGeometry = new THREE.BoxGeometry(0.75, 0.5, 0);
  const treasureMaterial = new THREE.MeshBasicMaterial({map: treasureTexture, transparent: true});

  // Create the treasure and add it to the scene
  const treasure = new THREE.Mesh(treasureGeometry, treasureMaterial);
  treasure.position.set(Math.random() * 10 - 5, 0.25, Math.random() * 10 - 5);
  scene.add(treasure);

  // Create a variable to store the player's score
  let score = 0;

  // Create the score text
  /*const scoreText = new THREE.Mesh(
    new THREE.TextGeometry(`Score: ${score}`, {font: 'helvetiker', size: 0.5, height: 0.1}),
    new THREE.MeshBasicMaterial({color: 0xffffff})
  );
  scoreText.position.set(0, 5, 0);
  scene.add(scoreText);*/

  // Create an audio element to play the sound effect
  const scoreSound = new Howl({
    src: ['sounds/Cork.mp3'], autoplay: true, loop: false
  });
  const windSound = new Howl({
    src: ['sounds/wind01.mp3'], autoplay: true, loop: true
  });
  windSound.play();

  // Set the camera position
  camera.position.set(5, 5, 5);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // Create the player
  const playerTexture = loader.load('images/hero.png');
  const playerGeometry = new THREE.BoxGeometry(0.5, 1, 0);
  const playerMaterial = new THREE.MeshBasicMaterial({map: playerTexture, transparent: true});
  const player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 0.25, 0);
  scene.add(player);

  // Set up key controls
  const keys = {};
  document.addEventListener('keydown', (e) => {
      keys[e.code] = true;
  });
  document.addEventListener('keyup', (e) => {
      keys[e.code] = false;
  });

  function setRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    document.getElementById('score').style.backgroundColor = color;
  }

  // Update the player position based on key controls
  function updatePlayerPosition() {
      // Store the player's old position
      const oldPosition = player.position.clone();

      if (keys['ArrowUp']) {
          player.position.z -= 0.1;
      }
      if (keys['ArrowDown']) {
          player.position.z += 0.1;
      }
      if (keys['ArrowLeft']) {
          player.position.x -= 0.1;
      }
      if (keys['ArrowRight']) {
          player.position.x += 0.1;
      }

      // Check for collision with the treasure
      const distance = player.position.distanceTo(treasure.position);
      if (distance < 0.5) {
          // Collision detected, update the score and move the treasure to a new position
          score++;
          document.getElementById('score').textContent = `Score: ${score}`;
          scoreSound.play();
          setRandomColor();
          treasure.position.set(Math.random() * 10 - 5, 0.25, Math.random() * 10 - 5);
      }

      // Check for collisions with trees
      for (const tree of trees) {
        const distance = player.position.distanceTo(tree.position);
        if (distance < 0.5) {
            // Collision detected, move the player back to their old position
            player.position.copy(oldPosition);
            break;
        }
      }

      // Check for collisions with rocks
      for (const rock of rocks) {
        const distance = player.position.distanceTo(rock.position);
        if (distance < 0.5) {
            // Collision detected, move the player back to their old position
            player.position.copy(oldPosition);
            break;
        }
      }
  }

  // Set up the OrbitControls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;

  // Update the scene
  function animate() {
      requestAnimationFrame(animate);
      updatePlayerPosition();
      controls.update();
      renderer.render(scene, camera);
  }

  const leftArrow = document.getElementById('left-arrow');
  const rightArrow = document.getElementById('right-arrow');
  const upArrow = document.getElementById('up-arrow');
  const downArrow = document.getElementById('down-arrow');

  leftArrow.addEventListener('touchstart', () => {
    keys['ArrowLeft'] = true;
  });
  leftArrow.addEventListener('touchend', () => {
    keys['ArrowLeft'] = false;
  });
  leftArrow.addEventListener('mousedown', () => {
    keys['ArrowLeft'] = true;
  });
  leftArrow.addEventListener('mouseup', () => {
    keys['ArrowLeft'] = false;
  });

  rightArrow.addEventListener('touchstart', () => {
    keys['ArrowRight'] = true;
  });
  rightArrow.addEventListener('touchend', () => {
    keys['ArrowRight'] = false;
  });
  rightArrow.addEventListener('mousedown', () => {
    keys['ArrowRight'] = true;
  });
  rightArrow.addEventListener('mouseup', () => {
    keys['ArrowRight'] = false;
  });

  upArrow.addEventListener('touchstart', () => {
    keys['ArrowUp'] = true;
  });
  upArrow.addEventListener('touchend', () => {
    keys['ArrowUp'] = false;
  });
  upArrow.addEventListener('mousedown', () => {
    keys['ArrowUp'] = true;
  });
  upArrow.addEventListener('mouseup', () => {
    keys['ArrowUp'] = false;
  });

  downArrow.addEventListener('touchstart', () => {
    keys['ArrowDown'] = true;
  });
  downArrow.addEventListener('touchend', () => {
    keys['ArrowDown'] = false;
  });
  downArrow.addEventListener('mousedown', () => {
    keys['ArrowDown'] = true;
  });
  downArrow.addEventListener('mouseup', () => {
    keys['ArrowDown'] = false;
  });
  
  animate();
});
