const { STATES } = require('../utils/states');

module.exports = (ctx, userStates) => {
    if (!userStates[ctx.from.id]) {
        userStates[ctx.from.id] = {};
    }
    userStates[ctx.from.id].state = STATES.WAITING_FOR_ID;
    userStates[ctx.from.id].data = {};
    ctx.reply('Введите ID товара:');
};
