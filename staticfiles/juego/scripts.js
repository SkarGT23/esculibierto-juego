document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const messageElement = document.getElementById("message");
    const resultsButton = document.getElementById("resultsButton");
    const gameResults = document.getElementById("gameResults");
    const resultsList = document.getElementById("resultsList");
    const inputContainer = document.getElementById("inputContainer");
    const scoreInput = document.getElementById("scoreInput");
    const submitScore = document.getElementById("submitScore");

    // Configuración inicial
    const gridSize = 20;
    let snake = [{ x: 200, y: 200 }];
    let food = { x: 100, y: 100 };
    let specialFood = null;
    let blackApple = null;
    let brownBean = null;
    let isDoubleSpeed = false;
    let doubleSpeedTimeout = null;
    let normalInterval = 100;
    let fastInterval = 50;
    let direction = { x: 0, y: 0 };
    let score = 0;
    let redFoodCount = 0;
    let gameInterval = null;
    let isGameRunning = false;
    let startTime = null;
    let currentLevel = 0;

    // Configuración de niveles
    const levels = [
        { score: 0, blockedWalls: [] },
        { score: 20, blockedWalls: ['top', 'bottom'] },
        { score: 40, blockedWalls: ['left', 'right'] },
        { score: 60, blockedWalls: ['top', 'bottom', 'left', 'right'] }
    ];

    // Base de datos de resultados
    let gameResultsData = [
        { score: 10, duration: '5:30', comment: 'la Ayalga' },
        { score: 20, duration: '4:45', comment: 'el Trasgo' },
        { score: 30, duration: '6:10', comment: '¡la Llavandera!' },
        { score: 40, duration: '3:50', comment: 'el Nuberu' },
        { score: 50, duration: '7:00', comment: '¡el Sumiciu!' },
        { score: 60, duration: '5:30', comment: 'el Diañu Burlón' },
        { score: 70, duration: '4:45', comment: 'el Busgosu' },
        { score: 80, duration: '6:10', comment: '¡el Ventolín!' },
        { score: 90, duration: '3:50', comment: 'los Espumerus' },
        { score: 100, duration: '7:00', comment: '¡la Guaxa!' },
        { score: 110, duration: '6:10', comment: '¡la Xana!' },
        { score: 120, duration: '3:50', comment: 'la Güestia' },
        { score: 130, duration: '7:00', comment: '¡El Cuelebre!' }
    ];

    // Mensajes de motivación
    const messages = [
        "¡ECHA UN CULIN MANIN!",
        "SIGUE ASI COLLACIU!!",
        "CALLA HO! MIRALU!!",
        "ANDE VAS GUAJE!",
        "TAS JUGANDOTE LA VIDA!",
        "COLLACIU!!",
        "QUE FATU YES!",
        "GAYU DIVORCIATE!"
    ];

    let displayedMessages = [];

    // Función para dibujar las paredes bloqueadas
    function drawBlockedWalls() {
        const currentLevelConfig = levels.find(l => score >= l.score);
        if (!currentLevelConfig) return;

        // Crear un degradado brillante para las paredes
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ff0000');    // Rojo base
        gradient.addColorStop(0.5, '#ff3333');  // Rojo más brillante
        gradient.addColorStop(1, '#ff0000');    // Rojo base

        ctx.strokeStyle = gradient;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 8;

        currentLevelConfig.blockedWalls.forEach(wall => {
            ctx.beginPath();
            switch (wall) {
                case 'top':
                    ctx.moveTo(0, 0);
                    ctx.lineTo(canvas.width, 0);
                    break;
                case 'bottom':
                    ctx.moveTo(0, canvas.height);
                    ctx.lineTo(canvas.width, canvas.height);
                    break;
                case 'left':
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, canvas.height);
                    break;
                case 'right':
                    ctx.moveTo(canvas.width, 0);
                    ctx.lineTo(canvas.width, canvas.height);
                    break;
            }
            ctx.stroke();
        });

        // Restaurar configuración del contexto
        ctx.shadowBlur = 0;
    }

    // Función para verificar colisión con paredes bloqueadas
    function checkWallCollision(head) {
        const currentLevelConfig = levels.find(l => score >= l.score);
        if (!currentLevelConfig) return false;

        return currentLevelConfig.blockedWalls.some(wall => {
            switch (wall) {
                case 'top':
                    return head.y <= 0;
                case 'bottom':
                    return head.y >= canvas.height - gridSize;
                case 'left':
                    return head.x <= 0;
                case 'right':
                    return head.x >= canvas.width - gridSize;
                default:
                    return false;
            }
        });
    }

    // Función para obtener el personaje basado en la puntuación
    function getCharacterForScore(score) {
        for (let i = gameResultsData.length - 1; i >= 0; i--) {
            if (score >= gameResultsData[i].score) {
                return gameResultsData[i].comment;
            }
        }
        return 'la Ayalga';
    }

    // Función para formatear el tiempo
    function formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Manejo de resultados
    resultsButton.addEventListener('click', () => {
        gameResults.style.display = gameResults.style.display === 'none' ? 'block' : 'none';
        if (gameResults.style.display === 'block') {
            updateResultsList();
        }
    });

    function updateResultsList() {
        resultsList.innerHTML = '';
        const storedResults = JSON.parse(localStorage.getItem('snakeGameResults') || '[]');
        storedResults.sort((a, b) => b.score - a.score);
        
        storedResults.slice(0, 10).forEach((result, index) => {
            const li = document.createElement('li');
            let medal = '';
            
            // Añadir medallas para los tres primeros lugares
            if (index === 0) {
                medal = '🥇 ';
            } else if (index === 1) {
                medal = '🥈 ';
            } else if (index === 2) {
                medal = '🥉 ';
            }
            
            // Crear elementos para el nombre y la información
            const nameSpan = document.createElement('span');
            nameSpan.className = 'player-name';
            nameSpan.textContent = `${medal}${result.name}`;
            
            const infoSpan = document.createElement('span');
            infoSpan.className = 'score-info';
            infoSpan.textContent = `Puntuación: ${result.score} | Tiempo: ${result.duration} | ${result.character}`;
            
            // Añadir los elementos al li
            li.appendChild(nameSpan);
            li.appendChild(infoSpan);
            
            resultsList.appendChild(li);
        });
    }

    // Función para guardar resultado
    function saveResult(score, duration) {
        const character = getCharacterForScore(score);
        const nameInput = document.getElementById('nameInput');
        const playerNameInput = document.getElementById('playerName');
        const errorMessage = document.querySelector('.error-message');
        const submitButton = document.getElementById('submitName');
        const overlay = document.querySelector('.overlay');

        // Mostrar el overlay y el diálogo de entrada de nombre
        overlay.style.display = 'block';
        nameInput.style.display = 'block';
        playerNameInput.value = '';
        errorMessage.style.display = 'none';

        // Validar entrada de solo letras
        playerNameInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
            if (!/^[A-Z]*$/.test(this.value)) {
                errorMessage.style.display = 'block';
                submitButton.disabled = true;
            } else {
                errorMessage.style.display = 'none';
                submitButton.disabled = false;
            }
        });

        // Manejar el envío del nombre
        submitButton.onclick = function() {
            const playerName = playerNameInput.value.toUpperCase();
            if (playerName.length >= 1 && playerName.length <= 10 && /^[A-Z]+$/.test(playerName)) {
                const results = JSON.parse(localStorage.getItem('snakeGameResults') || '[]');
                results.push({ 
                    name: playerName,
                    score: score, 
                    duration: duration, 
                    character: character 
                });
                results.sort((a, b) => b.score - a.score);
                localStorage.setItem('snakeGameResults', JSON.stringify(results.slice(0, 10)));
                nameInput.style.display = 'none';
                overlay.style.display = 'none';
                updateResultsList();
            } else {
                errorMessage.style.display = 'block';
            }
        };
    }

    // Función para mostrar mensaje sin mover la pantalla
    function showMessage(text, color = '#0ff', duration = 2000) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.style.color = color;
        messageElement.style.display = 'block';
        
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, duration);
    }

    // Dibuja la serpiente
    function drawSnake() {
        snake.forEach((segment, index) => {
            ctx.save();
            // Todos los segmentos iguales, rectangulares y alineados
            ctx.fillStyle = '#00e600'; // verde vivo y uniforme
            ctx.strokeStyle = '#00ff66';
            ctx.lineWidth = 2;
            ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
            ctx.strokeRect(segment.x, segment.y, gridSize, gridSize);
            // Ojos solo en la cabeza
            if (index === 0) {
                let dx = direction.x;
                let dy = direction.y;
                if (dx === 0 && dy === 0) dy = -1;
                let eyeOffsetX1 = gridSize * 0.25;
                let eyeOffsetY1 = gridSize * 0.25;
                let eyeOffsetX2 = gridSize * 0.75;
                let eyeOffsetY2 = gridSize * 0.25;
                let eyeRadius = gridSize * 0.12;
                if (dx > 0) {
                    eyeOffsetX1 = gridSize * 0.75;
                    eyeOffsetY1 = gridSize * 0.25;
                    eyeOffsetX2 = gridSize * 0.75;
                    eyeOffsetY2 = gridSize * 0.75;
                } else if (dx < 0) {
                    eyeOffsetX1 = gridSize * 0.25;
                    eyeOffsetY1 = gridSize * 0.25;
                    eyeOffsetX2 = gridSize * 0.25;
                    eyeOffsetY2 = gridSize * 0.75;
                } else if (dy > 0) {
                    eyeOffsetX1 = gridSize * 0.25;
                    eyeOffsetY1 = gridSize * 0.75;
                    eyeOffsetX2 = gridSize * 0.75;
                    eyeOffsetY2 = gridSize * 0.75;
                } else if (dy < 0) {
                    eyeOffsetX1 = gridSize * 0.25;
                    eyeOffsetY1 = gridSize * 0.25;
                    eyeOffsetX2 = gridSize * 0.75;
                    eyeOffsetY2 = gridSize * 0.25;
                }
                ctx.beginPath();
                ctx.arc(segment.x + eyeOffsetX1, segment.y + eyeOffsetY1, eyeRadius, 0, 2 * Math.PI);
                ctx.arc(segment.x + eyeOffsetX2, segment.y + eyeOffsetY2, eyeRadius, 0, 2 * Math.PI);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.strokeStyle = '#222';
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(segment.x + eyeOffsetX1, segment.y + eyeOffsetY1, eyeRadius * 0.4, 0, 2 * Math.PI);
                ctx.arc(segment.x + eyeOffsetX2, segment.y + eyeOffsetY2, eyeRadius * 0.4, 0, 2 * Math.PI);
                ctx.fillStyle = '#222';
                ctx.fill();
            }
            ctx.restore();
        });
    }

    // Dibuja la comida
    function drawFood() {
        // Dibuja una manzana realista
        ctx.save();
        // Cuerpo de la manzana (ovalada, roja)
        ctx.beginPath();
        ctx.ellipse(food.x + gridSize/2, food.y + gridSize/2 + 2, gridSize*0.38, gridSize*0.42, 0, 0, 2 * Math.PI);
        let appleGradient = ctx.createRadialGradient(food.x + gridSize/2 - 2, food.y + gridSize/2 - 2, 2, food.x + gridSize/2, food.y + gridSize/2, gridSize*0.42);
        appleGradient.addColorStop(0, '#fffbe5');
        appleGradient.addColorStop(0.3, '#ff1c1c');
        appleGradient.addColorStop(1, '#ff0000');
        ctx.fillStyle = appleGradient;
        ctx.shadowColor = '#ff1c1c';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#7a1a1a';
        ctx.stroke();
        // Tallo
        ctx.beginPath();
        ctx.moveTo(food.x + gridSize/2, food.y + gridSize*0.19);
        ctx.lineTo(food.x + gridSize/2, food.y + gridSize*0.02);
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = '#7a4a1a';
        ctx.stroke();
        // Hoja
        ctx.beginPath();
        ctx.ellipse(food.x + gridSize/2 + 5, food.y + gridSize*0.13, 4, 7, Math.PI/7, 0, 2 * Math.PI);
        ctx.fillStyle = '#3ecf3e';
    }

    // Dibuja la manzana negra (bola negra)
    function drawBlackApple() {
        if (blackApple) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(blackApple.x + gridSize/2, blackApple.y + gridSize/2, gridSize*0.38, 0, 2 * Math.PI);
            let blackGradient = ctx.createRadialGradient(blackApple.x + gridSize/2, blackApple.y + gridSize/2, 2, blackApple.x + gridSize/2, blackApple.y + gridSize/2, gridSize*0.38);
            blackGradient.addColorStop(0, '#666');
            blackGradient.addColorStop(0.2, '#222');
            blackGradient.addColorStop(1, '#000');
            ctx.fillStyle = blackGradient;
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#333';
            ctx.stroke();
            ctx.restore();
        }
    }
