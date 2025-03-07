/* eslint-disable no-await-in-loop */
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed, ColorResolvable } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import Util from '@utils/Util';
import { COLORS, emojis } from '@structures/Constants';
import { TopRankingTypes as TOP } from '@utils/Types';

export default class TopInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'top',
      description: '「💹」・Veja o top de usuários da Menhera',
      category: 'util',
      options: [
        {
          type: 'STRING',
          name: 'tipo',
          description: 'Tipo do top que você quer ver',
          required: true,
          choices: [
            {
              name: '💋 | Mamadores',
              value: 'mamadores',
            },
            {
              name: '👅 | Mamados',
              value: 'mamados',
            },
            {
              name: '⭐ | Estrelinhas',
              value: 'estrelinhas',
            },
            {
              name: '😈 | Demônios',
              value: 'demonios',
            },
            {
              name: '👊 | Gigantes',
              value: 'gigantes',
            },
            {
              name: '👼 | Anjos',
              value: 'anjos',
            },
            {
              name: '🧚‍♂️ | Arcanjos',
              value: 'arcanjos',
            },
            {
              name: '🙌 | Semideuses',
              value: 'semideuses',
            },
            {
              name: '✝️ | Deuses',
              value: 'deuses',
            },
            {
              name: '🆙 | Votos',
              value: 'votos',
            },
            {
              name: '📟 | Comandos',
              value: 'comandos',
            },
            {
              name: '👥 | Usuários',
              value: 'users',
            },
            {
              name: '👤 | Usuário',
              value: 'user',
            },
          ],
        },
        {
          type: 'INTEGER',
          name: 'pagina',
          description: 'Página do top que tu quer ver',
          required: false,
        },
        {
          type: 'USER',
          name: 'user',
          description: 'Caso queira ver o top users, diga qual vai ser o usuário',
          required: false,
        },
      ],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  static calculateSkipCount(page: number, documents: number): number {
    if (!Number.isNaN(page) && page > 0) {
      if (page >= documents / 10) return documents / 10;
      return (page - 1) * 10;
    }
    return 0;
  }

  static async topCommands(ctx: InteractionCommandContext): Promise<void> {
    const res = await HttpRequests.getTopCommands();
    if (!res) {
      ctx.makeMessage({ content: ctx.prettyResponseLocale('error', 'commands:http-error') });
      return;
    }
    const embed = new MessageEmbed()

      .setTitle(`:robot: |  ${ctx.translate('commands')}`)
      .setColor('#f47fff');

    for (let i = 0; i < res.length; i++) {
      embed.addField(
        `**${i + 1} -** ${Util.capitalize(res[i].name)} `,
        `${ctx.translate('used')} **${res[i].usages}** ${ctx.translate('times')}`,
        false,
      );
    }
    ctx.makeMessage({ embeds: [embed] });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const type = ctx.options.getString('tipo', true);
    const page = ctx.options.getInteger('pagina') ?? 1;

    await ctx.defer();

    switch (type) {
      case 'mamadores':
        TopInteractionCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.mamou,
          emojis.crown,
          ctx.translate('mamadoresTitle'),
          ctx.translate('suck'),
          page,
          COLORS.Pinkie,
        );
        return;
      case 'mamados':
        TopInteractionCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.mamadas,
          emojis.lick,
          ctx.translate('mamouTitle'),
          ctx.translate('suckled'),
          page,
          COLORS.Pinkie,
        );
        return;
      case 'estrelinhas':
        TopInteractionCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.stars,
          emojis.estrelinhas,
          ctx.translate('starsTitle'),
          ctx.translate('stars'),
          page,
          COLORS.Pear,
        );
        return;
      case 'demonios':
        TopInteractionCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.demons,
          emojis.demons,
          ctx.translate('demonTitle'),
          ctx.translate('demons'),
          page,
          COLORS.HuntDemons,
        );
        return;
      case 'gigantes':
        TopInteractionCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.giants,
          emojis.giants,
          ctx.translate('giantTitle'),
          ctx.translate('giants'),
          page,
          COLORS.HuntGiants,
        );
        return;
      case 'anjos':
        TopInteractionCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.angels,
          emojis.angels,
          ctx.translate('angelTitle'),
          ctx.translate('angels'),
          page,
          COLORS.HuntAngels,
        );
        return;
      case 'arcanjos':
        TopInteractionCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.archangels,
          emojis.archangels,
          ctx.translate('archangelTitle'),
          ctx.translate('archangels'),
          page,
          COLORS.HuntArchangels,
        );
        return;
      case 'semideuses':
        TopInteractionCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.demigods,
          emojis.demigods,
          ctx.translate('sdTitle'),
          ctx.translate('demigods'),
          page,
          COLORS.HuntDemigods,
        );
        return;
      case 'deuses':
        TopInteractionCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.gods,
          emojis.gods,
          ctx.translate('godTitle'),
          ctx.translate('gods'),
          page,
          COLORS.HuntGods,
        );
        return;
      case 'votos':
        TopInteractionCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.votes,
          emojis.ok,
          ctx.translate('voteTitle'),
          ctx.translate('votes'),
          page,
          COLORS.UltraPink,
        );
        return;
      case 'comandos':
        TopInteractionCommand.topCommands(ctx);
        return;
      case 'users':
        TopInteractionCommand.topUsers(ctx);
        return;
      case 'user':
        TopInteractionCommand.topUser(ctx);
    }
  }

  static async executeUserDataRelatedRanking(
    ctx: InteractionCommandContext,
    labelType: TOP,
    emoji: string,
    embedTitle: string,
    actor: string,
    page: number,
    color: ColorResolvable,
  ): Promise<void> {
    const skip = TopInteractionCommand.calculateSkipCount(page, 1000);

    const res = await ctx.client.repositories.userRepository.getTopRanking(
      labelType,
      skip,
      await ctx.client.repositories.cacheRepository.getDeletedAccounts(),
    );

    const embed = new MessageEmbed()
      .setTitle(`${emoji} | ${embedTitle} ${page > 1 ? page : 1}º`)
      .setColor(color);

    for (let i = 0; i < res.length; i++) {
      const member = await ctx.client.users.fetch(res[i].id).catch(() => null);
      const memberName = member?.username ?? res[i].id;

      if (memberName.startsWith('Deleted User'))
        ctx.client.repositories.cacheRepository.addDeletedAccount(res[i].id);

      embed.addField(`**${skip + 1 + i} -** ${memberName}`, `${actor}: **${res[i].value}**`, false);
    }

    ctx.defer({ embeds: [embed] });
  }

  static async topUsers(ctx: InteractionCommandContext): Promise<void> {
    const res = await HttpRequests.getTopUsers();
    if (!res) {
      ctx.defer({ content: `${emojis.error} |  ${ctx.locale('commands:http-error')}` });
      return;
    }
    const embed = new MessageEmbed()

      .setTitle(`<:MenheraSmile2:767210250364780554> |  ${ctx.translate('users')}`)
      .setColor('#f47fff');

    for (let i = 0; i < res.length; i++) {
      const member = await ctx.client.users.fetch(res[i].id).catch();
      embed.addField(
        `**${i + 1} -** ${Util.capitalize(member.username)} `,
        `${ctx.translate('use')} **${res[i].uses}** ${ctx.translate('times')}`,
        false,
      );
    }
    ctx.defer({ embeds: [embed] });
  }

  static async topUser(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.author;

    if (!user) {
      ctx.defer({ content: `${emojis.error} | ${ctx.translate('not-user')}` });
      return;
    }

    const res = await HttpRequests.getProfileCommands(user.id);
    const embed = new MessageEmbed()

      .setTitle(
        `<:MenheraSmile2:767210250364780554> |  ${ctx.translate('user', {
          user: user.username,
        })}`,
      )
      .setColor('#f47fff');

    if (!res || res.cmds.count === 0) {
      ctx.defer({ content: `${emojis.error} | ${ctx.translate('not-user')}` });
      return;
    }

    for (let i = 0; i < res.array.length; i++) {
      if (i > 10) break;
      embed.addField(
        `**${i + 1} -** ${Util.capitalize(res.array[i].name)} `,
        `${ctx.translate('use')} **${res.array[i].count}** ${ctx.translate('times')}`,
        false,
      );
    }
    ctx.defer({ embeds: [embed] });
  }
}
