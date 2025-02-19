const axios = require("axios");

const YOUTRACK_URL = "URL"; 
const YOUTRACK_TOKEN = "API"; // API YouTrack
const TELEGRAM_BOT_TOKEN = "API"; // Telegram
const TELEGRAM_CHAT_ID = "-"; // Chat ID канала

async function getTasks(status) {
    try {
        const response = await axios.get(`${YOUTRACK_URL}/api/issues`, {
            headers: {
                Authorization: `Bearer ${YOUTRACK_TOKEN}`,
                Accept: "application/json"
            },
            params: {
                query: `State: {${status}}`, // Фильтр по статусу
                fields: "idReadable,summary"
            }
        });

        

        return response.data;
    } catch (error) {
        console.error("Ошибка при получении задач:", error.response ? error.response.data : error);
        return [];
    }
}



async function sendTelegramMessage(tasks, title) {
    if (tasks.length === 0) return; // Если задач нет — выходим

    let message = `🔥 *${title}*\n`;
    tasks.forEach(task => {
        message += `🔹 [${task.idReadable}](${YOUTRACK_URL}/issue/${task.idReadable}): ${task.summary}\n`;
    });

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: true
    });
}

async function main() {
    const testTasks = await getTasks("Ожидает тестирования");  //Парсер по статусам
    const deployTasks = await getTasks("Выгружено на стейдж"); //Парсер по статусам

    await sendTelegramMessage(testTasks, "Задачи, ожидающие тестирования");
    await sendTelegramMessage(deployTasks, "Задачи, готовые к развертыванию");
}

main();