// Piedra gris
let rock = null;

// Genera un número aleatorio entre min y max
function randomInterval(min, max) {
    return Math.random() * (max - min) + min;
}

// Comprueba si una posición colisiona con otros objetos
function isPositionFree(x, y, objects) {
    for (let obj of objects) {
        if (x < obj.x + obj.width &&
            x + gridSize > obj.x &&
            y < obj.y + obj.height &&
            y + gridSize > obj.y) {
            return false;
        }
    }
    return true;
}

// Genera la piedra en posición libre
function spawnRock(objects = []) {
    let maxAttempts = 20; // Evita bucle infinito
    for (let i = 0; i < maxAttempts; i++) {
        let x = Math.floor(Math.random() * canvas.width / gridSize) * gridSize;
        let y = Math.floor(Math.random() * canvas.height / gridSize) * gridSize;
        if (isPositionFree(x, y, objects)) {
            rock = { x, y, width: gridSize, height: gridSize };
            // Desaparece tras 7 segundos
            setTimeout(() => { rock = null; }, 7000);
            return;
        }
    }
    // Si no encuentra posición libre, no genera nada
}

// Dibuja la piedra
function drawRock() {
    if (!rock) return;
    ctx.save();
    ctx.fillStyle = '#808080'; // gris
    ctx.fillRect(rock.x, rock.y, rock.width, rock.height);
    ctx.restore();
}

