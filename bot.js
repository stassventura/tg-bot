const { Telegraf, Markup  } = require('telegraf');
const {server, BOT_TOKEN} = require('./utils/config')
const bot = new Telegraf(BOT_TOKEN);
const axios =  require('axios')
const addCommand = require('./commands/add');
const cancelCommand = require('./commands/cancel');
const editCommand = require('./commands/edit');
const deleteCommand = require('./commands/delete');
const { editAction } = require('./actions');

const { STATES } = require('./utils/states');
const userStates = {};
const context = {
    edit: {}
};


const confirmationKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Создать', 'confirm')],
    [Markup.button.callback('Отменить', 'cancel')]
]);
const paramKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Добавить еще', 'add_param')],
    [Markup.button.callback('Завершить', 'finish_params')]
]);

const addMoreOrContinueKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Продолжить с новой характеристикой', 'next_characteristic')],
    [Markup.button.callback('Завершить добавление характеристик', 'finish_characteristics')],
]);
bot.command('cancel', (ctx) => {
    if (!userStates[ctx.from.id]) {
        userStates[ctx.from.id] = {};
    }
    cancelCommand(ctx, userStates);
});
            
bot.command('add', (ctx) => {
    if (!userStates[ctx.from.id]) {
        userStates[ctx.from.id] = {};
    }
    addCommand(ctx, userStates);
});



bot.command('edit', (ctx) => {
    editCommand(ctx, userStates);
});

bot.command('delete', deleteCommand);



bot.start((ctx) => {
    ctx.reply(`Привет, ${ctx.from.first_name}!`);
});



bot.on('text', (ctx) => {
    const userState = userStates[ctx.from.id];
    if (!userState) return;
    if (userState.data) {
        switch (userState.state) {
            case STATES.WAITING_FOR_ID:
                userState.data.id = ctx.message.text;
                userState.state = STATES.WAITING_FOR_NAME;
                ctx.reply('Введите название товара:');
                break;
            case STATES.WAITING_FOR_NAME:
                userState.data.name = ctx.message.text;
                userState.state = STATES.WAITING_FOR_PRICE;
                ctx.reply('Введите цену товара:');
                break;
                case STATES.WAITING_FOR_PRICE:
                userState.data.price = ctx.message.text;
                userState.state = STATES.WAITING_FOR_OLDPRICE;
                ctx.reply('Введите старую цену товара:');
                break;
            case STATES.WAITING_FOR_OLDPRICE:
                userState.data.oldPrice = ctx.message.text;
                userState.state = STATES.WAITING_FOR_CREDIT;
                ctx.reply('В кредит от:');
                break;
                
            case STATES.WAITING_FOR_CREDIT:
                userState.data.credit = ctx.message.text;
                userState.state = STATES.WAITING_FOR_PRICEGRAPH;
                ctx.reply('График цены:');
                break;
                
            case STATES.WAITING_FOR_PRICEGRAPH:
                userState.data.priceGraph = ctx.message.text;
                userState.state = STATES.WAITING_FOR_DELIVERY_TERM;
                ctx.reply('Дата доставки:');
                break;
            case STATES.WAITING_FOR_DELIVERY_TERM:
                userState.data.deliveryTerm = ctx.message.text;
                userState.state = STATES.WAITING_FOR_DIFFERENT_PRICE;
                ctx.reply('Цена у других продавцов:');
                break;
                
            case STATES.WAITING_FOR_DIFFERENT_PRICE:
                userState.data.differentPrice = ctx.message.text;
                userState.state = STATES.WAITING_FOR_CATEGORIES_WAY;
                ctx.reply('Путь категорий через запятую:');
                break;
                
            case STATES.WAITING_FOR_CATEGORIES_WAY:
                userState.data.breadCrumbs = ctx.message.text.split(',').map(p => p.trim());
                userState.state = STATES.WAITING_FOR_IMAGES;
                ctx.reply('Ссылки на изображения через запятую:');
                break;
            case STATES.WAITING_FOR_IMAGES:
                userState.data.images = ctx.message.text.split(',').map(p => p.trim());
                userState.state = STATES.WAITING_FOR_PARAM_TITLE;
                ctx.reply('Введите заголовок параметра:');
                break;
            
            case STATES.WAITING_FOR_PARAM_TITLE:
                userState.currentParam = { title: ctx.message.text, params: [] };
                userState.state = STATES.WAITING_FOR_PARAM_VALUES;
                ctx.reply('Введите значения параметра через запятую:');
                break;
            
            case STATES.WAITING_FOR_PARAM_VALUES:
                userState.currentParam.params = ctx.message.text.split(',').map(p => p.trim());
                userState.data.paramsList = userState.data.paramsList || [];
                userState.data.paramsList.push(userState.currentParam);
                userState.state = STATES.CONFIRM_PARAM;
                ctx.reply(`Параметр:\nЗаголовок: ${userState.currentParam.title}\nЗначения: ${userState.currentParam.params.join(', ')}\nДобавить еще или завершить?`, paramKeyboard);
                break;
                case STATES.CONFIRM_PARAM:
                    userState.state = STATES.WAITING_FOR_CHARACTERISTIC_TITLE;
                    ctx.reply('Введите заголовок характеристики:');
                    break;
                
                case STATES.WAITING_FOR_CHARACTERISTIC_TITLE:
                    userState.currentCharacteristic = {
                        title: ctx.message.text,
                        list: []
                    };
                    userState.state = STATES.WAITING_FOR_CHARACTERISTIC_KEY_VALUE;
                    ctx.reply('Отправьте значения характеристики в формате - ключ=значение, ключ=значение, и тд.. :');
                    break;
                
                case STATES.WAITING_FOR_CHARACTERISTIC_KEY_VALUE:
                    const keyValuePairs = ctx.message.text.split(',');
                    keyValuePairs.forEach(pair => {
                        const [key, value] = pair.split('=');
                        if (key && value) {
                            userState.currentCharacteristic.list.push({ name: key.trim(), value: value.trim() });
                        }
                    });
                    userState.state = STATES.CHARACTERISTIC_CONFIRMATION;
                    ctx.reply('Добавить еще одну характеристику или завершить добавление характеристик?', addMoreOrContinueKeyboard);
                    break;
                    
                case STATES.CHARACTERISTIC_CONFIRMATION:
                    userState.state = STATES.WAITING_FOR_DESCRIPTION;
                    ctx.reply('Введите описание товара:');
                    break;
        
                case STATES.WAITING_FOR_DESCRIPTION:
                    userState.data.description = ctx.message.text;
                    userState.state = STATES.WAITING_FOR_STORE_NAME;
                    ctx.reply('Введите имя магазина:');
                    break;
        
                case STATES.WAITING_FOR_STORE_NAME:
                    userState.data.store = userState.data.store || [];
                    userState.currentStore = { name: ctx.message.text };
                    userState.state = STATES.WAITING_FOR_STORE_LOGO;
                    ctx.reply('Введите ссылку на логотип магазина:');
                    break;
        
                case STATES.WAITING_FOR_STORE_LOGO:
                    userState.currentStore.logo = ctx.message.text;
                    userState.data.store.push(userState.currentStore);
                    userState.currentStore = null;
                    userState.state = STATES.WAITING_FOR_COMMON_INFO;
                    ctx.reply('Введите рейтинг, количество отзывов и количество заказов через запятую. Например: 4.9,5,20');
                    break;
        
                case STATES.WAITING_FOR_COMMON_INFO:
                    const [rating, ratingCount, orderCount] = ctx.message.text.split(',').map(item => item.trim());
                    userState.data.commonInfo = [{ rating, ratingCount, orderCount }];
                    userState.state = STATES.CONFIRMATION;
                    ctx.reply('Подтвердите создание товара:', confirmationKeyboard);
                    break;
            default:
                ctx.reply('Неизвестное состояние');
            break;
    
            
        }
    }
    if (context.edit && context.edit.userId === ctx.from.id) {
        let edit = context.edit
        console.log(`For product ${edit.productId}, changing ${edit.param} to ${ctx.message.text}`);
        let newValue = ctx.message.text
        if (edit.param === 'images' || edit.param === 'breadCrumbs') {
            newValue = newValue.split(',').map(item => item.trim());
        }else if (edit.param === 'store') {
            const [name, logo] = newValue.split(',').map(item => item.trim());
            newValue = [{ name, logo }];
        }
        axios.post(`${server}/api/order/update`, {
            productId: edit.productId,
            param: edit.param,
            newValue: newValue
        }).then((res)=>{
            console.log(res)
            ctx.reply(`Успешно обновлено`);
        }).catch((err)=>{
            console.log(err)
            ctx.reply(`Ошибка при обновлении`);
        })
        context.edit = {};
    }

});


