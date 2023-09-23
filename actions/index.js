const { server } = require ("../utils/config");

const editAction = (userStates, context) => (ctx) => {
    const parameter = ctx.match[1];
    const productId = ctx.match[2];
    
    const userId = ctx.from.id;
    if(userStates[userId].mode !== 'EDIT'){
        return
    }
    console.log(`Product ID: ${productId}, Parameter to edit: ${parameter}`);
    context.edit = {
        userId: ctx.from.id,
        param: parameter,
        productId: productId
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
};



module.exports = {
    editAction
};