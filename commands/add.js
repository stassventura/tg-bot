const { STATES } = require('../utils/states');

module.exports = (ctx, userStates) => {
    userStates[ctx.from.id] = {
        state: STATES.WAITING_FOR_ID,
        data: {}
    };
    ctx.reply('Введите ID товара:');
};
