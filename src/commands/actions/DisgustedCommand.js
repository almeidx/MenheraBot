const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class DisgustedCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'disgusted',
      aliases: ['nojo'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const list = [
      'https://i.imgur.com/6sAJms7.gif',
      'https://i.imgur.com/l5QgIAV.gif',
      'https://i.imgur.com/7AskNHD.gif',
      'https://i.imgur.com/LOSFoxm.gif',
      'https://i.imgur.com/xPIvx3i.gif',
      'https://i.imgur.com/JXNiWIL.gif',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];
    const user = message.mentions.users.first();
    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (user && user.bot) return message.menheraReply('error', t('commands:disgusted.bot'));

    if (!user || user.id === message.author.id) {
      const embed = new MessageEmbed()
        .setTitle(t('commands:disgusted.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(`${message.author} ${t('commands:disgusted.no-mention.embed_title')}`)
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(message.author.tag, avatar);

      return message.channel.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle('Nojo')
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands.disgusted.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    return message.channel.send(embed);
  }
};