bot.action(/edit_(.+)_([0-9]+)/, editAction(userStates, context));

bot.action('confirm', async (ctx) => {
    const userState = userStates[ctx.from.id];
    if (userState && userState.state === STATES.CONFIRMATION) {
        await ctx.editMessageReplyMarkup();

        axios.post(`${server}/api/order`, userStates[ctx.from.id].data).then((res)=>{
            if(res.data.message === 'Product successfully created'){
                ctx.editMessageText('Товар добавлен!', { reply_markup: { inline_keyboard: [] } });
                userStates[ctx.from.id] = undefined; 
            }
               
            
        }).catch((err)=>{
            console.log(err)
            ctx.editMessageText('Ошибка при добавлении товара', { reply_markup: { inline_keyboard: [] } });
        })

    }
});



bot.action('next_characteristic', async  (ctx) => {
    const userState = userStates[ctx.from.id];
    await ctx.editMessageReplyMarkup();

    if (userState.currentCharacteristic && userState.currentCharacteristic.title && userState.currentCharacteristic.list.length) {
        userState.data.characteristics = userState.data.characteristics || [];
        userState.data.characteristics.push(userState.currentCharacteristic);
    }
    userState.currentCharacteristic = null; 
    userState.state = STATES.WAITING_FOR_CHARACTERISTIC_TITLE;
    ctx.reply('Введите название следующей характеристики:');
});

bot.action('finish_characteristics', async  (ctx) => {
    const userState = userStates[ctx.from.id];
    await ctx.editMessageReplyMarkup();

    if (userState.currentCharacteristic && userState.currentCharacteristic.title && userState.currentCharacteristic.list.length) {
        userState.data.characteristics = userState.data.characteristics || [];
        userState.data.characteristics.push(userState.currentCharacteristic);
    }
    userState.currentCharacteristic = null; 
    userState.state = STATES.WAITING_FOR_DESCRIPTION;
    ctx.reply('Введите описание товара:');
});


bot.action('add_param', async  (ctx) => {
    const userState = userStates[ctx.from.id];
    await ctx.editMessageReplyMarkup();

    if (userState && userState.state === STATES.CONFIRM_PARAM) {
        userState.state = STATES.WAITING_FOR_PARAM_TITLE;
        ctx.reply('Введите заголовок следующего параметра:');
    }
});

bot.action('finish_params', async  (ctx) => {
    const userState = userStates[ctx.from.id];
    await ctx.editMessageReplyMarkup();

    if (userState.state === STATES.CONFIRM_PARAM) {
        userState.state = STATES.WAITING_FOR_CHARACTERISTIC_TITLE;
        ctx.reply('Введите заголовок характеристики:');
    }
});



bot.launch();



