const { Client, Events, GatewayIntentBits, Collection, EmbedBuilder} = require('discord.js')
const { io } = require("socket.io-client");

// dotenv
const dotenv = require('dotenv')
dotenv.config()
const { TOKEN } = process.env

// importação dos comandos
const fs = require("node:fs")
const path = require("node:path")
const deploy = require('./deploy-commands')
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"))

const client = new Client({ intents: [GatewayIntentBits.Guilds] })
client.commands = new Collection()

//socket to api

const socket = new io('ws://localhost:3000');

socket.on('queue-att', async (data) => {

    let message = await client.guilds.resolve(data.guildId).channels.resolve(data.channelId).messages.fetch(data.messageId)
    const embed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle("Response: GPT")
      .addFields(
        //{ name: "\u200B", value: "\u200B" },
        {
          name: `You are in the ${data.queue} position in queue.`,
          value: `You need to wait!`,
          inline: true,
        },
      );    

    await message.edit({embeds: [embed]})
})

socket.on('clear-embed', async (data) => {
    let message = await client.guilds.resolve(data.guildId).channels.resolve(data.channelId).messages.fetch(data.messageId)
    const embed = new EmbedBuilder()
    .setColor("Orange")
    .setTitle(data.query)
    .addFields(
        { name: "\u200B", value: "\u200B" },
      );   
    await message.edit({embeds: [embed]})
})

socket.on('queue-response', async (data) => {
    let message = await client.guilds.resolve(data.guildId).channels.resolve(data.channelId).messages.fetch(data.messageId)
    const embed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle(data.query)
      .addFields(
        ...data.response
      );    

    await message.edit({embeds: [embed]})

})

//=================

for (const file of commandFiles){
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command)
    } else  {
        console.log(`Esse comando em ${filePath} está com "data" ou "execute ausentes"`)
    } 
}

// Login do bot
client.once(Events.ClientReady, async c => {
    await deploy();
	console.log(`Pronto! Login realizado como ${c.user.tag}`)
});
client.login(TOKEN)

// Listener de interações com o bot
client.on(Events.InteractionCreate, async interaction =>{
    if (interaction.isStringSelectMenu()){
        const selected = interaction.values[0]
        if (selected == "javascript"){
            await interaction.reply("Documentação do Javascript: https://developer.mozilla.org/en-US/docs/Web/JavaScript")
        } else if (selected == "python"){
            await interaction.reply("Documentação do Python: https://www.python.org")
        } else if (selected == "csharp"){
            await interaction.reply("Documentação do C#: https://learn.microsoft.com/en-us/dotnet/csharp/")
        } else if (selected == "discordjs"){
            await interaction.reply("Documentação do Discord.js: https://discordjs.guide/#before-you-begin")
        }
    }
    if (!interaction.isChatInputCommand()) return
    const command = interaction.client.commands.get(interaction.commandName)
    if (!command) {
        console.error("Comando não encontrado")
        return
    }
    try {
        await command.execute(interaction)
    } 
    catch (error) {
        console.error(error)
        await interaction.reply("Houve um erro ao executar esse comando!")
    }
})
