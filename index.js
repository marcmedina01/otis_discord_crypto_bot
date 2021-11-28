require('dotenv').config(); //initialize dotenv
const cron = require("cron")
const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: process.env.APIKEY,
    APISECRET: process.env.APISECRET
});

let watchlist = process.env.WATCHLIST.split(',')

const {
    Client,
    Intents,
    CommandInteractionOptionResolver
} = require('discord.js');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]
});

client.on('ready', () => {
    console.log(`client ${client.user.tag} (${client.user.id}) is logged in!`);

});


client.on('messageCreate', async message => {

    if (message.mentions.has(client.user.id)) {
     
        if (message.content === '<@!' + client.user.id + '> ping') {
            message.channel.send('pong');
        }
        else if (message.content.includes("hello")) {
            message.channel.send('Greetings Sir.');
        }
        else if (message.content.includes("thank")) {
            message.channel.send("You're welcome Sir.");
        }
        else if (message.content.includes("good night")) {
            message.channel.send("Goodnight Sir.");
        } 
        else if (message.content.includes("good morning")) {
            message.channel.send("Goodmorning Sir.");
        }
        else if (message.content.includes("good job")) {
            message.channel.send("Thank you Sir.");
        }
        else if (message.content.includes("price")) {

            var n = message.content.split(" ");
            let ticker = await binance.prices(n[n.length - 1].toUpperCase());

            message.channel.send('Sir the last price of ' + n[n.length - 1].toUpperCase() + ' is... ' + ticker[n[n.length - 1].toUpperCase()]);
        }
        else if (message.content.includes("watchlist")) {

            message.channel.send("I'm watching these coins sir... " + watchlist.join());
        }
        else {
            message.channel.send("I'm sorry sir, I do not understand.");
        }
    };
});

let job = new cron.CronJob('*/10 * * * * *', () => {

    for (const symb of watchlist) {

        binance.candlesticks(symb, "5m", (error, ticks, symbol) => {
          
            let first_tick = ticks[0];
            let last_tick = ticks[ticks.length - 1];
            
            let increase = last_tick[4] - first_tick[4]
            let change = (increase / first_tick[4]) * 100
            
            let message = symbol + ":   before:" + first_tick[4] + "   after: " + last_tick[4] + "   increase: " + increase + "   change: " + change;

            if (change > 3) {
                client.channels.cache.get('914118077610860594').send("PUMP ALERT!:   " + message)
            }
            if (change < -3) {
                client.channels.cache.get('914118077610860594').send("DUMP ALERT!:   " + message)
            }
        }, { limit: 2 });

    }
   
    
})

job.start()



binance.exchangeInfo(function(response) {
    console.log(response);
});
client.login(process.env.CLIENT_TOKEN); // Replace the macro with your t