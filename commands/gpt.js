const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const embedPlaceholder = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Wait...")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gpt")
    .setDescription("Ask something to ChatGPT(internet connected)!")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("Type the sentence.")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    let input = interaction.options.get("input");
    let response = await interaction.reply({embeds: [embedPlaceholder]});
    let id = await interaction.fetchReply()
    let res = await fetch(
      `http://localhost:3000/search-discord?q=${encodeURI(
        input.value
      )}&messageId=${id.id}&channelId=${response.interaction.channelId}&guildId=${response.interaction.guildId}`
    );
    res = await res.json();
    const embed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle("Response: GPT")
      .addFields(
        //{ name: "\u200B", value: "\u200B" },
        {
          name: `You are in the ${res.queue} position in queue.`,
          value: `You need to wait!`,
          inline: true,
        },
      );    
    
    await interaction.editReply({embeds: [embed]})
  },
};
