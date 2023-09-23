const axios = require('axios');
const { server } = require('../utils/config');
const { editKeyboard } = require('../utils/keyboards');

module.exports = (ctx, userStates) => {
    const args = ctx.message.text.split(' ');
    const userId = ctx.from.id;
    userStates[userId] = userStates[userId] || {};
    userStates[userId].mode = 'EDIT'; 
    if (args.length === 2) {
        const productId = args[1];
        axios.get(`${server}/api/order?id=${productId}`).then((res)=>{
            const status = res.data.status;
            const product = res.data.product;
            if(status === 200){
                const message = `ID товара: ${productId}\n\nНазвание: ${product.name}\nЦена: ${product.price} ₽\nСтарая цена: ${product.oldPrice}\nКредит от: ${product.credit}\nГрафик цены: ${product.priceGraph}\nДата доставки: ${product.deliveryTerm}\nДругая цена : ${product.differentPrice} ₽\nПуть товара:\n ${product.breadCrumbs.map((item, index)=> (index !== 0 ? " "+ item  : item))}\nИзображения:\n${product.images.map((image, index) => `${index + 1}) ${image}`).join('\n')}\nПараметры:\n${product.paramsList.map(param => `${param.title}: ${param.params.join(', ')}`).join('\n')}\nХарактеристики:\n${product.characteristics.slice(0, 2).map(chara => `${chara.title}:\n${chara.list.map(item => `${item.name}: ${item.value}`).join('\n')}`).join('\n\n')}\n${product.characteristics.length > 2 ? '...и т.д.' : ''}\nОписание:\n${product.description.length > 100 ? product.description.slice(0, 100) + '...' : product.description}\nИнформация о магазине:\nНазвание: ${product.store[0].name}\nЛого: ${product.store[0].logo}\n\nДополнительно:\nРейтинг: ${product.commonInfo[0].rating}\nОценок: ${product.commonInfo[0].ratingCount}\nЗаказов: ${product.commonInfo[0].orderCount}+
                `
                ctx.reply(message, editKeyboard(product));
            }
        }).catch((err)=>{
            ctx.reply(`Произошла ошибка во время поиска товара`);
        });
    } else {
        ctx.reply('Пожалуйста, введите команду в формате /edit <ID>');
    }
};
