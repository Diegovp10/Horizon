let currentChatTopic = '';
let chats = JSON.parse(localStorage.getItem('chats')) || [];

function navigate(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    // Cargar el contenido adecuado según la página
    if (pageId === 'history-page') {
        loadChatHistory();
    } else if (pageId === 'scenarios-page') {
        loadScenarios();
    } else if (pageId === 'chat-page') {
        // Asegurarse de que el chat esté listo
        const chatContainer = document.getElementById('chat-container');
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

function handleAnswerKeyDown(event, answerId) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevenir el salto de línea
        const answerBox = document.getElementById(answerId);
        const answer = answerBox.textContent.trim();
        
        if (answer) {
            // Guardar la respuesta en localStorage
            let savedAnswers = JSON.parse(localStorage.getItem('profileAnswers')) || {};
            savedAnswers[answerId] = answer;
            localStorage.setItem('profileAnswers', JSON.stringify(savedAnswers));
            
            // Quitar el foco del elemento
            answerBox.blur();
        }
    }
}

function loadSavedAnswers() {
    const savedAnswers = JSON.parse(localStorage.getItem('profileAnswers')) || {};
    
    // Cargar respuestas en los cuadros
    for (const answerId in savedAnswers) {
        if (document.getElementById(answerId)) {
            document.getElementById(answerId).textContent = savedAnswers[answerId];
        }
    }
}

function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const taskList = document.getElementById('task-list');
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `<input type="checkbox" onchange="completeTask(this)"> ${taskText}`;
    taskList.appendChild(li);
    taskInput.value = '';
    
    // Guardar tareas en localStorage
    saveTasks();
}

