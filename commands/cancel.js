const { STATES } = require('../utils/states');

module.exports = (ctx, userStates) => {
    if (!userStates[ctx.from.id]) {
        userStates[ctx.from.id] = {};
    }
    const userState = userStates[ctx.from.id];
    userState.state = STATES.CONFIRMATION
    ctx.reply('Отменено');
    userStates[ctx.from.id] = undefined; 
};
