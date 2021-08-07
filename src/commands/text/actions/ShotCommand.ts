import { MessageEmbed } from 'discord.js';
import Command from '@structures/command/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class ShotCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'shot',
      aliases: ['atirar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const rand = await http.getAssetImageUrl('shot');
    const user = ctx.message.mentions.users.first();

    if (!user) {
      await ctx.replyT('error', 'commands:shot.no-mention');
      return;
    }

    if (user === ctx.message.author) {
      await ctx.replyT('error', 'commands:shot.self-mention');
      return;
    }

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:shot.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:shot.embed_description')} ${user}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    await ctx.send(embed);
  }
}