function saveTasks() {
    const taskItems = document.querySelectorAll('#task-list .task-item');
    const tasks = Array.from(taskItems).map(item => {
        return {
            text: item.textContent.trim(),
            completed: item.classList.contains('completed')
        };
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function completeTask(checkbox) {
    const li = checkbox.parentElement;
    li.classList.add('completed');
    setTimeout(() => {
        li.remove();
        saveTasks();
    }, 1000);
}

function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    if (!message) return;

    const chatContainer = document.getElementById('chat-container');
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    userMessage.innerHTML = `<p>${message}</p>`;
    chatContainer.appendChild(userMessage);

    // Mostrar indicador de escritura
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-message ai-message typing';
    typingIndicator.innerHTML = `<p>Escribiendo...</p>`;
    chatContainer.appendChild(typingIndicator);
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
    chatInput.value = '';

    // Simular respuesta de IA con un pequeño retraso para realismo
    setTimeout(() => {
        chatContainer.removeChild(typingIndicator);
        const aiResponse = generateAIResponse(message);
        const aiMessage = document.createElement('div');
        aiMessage.className = 'chat-message ai-message';
        aiMessage.innerHTML = `<p>${aiResponse.replace(/\n/g, '<br>')}</p>`; // Convertir \n a <br>
        chatContainer.appendChild(aiMessage);

        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Guardar chat
        currentChatTopic = message.length > 30 ? message.substring(0, 30) + "..." : message;
        const chatExists = chats.findIndex(chat => chat.topic === currentChatTopic);
        
        if (chatExists !== -1) {
            chats[chatExists].messages.push(message, aiResponse);
        } else {
            chats.push({ topic: currentChatTopic, messages: [message, aiResponse] });
        }
        
        localStorage.setItem('chats', JSON.stringify(chats));
        
        // Permitir ver escenarios después de cada mensaje
        const scenariosButton = document.createElement('div');
        scenariosButton.className = 'chat-message ai-message scenarios-button';
        scenariosButton.innerHTML = `<p><a href="#" onclick="navigate('scenarios-page'); return false;">Ver análisis de escenarios</a></p>`;
        chatContainer.appendChild(scenariosButton);
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 1500);
}

function generateAIResponse(message) {
    // Mejorada la simulación de IA para respuestas variadas
    const responses = [
        `Entiendo tu situación sobre "${message}". Vamos a analizarlo juntos:\n\n1. Considera tus prioridades: ¿Qué es más importante para ti en este momento? Piensa en cómo afecta tus metas a largo plazo.\n2. Evalúa los riesgos: ¿Qué podrías perder o ganar con esta decisión?\n3. Piensa en el impacto emocional: A veces, nuestras emociones nos guían más de lo que pensamos.\n4. Busca información adicional si te hace falta.\n5. Haz una lista de pros y contras: Puedes ver una simulación en la sección de escenarios.\n6. Considera el timing: ¿Es el momento adecuado?\n7. Confía en tu intuición: A veces nuestro instinto nos da pistas claras.\n8. Reflexiona sobre decisiones pasadas similares.\n9. Tómate tu tiempo, no te apresures.\n10. Estoy aquí para ayudarte: Si quieres profundizar más, dime.`,
        
        `Analicemos tu situación sobre "${message}":\n\n1. Identifica qué valores personales están en juego con esta decisión.\n2. Considera quiénes se verán afectados por tu elección y cómo.\n3. Piensa en soluciones alternativas que quizás no has considerado.\n4. Establece un plazo para tomar la decisión final.\n5. Visualiza cómo te sentirás dentro de un año con cada opción.\n6. Pregúntate si estás evitando algo por miedo.\n7. Evalúa si tienes toda la información necesaria.\n8. Considera si la decisión es realmente tan importante como parece ahora.\n9. Piensa en qué te arrepentirías más: actuar o no actuar.\n10. Recuerda que puedes ver una simulación de escenarios para analizar pros y contras.`,
        
        `Respecto a tu consulta sobre "${message}":\n\n1. Diferencia entre lo que quieres y lo que necesitas en esta situación.\n2. Contempla las consecuencias a corto, medio y largo plazo.\n3. Busca patrones en decisiones similares que hayas tomado antes.\n4. Considera si estás siendo influenciado por presiones externas.\n5. Evalúa si esta decisión refleja quién eres o quién quieres ser.\n6. Analiza si hay conflictos internos que te están dificultando decidir.\n7. Imagina qué consejo le darías a un amigo en tu situación.\n8. Divide la decisión en partes más pequeñas si te resulta abrumadora.\n9. Considera que cada opción tiene ventajas y desventajas.\n10. Recuerda que puedes consultar más detalles en la simulación de escenarios.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function loadChatHistory() {
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML = '';
    
    if (chats.length === 0) {
        chatHistory.innerHTML = '<p>No hay conversaciones guardadas</p>';
        return;
    }
    
    chats.forEach((chat, index) => {
        const button = document.createElement('button');
        button.textContent = chat.topic;
        button.onclick = () => loadChat(index);
        chatHistory.appendChild(button);
    });
}

function loadChat(index) {
    const chat = chats[index];
    currentChatTopic = chat.topic;
    
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';
    
    chat.messages.forEach((msg, i) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${i % 2 === 0 ? 'user-message' : 'ai-message'}`;
        messageDiv.innerHTML = `<p>${msg}</p>`;
        chatContainer.appendChild(messageDiv);
    });
    
    // Añadir botón para ver escenarios
    const scenariosButton = document.createElement('div');
    scenariosButton.className = 'chat-message ai-message scenarios-button';
    scenariosButton.innerHTML = `<p><a href="#" onclick="navigate('scenarios-page'); return false;">Ver análisis de escenarios</a></p>`;
    chatContainer.appendChild(scenariosButton);
    
    navigate('chat-page');
}

function loadScenarios() {
    const scenarioContent = document.getElementById('scenario-content');
    
    if (!currentChatTopic || currentChatTopic.trim() === '') {
        scenarioContent.innerHTML = '<p>No hay una conversación reciente para analizar. Por favor, inicia un chat primero.</p>';
        return;
    }

    scenarioContent.innerHTML = '';

    const optionA = document.createElement('div');
    optionA.className = 'scenario-option';
    optionA.innerHTML = `
        <h3>Opción A: Aceptar "${currentChatTopic}"</h3>
        <p class="pro">Pro 1: Posible mejora en tu situación actual.</p>
        <p class="pro">Pro 2: Nuevas oportunidades de crecimiento.</p>
        <p class="pro">Pro 3: Posibilidad de adquirir nuevas habilidades.</p>
        <p class="con">Contra 1: Riesgo de incertidumbre inicial.</p>
        <p class="con">Contra 2: Puede requerir más esfuerzo inicial.</p>
        <p class="con">Contra 3: Posible resistencia de personas cercanas.</p>
    `;

    const optionB = document.createElement('div');
    optionB.className = 'scenario-option';
    optionB.innerHTML = `
        <h3>Opción B: Rechazar "${currentChatTopic}"</h3>
        <p class="pro">Pro 1: Mantienes estabilidad actual.</p>
        <p class="pro">Pro 2: Menos estrés a corto plazo.</p>
        <p class="pro">Pro 3: Conservas recursos para otras oportunidades.</p>
        <p class="con">Contra 1: Podrías perder una buena oportunidad.</p>
        <p class="con">Contra 2: Puede limitar tu crecimiento futuro.</p>
        <p class="con">Contra 3: Posible arrepentimiento más adelante.</p>
    `;

    scenarioContent.appendChild(optionA);
    scenarioContent.appendChild(optionB);
    
    // Agregar botón para volver al chat
    const backButton = document.createElement('button');
    backButton.textContent = 'Volver al chat';
    backButton.onclick = () => navigate('chat-page');
    scenarioContent.appendChild(backButton);
}

// Cargar datos guardados al iniciar
function loadSavedData() {
    // Cargar respuestas del perfil
    loadSavedAnswers();
    
    // Cargar tareas
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (savedTasks.length > 0) {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        savedTasks.forEach(task => {
            if (!task.completed) {
                const li = document.createElement('li');
                li.className = 'task-item';
                li.innerHTML = `<input type="checkbox" onchange="completeTask(this)"> ${task.text}`;
                taskList.appendChild(li);
            }
        });
    }
}

// Inicializar la app
document.addEventListener('DOMContentLoaded', () => {
    navigate('home-page');
    loadSavedData();
    
    // Permitir enviar mensajes con Enter
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Permitir agregar tareas con Enter
    document.getElementById('task-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Hacer clickeable el mensaje de ayuda para ir al chat
    document.querySelector('.helper-message').addEventListener('click', function() {
        navigate('chat-page');
    });
});