// Colisión con el jugador
function checkRockCollision(player) {
    if (!rock) return false;
    if (player.x < rock.x + rock.width &&
        player.x + player.width > rock.x &&
        player.y < rock.y + rock.height &&
        player.y + player.height > rock.y) {
        gameOver(); // Pierde
        return true;
    }
    return false;
}

// Función para generar la piedra en intervalos aleatorios
function scheduleRock(objects = []) {
    let interval = randomInterval(15000, 30000); // 15-30s
    setTimeout(() => {
        spawnRock(objects);
        // Vuelve a programar
        scheduleRock(objects);
    }, interval);
}
    // Dibuja la botella de sidra (botella verde)
    function drawSpecialFood() {
        if (specialFood) {
            ctx.save();
            // Cuerpo de la botella
            ctx.beginPath();
            ctx.ellipse(specialFood.x + gridSize/2, specialFood.y + gridSize/2 + 2, gridSize*0.18, gridSize*0.36, 0, 0, 2 * Math.PI);
            let bottleGradient = ctx.createLinearGradient(specialFood.x, specialFood.y + gridSize, specialFood.x + gridSize, specialFood.y);
            bottleGradient.addColorStop(0, '#00ffb3');
            bottleGradient.addColorStop(0.3, '#00ff00');
            bottleGradient.addColorStop(0.8, '#009900');
            ctx.fillStyle = bottleGradient;
            ctx.shadowColor = '#00ffb3';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 2.2;
            ctx.strokeStyle = '#0d4d0d';
            ctx.stroke();
            // Cuello
            ctx.beginPath();
            ctx.rect(specialFood.x + gridSize/2 - 4, specialFood.y + gridSize/2 - 20, 8, 12);
            ctx.fillStyle = '#e0ffe0';
            ctx.fill();
            ctx.strokeStyle = '#0d4d0d';
            ctx.stroke();
            // Tapón
            ctx.beginPath();
            ctx.ellipse(specialFood.x + gridSize/2, specialFood.y + gridSize/2 - 14, 5, 3, 0, 0, 2 * Math.PI);
            ctx.fillStyle = '#b1b1b1';
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }

    // Dibuja la faba marrón
    function drawBrownBean() {
        if (brownBean) {
            ctx.save();
            // Faba curva y brillante
            ctx.beginPath();
            ctx.ellipse(brownBean.x + gridSize/2, brownBean.y + gridSize/2, gridSize*0.38, gridSize*0.22, Math.PI/6, 0, 2 * Math.PI);
            let beanGradient = ctx.createLinearGradient(brownBean.x, brownBean.y, brownBean.x + gridSize, brownBean.y + gridSize);
            beanGradient.addColorStop(0, '#fff89a');
            beanGradient.addColorStop(0.3, '#ffb13b');
            beanGradient.addColorStop(1, '#ff8000');
            ctx.fillStyle = beanGradient;
            ctx.shadowColor = '#ffb13b';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 2.2;
            ctx.strokeStyle = '#5C3A13';
            ctx.stroke();
            // Extremo más ancho (detalle)
            ctx.beginPath();
            ctx.ellipse(brownBean.x + gridSize/2 + 4, brownBean.y + gridSize/2 + 2, gridSize*0.09, gridSize*0.11, Math.PI/6, 0, 2 * Math.PI);
            ctx.fillStyle = '#fffbe5';
            ctx.globalAlpha = 0.5;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.restore();
        }
    }

    // Mueve la serpiente
    function moveSnake() {
        const head = {
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y
        };

        // Verificar colisión con paredes según el nivel
        const currentLevelConfig = levels.find(l => score >= l.score);
        if (currentLevelConfig) {
            if (currentLevelConfig.blockedWalls.includes('top') && head.y < 0) {
                endGame();
                return;
            }
            if (currentLevelConfig.blockedWalls.includes('bottom') && head.y >= canvas.height) {
                endGame();
                return;
            }
            if (currentLevelConfig.blockedWalls.includes('left') && head.x < 0) {
                endGame();
                return;
            }
            if (currentLevelConfig.blockedWalls.includes('right') && head.x >= canvas.width) {
                endGame();
                return;
            }
        }

        // Atravesar paredes solo si no están bloqueadas
        if (head.x >= canvas.width) {
            if (!currentLevelConfig || !currentLevelConfig.blockedWalls.includes('right')) {
                head.x = 0;
            }
        }
        if (head.x < 0) {
            if (!currentLevelConfig || !currentLevelConfig.blockedWalls.includes('left')) {
                head.x = canvas.width - gridSize;
            }
        }
        if (head.y >= canvas.height) {
            if (!currentLevelConfig || !currentLevelConfig.blockedWalls.includes('bottom')) {
                head.y = 0;
            }
        }
        if (head.y < 0) {
            if (!currentLevelConfig || !currentLevelConfig.blockedWalls.includes('top')) {
                head.y = canvas.height - gridSize;
            }
        }

        snake.unshift(head);

        // Colisión con comida
        if (brownBean && head.x === brownBean.x && head.y === brownBean.y) {
            brownBean = null;
            if (!isDoubleSpeed) {
                isDoubleSpeed = true;
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, fastInterval);
                showMessage("¡FABÓN! ¡VELOCIDAD X2!", '#A0522D');
                doubleSpeedTimeout = setTimeout(() => {
                    isDoubleSpeed = false;
                    clearInterval(gameInterval);
                    gameInterval = setInterval(gameLoop, normalInterval);
                    showMessage("La faba se acabó...", '#A0522D', 1200);
                }, 5000);
            } else {
                // Si ya está en doble velocidad, simplemente reinicia el temporizador
                clearTimeout(doubleSpeedTimeout);
                doubleSpeedTimeout = setTimeout(() => {
                    isDoubleSpeed = false;
                    clearInterval(gameInterval);
                    gameInterval = setInterval(gameLoop, normalInterval);
                    showMessage("La faba se acabó...", '#A0522D', 1200);
                }, 5000);
            }
        } else if (head.x === food.x && head.y === food.y) {
            score++;
            document.getElementById("score").textContent = `Puntuación: ${score}`;
            redFoodCount++;
            showMessage(messages[Math.floor(Math.random() * messages.length)]);

            // Verificar cambio de nivel
            const newLevel = levels.findIndex(l => score >= l.score);
            if (newLevel !== currentLevel) {
                currentLevel = newLevel;
                if (currentLevel > 0) {
                    const walls = levels[currentLevel].blockedWalls;
                    showMessage(`¡NIVEL ${currentLevel}! ¡${walls.length === 4 ? 'TODAS LAS PAREDES BLOQUEADAS!' : 
                        walls.includes('top') && walls.includes('bottom') ? '¡ARRIBA Y ABAJO BLOQUEADOS!' :
                        walls.includes('left') && walls.includes('right') ? '¡IZQUIERDA Y DERECHA BLOQUEADOS!' : 
                        '¡NUEVAS PAREDES BLOQUEADAS!'}`, '#ff3333', 3000);
                }
            }

            if (redFoodCount >= 9) {
                generateSpecialFood();
                redFoodCount = 0;
            }

            // Probabilidad de aparición de la faba marrón (10%)
            if (!brownBean && Math.random() < 0.1) {
                generateBrownBean();
            }

            if (Math.random() < 0.3) {
                generateBlackApple();
            }

            generateFood();
        } else if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
            score += 5;
            document.getElementById("score").textContent = `Puntuación: ${score}`;
            specialFood = null;
            showMessage("¡BONUS +5 PUNTOS!", '#00ff00');
        } else if (blackApple && head.x === blackApple.x && head.y === blackApple.y) {
            score = Math.max(0, score - 5);
            document.getElementById("score").textContent = `Puntuación: ${score}`;
            blackApple = null;
            showMessage("¡CUIDADO CON LA MANZANA NEGRA! -5 PUNTOS", '#ff0000');
        } else {
            snake.pop();
        }
    }

    // Genera comida en posición aleatoria
    function generateFood() {
        const getRandomPosition = () => ({
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        });

        let newFood;
        do {
            newFood = getRandomPosition();
        } while (
            snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
            (specialFood && specialFood.x === newFood.x && specialFood.y === newFood.y) ||
            (blackApple && blackApple.x === newFood.x && blackApple.y === newFood.y)
        );

        food = newFood;
    }

    // Genera comida especial
    function generateSpecialFood() {
        const getRandomPosition = () => ({
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        });

        let newSpecialFood;
        do {
            newSpecialFood = getRandomPosition();
        } while (
            snake.some(segment => segment.x === newSpecialFood.x && segment.y === newSpecialFood.y) ||
            (food.x === newSpecialFood.x && food.y === newSpecialFood.y) ||
            (blackApple && blackApple.x === newSpecialFood.x && blackApple.y === newSpecialFood.y)
        );

        specialFood = newSpecialFood;
    }

    // Genera faba marrón
    function generateBrownBean() {
        const getRandomPosition = () => ({
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        });
        let newBrownBean;
        do {
            newBrownBean = getRandomPosition();
        } while (
            snake.some(segment => segment.x === newBrownBean.x && segment.y === newBrownBean.y) ||
            (food.x === newBrownBean.x && food.y === newBrownBean.y) ||
            (specialFood && specialFood.x === newBrownBean.x && specialFood.y === newBrownBean.y) ||
            (blackApple && blackApple.x === newBrownBean.x && blackApple.y === newBrownBean.y)
        );
        brownBean = newBrownBean;
    }

    // Genera manzana negra
    function generateBlackApple() {
        const getRandomPosition = () => ({
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        });

        let newBlackApple;
        do {
            newBlackApple = getRandomPosition();
        } while (
            snake.some(segment => segment.x === newBlackApple.x && segment.y === newBlackApple.y) ||
            (food.x === newBlackApple.x && food.y === newBlackApple.y) ||
            (specialFood && specialFood.x === newBlackApple.x && specialFood.y === newBlackApple.y)
        );

        blackApple = newBlackApple;
    }

    // Detecta colisiones
    function checkCollision() {
        const head = snake[0];
        return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }

    // Valida dirección
    function isDirectionValid(newDirection) {
        return !(direction.x + newDirection.x === 0 && direction.y + newDirection.y === 0);
    }

    // Resetea el juego
    function resetGame() {
        snake = [{ x: 200, y: 200 }];
        direction = { x: 0, y: 0 };
        score = 0;
        redFoodCount = 0;
        currentLevel = 0;
        document.getElementById("score").textContent = "Puntuación: 0";
        generateFood();
        specialFood = null;
        blackApple = null;
        brownBean = null;
        isDoubleSpeed = false;
        if (doubleSpeedTimeout) clearTimeout(doubleSpeedTimeout);
        if (gameInterval) clearInterval(gameInterval);
        startTime = null;
    }

    // Termina el juego
    function endGame() {
        if (!isGameRunning) return;
        
        isGameRunning = false;
        clearInterval(gameInterval);
        if (doubleSpeedTimeout) clearTimeout(doubleSpeedTimeout);
        isDoubleSpeed = false;
        // Ocultar los controles
        document.getElementById('controls').style.display = 'none';
        
        const endTime = Date.now();
        const duration = Math.floor((endTime - startTime) / 1000);
        const formattedDuration = formatTime(duration);
        
        saveResult(score, formattedDuration);
    }

    // Bucle principal del juego
    function gameLoop() {
        if (checkCollision()) {
            endGame();
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBlockedWalls();
        moveSnake();
        drawSnake();
        drawFood();
        drawSpecialFood();
        drawBlackApple();
        drawBrownBean();
    }

    // Control de teclas
    document.addEventListener("keydown", event => {
        if (!isGameRunning) return;

        switch (event.key) {
            case "ArrowUp":
                if (isDirectionValid({ x: 0, y: -gridSize })) {
                    direction = { x: 0, y: -gridSize };
                }
                break;
            case "ArrowDown":
                if (isDirectionValid({ x: 0, y: gridSize })) {
                    direction = { x: 0, y: gridSize };
                }
                break;
            case "ArrowLeft":
                if (isDirectionValid({ x: -gridSize, y: 0 })) {
                    direction = { x: -gridSize, y: 0 };
                }
                break;
            case "ArrowRight":
                if (isDirectionValid({ x: gridSize, y: 0 })) {
                    direction = { x: gridSize, y: 0 };
                }
                break;
        }
    });

    // Inicia el juego
    function startGame() {
        if (isGameRunning) return;
        
        // Mostrar los controles
        document.getElementById('controls').style.display = 'block';
        
        resetGame();
        direction = { x: gridSize, y: 0 };
        isGameRunning = true;
        startTime = Date.now();
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, normalInterval);
    }

    document.getElementById("startButton").addEventListener("click", startGame);



