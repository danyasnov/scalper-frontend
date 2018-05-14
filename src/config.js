let config = {
    bittrexUrl: 'https://cors.io/?https://bittrex.com/api/v1.1/public'
};

if (process.env.NODE_ENV === 'development') {
    config.backend = 'http://localhost:3000';
    config.bot_name = 'dan_yasnov_bot'
} else {
    config.backend = '';
    config.bot_name = 'scalper_platform_bot'
}

export default config;