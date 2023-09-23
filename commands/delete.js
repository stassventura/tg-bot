const axios = require('axios');
const { server } = require('../utils/config');

module.exports = (ctx) => {
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
            ctx.reply(err.response.data.message);
        });
};
