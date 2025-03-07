import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import HttpRequests from '@utils/HTTPrequests';
import moment from 'moment';
import { MessageEmbed } from 'discord.js-light';
import { COLORS, emojis } from '@structures/Constants';

export default class StatsInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'status',
      description: '「📊」・Veja os status de algo',
      options: [
        {
          name: 'blackjack',
          type: 'SUB_COMMAND',
          description: '「🃏」・Veja os status do blackjack de alguém',
          options: [
            {
              name: 'user',
              description: 'Usuário para ver os status',
              type: 'USER',
              required: false,
            },
          ],
        },
        {
          name: 'coinflip',
          description: '「💸」・Veja os status de coinflip de alguém',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              description: 'Usuário para ver os status',
              type: 'USER',
              required: false,
            },
          ],
        },
        {
          name: 'cacar',
          description: '「🏹」・Veja os status de caças de alguem',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              description: 'Usuário para ver os status',
              type: 'USER',
              required: false,
            },
          ],
        },
        {
          name: 'menhera',
          description: '「🧉」・Veja os status atuais da Menhera',
          type: 'SUB_COMMAND',
        },
      ],
      category: 'info',
      cooldown: 7,
      clientPermissions: ['EMBED_LINKS'],
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const type = ctx.options.getSubcommand();

    switch (type) {
      case 'cacar':
        return StatsInteractionCommand.hunt(ctx);
      case 'coinflip':
        return StatsInteractionCommand.coinflip(ctx);
      case 'blackjack':
        return StatsInteractionCommand.blackjack(ctx);
      case 'menhera':
        return StatsInteractionCommand.menhera(ctx);
    }
  }

  static async hunt(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.author;

    const data = await HttpRequests.getHuntUserStats(user.id);

    if (data.error) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'coinflip.error'),
        ephemeral: true,
      });
      return;
    }

    if (!data.user_id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'hunt.no-data'),
        ephemeral: true,
      });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.translate('hunt.embed-title', { user: user.tag }))
      .setColor(ctx.data.user.selectedColor)
      .addFields([
        {
          name: `${emojis.demons} | ${ctx.translate('hunt.demon')}`,
          value: `${ctx.translate('hunt.display-data', {
            tries: data.demon_tries,
            success:
              data.demon_success === 0
                ? '0'
                : ((data.demon_success / data.demon_tries) * 100).toFixed(1).replace('.0', ''),
            hunted: data.demon_hunted,
          })}`,
          inline: true,
        },
        {
          name: `${emojis.giants} | ${ctx.translate('hunt.giant')}`,
          value: `${ctx.translate('hunt.display-data', {
            tries: data.giant_tries,
            success:
              data.giant_success === 0
                ? '0'
                : ((data.giant_success / data.giant_tries) * 100).toFixed(1).replace('.0', ''),
            hunted: data.giant_hunted,
          })}`,
          inline: true,
        },
        {
          name: `${emojis.angels} | ${ctx.translate('hunt.angel')}`,
          value: `${ctx.translate('hunt.display-data', {
            tries: data.angel_tries,
            success:
              data.angel_success === 0
                ? '0'
                : ((data.angel_success / data.angel_tries) * 100).toFixed(1).replace('.0', ''),
            hunted: data.angel_hunted,
          })}`,
          inline: true,
        },
        {
          name: `${emojis.archangels} | ${ctx.translate('hunt.archangel')}`,
          value: `${ctx.translate('hunt.display-data', {
            tries: data.archangel_tries,
            success:
              data.archangel_success === 0
                ? '0'
                : ((data.archangel_success / data.archangel_tries) * 100)
                    .toFixed(1)
                    .replace('.0', ''),
            hunted: data.archangel_hunted,
          })}`,
          inline: true,
        },
        {
          name: `${emojis.demigods} | ${ctx.translate('hunt.demigod')}`,
          value: `${ctx.translate('hunt.display-data', {
            tries: data.demigod_tries,
            success:
              data.demigod_success === 0
                ? '0'
                : ((data.demigod_success / data.demigod_tries) * 100).toFixed(1).replace('.0', ''),
            hunted: data.demigod_hunted,
          })}`,
          inline: true,
        },
        {
          name: `${emojis.gods} | ${ctx.translate('hunt.god')}`,
          value: `${ctx.translate('hunt.display-data', {
            tries: data.god_tries,
            success:
              data.god_success === 0
                ? '0'
                : ((data.god_success / data.god_tries) * 100).toFixed(1).replace('.0', ''),
            hunted: data.god_hunted,
          })}`,
          inline: true,
        },
      ]);

    await ctx.makeMessage({ embeds: [embed] });
  }

  static async menhera(ctx: InteractionCommandContext): Promise<void> {
    const owner = await ctx.client.users.fetch(process.env.OWNER as string);
    if (ctx.data.server.lang === 'pt-BR') {
      moment.locale('pt-br');
    } else moment.locale('en-us');
    if (!ctx.client.shard) return;

    if (!(await ctx.client.isShardingProcessEnded())) {
      ctx.makeMessage({
        content: ctx.prettyResponseLocale('error', 'common:sharding_in_progress'),
      });
      return;
    }

    const promises = [
      ctx.client.shard.fetchClientValues('guilds.cache.size'),
      ctx.client.shard.broadcastEval(() => process.memoryUsage().heapUsed),
    ];

    const getReduced = (arr: number[]) => arr.reduce((p, c) => p + c, 0);

    const [AllGuilds, AllMemoryUsed] = (await Promise.all(promises)) as number[][];

    const embed = new MessageEmbed()
      .setColor('#fa8dd7')
      .setThumbnail('https://i.imgur.com/b5y0nd4.png')
      .setDescription(
        ctx.translate('botinfo.embed_description', {
          name: ctx.client.user?.username,
          createdAt: moment.utc(ctx.client.user?.createdAt).format('LLLL'),
          joinedAt: moment.utc(ctx.interaction?.guild?.me?.joinedAt).format('LLLL'),
        }),
      )
      .setFooter(
        `${ctx.client.user?.username} ${ctx.translate('botinfo.embed_footer')} ${owner.tag}`,
        owner.displayAvatarURL({
          format: 'png',
          dynamic: true,
        }),
      )
      .addFields([
        {
          name: '🌐 | Servers | 🌐',
          value: `\`\`\`${getReduced(AllGuilds)}\`\`\``,
          inline: true,
        },
        {
          name: '⏳ | Uptime | ⏳',
          value: `\`\`\`${moment
            .duration(ctx.client.uptime)
            .format('D[d], H[h], m[m], s[s]')}\`\`\``,
          inline: true,
        },
        {
          name: `<:memoryram:762817135394553876> | ${ctx.translate(
            'botinfo.memory',
          )} | <:memoryram:762817135394553876>`,
          value: `\`\`\`${(getReduced(AllMemoryUsed) / 1024 / 1024).toFixed(2)}MB\`\`\``,
          inline: true,
        },
      ]);
    await ctx.makeMessage({ embeds: [embed] });
  }

  static async blackjack(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.author;

    const data = await HttpRequests.getBlackJackStats(user.id);

    if (data.error) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'coinflip.error'),
        ephemeral: true,
      });
      return;
    }

    if (!data.playedGames) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'blackjack.no-data'),
        ephemeral: true,
      });
      return;
    }

    const totalMoney = data.winMoney - data.lostMoney;

    const embed = new MessageEmbed()
      .setTitle(ctx.translate('blackjack.embed-title', { user: user.tag }))
      .setColor(COLORS.Purple)
      .setFooter(ctx.translate('coinflip.embed-footer'))
      .addFields([
        {
          name: `🎰 | ${ctx.translate('coinflip.played')}`,
          value: `**${data.playedGames}**`,
          inline: true,
        },
        {
          name: `🏆 | ${ctx.translate('coinflip.wins')}`,
          value: `**${data.winGames}** | (${data.winPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `🦧 | ${ctx.translate('coinflip.loses')}`,
          value: `**${data.lostGames}** | (${data.lostPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `📥 | ${ctx.translate('coinflip.earnMoney')}`,
          value: `**${data.winMoney}** :star:`,
          inline: true,
        },
        {
          name: `📤 | ${ctx.translate('coinflip.lostMoney')}`,
          value: `**${data.lostMoney}** :star:`,
          inline: true,
        },
      ]);
    // eslint-disable-next-line no-unused-expressions
    totalMoney > 0
      ? embed.addField(
          `${emojis.yes} | ${ctx.translate('coinflip.profit')}`,
          `**${totalMoney}** :star:`,
          true,
        )
      : embed.addField(
          `${emojis.no} | ${ctx.translate('coinflip.loss')}`,
          `**${totalMoney}** :star:`,
          true,
        );

    await ctx.makeMessage({ embeds: [embed] });
  }

  static async coinflip(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.author;

    const data = await HttpRequests.getCoinflipUserStats(user.id);

    if (data.error) {
      await ctx.makeMessage({ content: ctx.prettyResponse('error', 'coinflip.error') });
      return;
    }

    if (!data.playedGames) {
      await ctx.makeMessage({ content: ctx.prettyResponse('error', 'coinflip.no-data') });
      return;
    }

    const totalMoney = data.winMoney - data.lostMoney;

    const embed = new MessageEmbed()
      .setTitle(ctx.translate('coinflip.embed-title', { user: user.tag }))
      .setColor(COLORS.Purple)
      .setFooter(ctx.translate('coinflip.embed-footer'))
      .addFields([
        {
          name: `🎰 | ${ctx.translate('coinflip.played')}`,
          value: `**${data.playedGames}**`,
          inline: true,
        },
        {
          name: `🏆 | ${ctx.translate('coinflip.wins')}`,
          value: `**${data.winGames}** | (${data.winPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `🦧 | ${ctx.translate('coinflip.loses')}`,
          value: `**${data.lostGames}** | (${data.lostPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `📥 | ${ctx.translate('coinflip.earnMoney')}`,
          value: `**${data.winMoney}** :star:`,
          inline: true,
        },
        {
          name: `📤 | ${ctx.translate('coinflip.lostMoney')}`,
          value: `**${data.lostMoney}** :star:`,
          inline: true,
        },
      ]);
    // eslint-disable-next-line no-unused-expressions
    totalMoney > 0
      ? embed.addField(
          `${emojis.yes} | ${ctx.translate('coinflip.profit')}`,
          `**${totalMoney}** :star:`,
          true,
        )
      : embed.addField(
          `${emojis.no} | ${ctx.translate('coinflip.loss')}`,
          `**${totalMoney}** :star:`,
          true,
        );

    await ctx.makeMessage({ embeds: [embed] });
  }
}
