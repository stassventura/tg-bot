const { Markup } = require('telegraf');

const editKeyboard = (product) => {
    return Markup.inlineKeyboard([
        [Markup.button.callback('Изменить ID', `edit_id_${product.id}`)],
        [Markup.button.callback('Изменить название', `edit_name_${product.id}`)],
        [Markup.button.callback('Изменить цену', `edit_price_${product.id}`)],
        [Markup.button.callback('Изменить старую цену', `edit_oldPrice_${product.id}`)],
        [Markup.button.callback('Изменить кредит', `edit_credit_${product.id}`)],
        [Markup.button.callback('Изменить график цены', `edit_priceGraph_${product.id}`)],
        [Markup.button.callback('Изменить дату доставки', `edit_deliveryTerm_${product.id}`)],
        [Markup.button.callback('Изменить другую цену', `edit_differentPrice_${product.id}`)],
        [Markup.button.callback('Изменить путь товара', `edit_breadCrumbs_${product.id}`)],
        [Markup.button.callback('Изменить изображения', `edit_images_${product.id}`)],
        [Markup.button.callback('Изменить описание', `edit_description_${product.id}`)],
        [Markup.button.callback('Изменить информацию о магазине', `edit_store_${product.id}`)],
    ]);
};

module.exports = {
    editKeyboard
};
