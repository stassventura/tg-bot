const { Telegraf, Markup  } = require('telegraf');
const BOT_TOKEN = '6476624620:AAFS53NGI9hTwc5hn4GdTG_cdVTgc2Mq-78';
const bot = new Telegraf(BOT_TOKEN);
const server = 'http://localhost:5000'
const axios =  require('axios')
const addCommand = require('./commands/add');

const userStates = {};

const STATES = {
    NONE: 'NONE',
    WAITING_FOR_ID: 'WAITING_FOR_ID',
    WAITING_FOR_NAME: 'WAITING_FOR_NAME',
    WAITING_FOR_PRICE: 'WAITING_FOR_PRICE',
    WAITING_FOR_OLDPRICE: 'WAITING_FOR_OLDPRICE',
    WAITING_FOR_CREDIT: 'WAITING_FOR_CREDIT',
    WAITING_FOR_PRICEGRAPH: 'WAITING_FOR_PRICEGRAPH',
    WAITING_FOR_DELIVERY_TERM: 'WAITING_FOR_DELIVERY_TERM',
    WAITING_FOR_CATEGORIES_WAY: 'WAITING_FOR_CATEGORIES_WAY',
    WAITING_FOR_IMAGES: 'WAITING_FOR_IMAGES',
    WAITING_FOR_PARAM_TITLE: 'WAITING_FOR_PARAM_TITLE',
    WAITING_FOR_PARAM_VALUES: 'WAITING_FOR_PARAM_VALUES',
    WAITING_FOR_CHARACTERISTIC_TITLE: 'WAITING_FOR_CHARACTERISTIC_TITLE',
    WAITING_FOR_CHARACTERISTIC_KEY_VALUE: 'WAITING_FOR_CHARACTERISTIC_KEY_VALUE',
    CHARACTERISTIC_CONFIRMATION: 'CHARACTERISTIC_CONFIRMATION',
    ADD_MORE_OR_CONTINUE: 'ADD_MORE_OR_CONTINUE',
    WAITING_FOR_DESCRIPTION: 'WAITING_FOR_DESCRIPTION',
    WAITING_FOR_STORE_NAME: 'WAITING_FOR_STORE_NAME',
    WAITING_FOR_STORE_LOGO: 'WAITING_FOR_STORE_LOGO',
    WAITING_FOR_COMMON_INFO: 'WAITING_FOR_COMMON_INFO',
    CONFIRMATION: 'CONFIRMATION'
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
    const userState = userStates[ctx.from.id];
    userState.state = STATES.CONFIRMATION
    ctx.reply('Отменено');
    userStates[ctx.from.id] = undefined; 
});
            
bot.command('add', (ctx) => {
    // userStates[ctx.from.id] = {
    //     state: STATES.WAITING_FOR_ID,
    //     data: {}
    // };
    // ctx.reply('Введите ID товара:');
    addCommand(ctx, userStates)
});

const editKeyboard = (product) => {
    return Markup.inlineKeyboard([
        [Markup.button.callback('Изменить ID', `id_${product.id}`)],
        [Markup.button.callback('Изменить название', `name_${product.id}`)],
        [Markup.button.callback('Изменить цену', `price_${product.id}`)],
        [Markup.button.callback('Изменить старую цену', `oldPrice_${product.id}`)],
        [Markup.button.callback('Изменить кредит', `credit_${product.id}`)],
        [Markup.button.callback('Изменить график цены', `priceGraph_${product.id}`)],
        [Markup.button.callback('Изменить дату доставки', `deliveryTerm_${product.id}`)],
        [Markup.button.callback('Изменить другую цену', `differentPrice_${product.id}`)],
        [Markup.button.callback('Изменить путь товара', `breadCrumbs_${product.id}`)],
        [Markup.button.callback('Изменить изображения', `images_${product.id}`)],
        [Markup.button.callback('Изменить описание', `description_${product.id}`)],
        [Markup.button.callback('Изменить информацию о магазине', `store_${product.id}`)],
    ]);
};