// =========================
// CRUCETA TACTIL
// =========================

const buttons = document.querySelectorAll(".dir-btn");

buttons.forEach(button => {

    button.addEventListener("click", () => {

        const dir = button.dataset.dir;

        console.log("BOTON PULSADO", dir);

        if (!isGameRunning) return;

        switch (dir) {

            case "UP":
                if (isDirectionValid({ x: 0, y: -gridSize })) {
                    direction = { x: 0, y: -gridSize };
                }
                break;

            case "DOWN":
                if (isDirectionValid({ x: 0, y: gridSize })) {
                    direction = { x: 0, y: gridSize };
                }
                break;

            case "LEFT":
                if (isDirectionValid({ x: -gridSize, y: 0 })) {
                    direction = { x: -gridSize, y: 0 };
                }
                break;

            case "RIGHT":
                if (isDirectionValid({ x: gridSize, y: 0 })) {
                    direction = { x: gridSize, y: 0 };
                }
                break;
        }

    });

});

const CACHE_NAME = 'esculibierto-cache-v1';
const urlsToCache = [
  '/',  // tu index.html
  '/static/css/style.css',  // si tienes CSS externo
  '/static/juego/scripts.js', // tu JS del juego
  '/static/juego/sprites.png', // cualquier imagen del juego
  '/static/pwa/snake_9339345.png'  // icono
];

// Instalación del service worker y cache inicial
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Interceptar peticiones y responder desde cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
// =========================
// Fin controles
// =========================
});
