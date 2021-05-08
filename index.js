const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
const tokken = '1825046944:AAFhzOOhOO0bJk856JGKMExAaGqI8dwX-CY'
const sequelize = require('./db')
const UserModel = require('./models')

const bot = new TelegramApi(tokken,{polling:true})

bot.setMyCommands([
    {command:'/start',description:'Начальное приветствие'},
    {command:'/info',description:'Получить информацию о победах и поражениях'},
    {command:'/game',description:'Играть'},
])
const chats = {}


const start = async (msg) =>{

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e){
        if(e){
            console.error(`Подключение к БД сломал))) ${e}`)
        }
    }


    const chatId = msg.chat.id
    chats[chatId] = undefined
    await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.jpg')
    await bot.sendMessage(chatId,`Привет друг, твоё имя ${msg.from.first_name}, твой ID ${msg.from.id}`)
}

const startGame = async (chatId)=>{
    await bot.sendMessage(chatId, 'Я загадал цифру от 0 до 9')
    const random = Math.floor(Math.random() * 10)
    chats[chatId] = random.toString()
    console.log(random)
    await bot.sendMessage(chatId, 'Отгадывай! Давай сделай это!',gameOptions)
}

bot.on('message', async msg=>{
    const text = msg.text
    const chatId = msg.chat.id

    if(text === '/start'){
        await UserModel.create({chatId})
        await start(msg)
        return
    }
    if(text === '/info'){
        const user = await UserModel.findOne({chatId})
        await bot.sendMessage(chatId,`Количество побед: ${user.right}, \n Количество поражений: ${user.wrong}`)
        return
    }
    if(text === '/game'){
        startGame(chatId)
        return
    }
    return  bot.sendMessage(chatId, `Я не понимаю, что за бред ты пишешь?`)
})

bot.on('callback_query', async (msg) =>{
    const chatId = msg.message.chat.id
    const data = msg.data
    if(data === 'again'){
        startGame(chatId)
        return
    }

    const user = await UserModel.findOne({chatId})

    if(data == chats[chatId]){
        user.right += 1
        await bot.sendMessage(chatId,`Ура! Ты выиграл, я загадывал число: ${data}`,againOptions)
    } else {
        user.wrong += 1
        await bot.sendMessage(chatId, `Прости, я загадывал число ${chats[chatId]}, а ты выбрал ${msg.data} и проиграл`,againOptions)
    }
    await user.save()
})