bot.command('edit', (ctx) => {
    const args = ctx.message.text.split(' ');
    const userId = ctx.from.id;
    userStates[userId] = userStates[userId] || {};
    userStates[userId].mode = 'EDIT'; // установка режима редактирования
    if (args.length === 2) {
        const productId = args[1];
        axios.get(`${server}/api/order?id=${productId}`).then((res)=>{
            console.log(res.data.status)
            const status = res.data.status
            const product = res.data.product
            if(status === 200){
            console.log(product)
            const message = `ID товара: ${productId}\n\nНазвание: ${product.name}\nЦена: ${product.price} ₽\nСтарая цена: ${product.oldPrice}\nКредит от: ${product.credit}\nГрафик цены: ${product.priceGraph}\nДата доставки: ${product.deliveryTerm}\nДругая цена : ${product.differentPrice} ₽\nПуть товара:\n ${product.breadCrumbs.map((item, index)=> (index !== 0 ? " "+ item  : item))}\nИзображения:\n${product.images.map((image, index) => `${index + 1}) ${image}`).join('\n')}\nПараметры:\n${product.paramsList.map(param => `${param.title}: ${param.params.join(', ')}`).join('\n')}\nХарактеристики:\n${product.characteristics.slice(0, 2).map(chara => `${chara.title}:\n${chara.list.map(item => `${item.name}: ${item.value}`).join('\n')}`).join('\n\n')}\n${product.characteristics.length > 2 ? '...и т.д.' : ''}\nОписание:\n${product.description.length > 100 ? product.description.slice(0, 100) + '...' : product.description}\nИнформация о магазине:\nНазвание: ${product.store[0].name}\nЛого: ${product.store[0].logo}\n\nДополнительно:\nРейтинг: ${product.commonInfo[0].rating}\nОценок: ${product.commonInfo[0].ratingCount}\nЗаказов: ${product.commonInfo[0].orderCount}+
             `
            ctx.reply(`${message}`, editKeyboard(product));
            }
        }).catch((err)=>{
            ctx.reply(`Произошла ошибка во время поиска товара`);
        })
    } else {
        ctx.reply('Пожалуйста, введите команду в формате /edit <ID>');
    }
});

bot.command('delete', (ctx) => {
    const input = ctx.message.text.split(' ');
    if (input.length !== 2) {
        return ctx.reply('Введите команду в формате: /delete productId');
    }

    const productId = input[1];
    
    axios.post(`${server}/api/order/delete`, { productId })
        .then((res) => {
            ctx.reply(res.data.message);
        })
        .catch((err) => {
            console.error(err);
            ctx.reply('Произошла ошибка при удалении товара.');
        });
});


bot.start((ctx) => {
    console.log("Received start command");
    ctx.reply('Привет! Я ваш новый телеграм-бот!');
});

let edit = {};


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
    
    
    
    if (edit && edit.userId === ctx.from.id) {
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
        edit = {};
    }

});



bot.on('callback_query', (ctx) => {
    const [parameter, productID] = ctx.callbackQuery.data.split('_');
    console.log(`Product ID: ${productID}, Parameter to edit: ${parameter}`);

    edit = {
        userId: ctx.from.id,
        param: parameter,
        productId: productID
    };

    let message = ``;
    
    switch (parameter) {
        case 'id':
            message = 'Введите новый ID товара:';
            break;
        case 'name':
            message = 'Введите новое название товара:';
            break;
        case 'price':
            message = 'Введите новую цену товара:';
            break;
        case 'oldPrice':
            message = 'Введите новую (старую цену) товара:';
            break;
        case 'credit':
            message = 'Введите новый кредит:';
            break;
        case 'priceGraph':
            message = 'Введите новый коеф.графика цены:';
            break;
        case 'deliveryTerm':
            message = 'Введите новую дату доставки:';
            break;
        case 'differentPrice':
            message = 'Введите новую другую цену:';
            break;
        case 'breadCrumbs':
            message = 'Введите новый путь товара через запятую:';
            break;
        case 'images':
            message = 'Введите новые ссылки на изображения через запятую:';
            break
        case 'description':
            message = 'Введите новое описание:';
            break
        case 'store':
            message = 'Введите новую информацию о магазине(название, ссылка на логотип):';
            break
        default:
            break;
    }

    ctx.reply(message);
    ctx.answerCbQuery();
});


bot.action('confirm', async (ctx) => {
    const userState = userStates[ctx.from.id];
    if (userState && userState.state === STATES.CONFIRMATION) {
        // Здесь отправьте данные на сервер или выполните другие действия
        await ctx.editMessageReplyMarkup();

        // console.log(JSON.stringify(userStates[ctx.from.id].data, null, 2));
        axios.post(`${server}/api/order`, userStates[ctx.from.id].data).then((res)=>{
            // if(res.status === 200){
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
    userState.currentCharacteristic = null;  // reset current characteristic
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
    userState.currentCharacteristic = null;  // reset current characteristic
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



