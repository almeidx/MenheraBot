import 'moment-duration-format';
import moment from 'moment';
import { COLORS, defaultHuntCooldown } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { huntEnum, HuntingTypes, HuntProbabiltyProps } from '@utils/Types';
import { calculateProbability, getUserHuntProbability } from '@utils/ProbabilityUtils';
import Util from '@utils/Util';

export default class HuntInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'cacar',
      description: '「🎯」・Sai para uma caçada com Xandão',
      options: [
        {
          name: 'tipo',
          type: 'STRING',
          description: 'Tipo da caça',
          required: true,
          choices: [
            {
              name: '😈 | Demônios',
              value: 'demons',
            },
            {
              name: '👊 | Gigantes',
              value: 'giants',
            },
            {
              name: '👼 | Anjos',
              value: 'angels',
            },
            {
              name: '🧚‍♂️ | Arcanjos',
              value: 'archangels',
            },
            {
              name: '🙌 | Semideuses',
              value: 'demigods',
            },
            {
              name: '✝️ | Deuses',
              value: 'gods',
            },
            {
              name: '📊 | Probabilidades',
              value: 'probabilities',
            },
          ],
        },
        {
          name: 'rolls',
          description: 'Quantidade de rolls que você quer usar de uma vez só',
          type: 'INTEGER',
          required: false,
        },
      ],
      category: 'fun',
      cooldown: 7,
      clientPermissions: ['EMBED_LINKS'],
      authorDataFields: ['rolls', 'huntCooldown', 'inUseItems', 'selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const selected = ctx.options.getString('tipo', true) as HuntingTypes | 'probabilities';

    if (!selected) {
      await ctx.makeMessage({ content: ctx.prettyResponse('error', 'no-args'), ephemeral: true });
      return;
    }

    if (selected === 'probabilities') {
      const embed = new MessageEmbed()
        .setTitle(ctx.translate('probabilities'))
        .setColor(ctx.data.user.selectedColor)
        .addFields([
          {
            name: ctx.prettyResponse(huntEnum.DEMON, huntEnum.DEMON),
            value: `${getUserHuntProbability(ctx.data.user.inUseItems, huntEnum.DEMON)
              .map((a) =>
                ctx.translate('chances', {
                  count: a.amount,
                  percentage: a.probabilty,
                }),
              )
              .join('\n')}`,
            inline: true,
          },
          {
            name: ctx.prettyResponse(huntEnum.GIANT, huntEnum.GIANT),
            value: `${getUserHuntProbability(ctx.data.user.inUseItems, huntEnum.GIANT)
              .map((a) =>
                ctx.translate('chances', {
                  count: a.amount,
                  percentage: a.probabilty,
                }),
              )
              .join('\n')}`,
            inline: true,
          },
          {
            name: ctx.prettyResponse(huntEnum.ANGEL, huntEnum.ANGEL),
            value: `${getUserHuntProbability(ctx.data.user.inUseItems, huntEnum.ANGEL)
              .map((a) =>
                ctx.translate('chances', {
                  count: a.amount,
                  percentage: a.probabilty,
                }),
              )
              .join('\n')}`,
            inline: true,
          },
          {
            name: ctx.prettyResponse(huntEnum.ARCHANGEL, huntEnum.ARCHANGEL),
            value: `${getUserHuntProbability(ctx.data.user.inUseItems, huntEnum.ARCHANGEL)
              .map((a) =>
                ctx.translate('chances', {
                  count: a.amount,
                  percentage: a.probabilty,
                }),
              )
              .join('\n')}`,
            inline: true,
          },
          {
            name: ctx.prettyResponse(huntEnum.DEMIGOD, huntEnum.DEMIGOD),
            value: `${getUserHuntProbability(ctx.data.user.inUseItems, huntEnum.DEMIGOD)
              .map((a) =>
                ctx.translate('chances', {
                  count: a.amount,
                  percentage: a.probabilty,
                }),
              )
              .join('\n')}`,
            inline: true,
          },
          {
            name: ctx.prettyResponse(huntEnum.GOD, huntEnum.GOD),
            value: `${getUserHuntProbability(ctx.data.user.inUseItems, huntEnum.GOD)
              .map((a) =>
                ctx.translate('chances', {
                  count: a.amount,
                  percentage: a.probabilty,
                }),
              )
              .join('\n')}`,
            inline: true,
          },
        ]);

      await ctx.makeMessage({
        embeds: [embed],
      });
      return;
    }

    const rollsToUse = ctx.options.getInteger('rolls');

    if (rollsToUse) {
      if (rollsToUse < 1) {
        ctx.makeMessage({ content: ctx.prettyResponse('error', 'invalid-rolls'), ephemeral: true });
        return;
      }
      if (rollsToUse > ctx.data.user.rolls) {
        ctx.makeMessage({ content: ctx.prettyResponse('error', 'rolls-poor'), ephemeral: true });
        return;
      }
    }

    const canHunt = ctx.data.user.huntCooldown < Date.now();

    if (!canHunt && !rollsToUse) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'cooldown', {
          time: moment.utc(ctx.data.user.huntCooldown - Date.now()).format('mm:ss'),
        }),
        ephemeral: true,
      });
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const cooldown = defaultHuntCooldown + Date.now();
    const embed = new MessageEmbed()
      .setColor(COLORS.HuntDefault)
      .setThumbnail(avatar)
      .setTitle(ctx.translate(selected));

    const toRun = canHunt && rollsToUse ? rollsToUse + 1 : rollsToUse ?? 1;

    const areYouTheHuntOrTheHunter = async (
      probability: Array<HuntProbabiltyProps>,
      huntType: HuntingTypes,
    ) => {
      let value = 0;
      let tries = 0;
      let success = 0;

      for (let i = toRun; i > 0; i--) {
        const taked = calculateProbability(probability);
        value += taked;
        tries += 1;
        if (taked > 0) success += 1;
      }

      await ctx.client.repositories.huntRepository.huntEntity(
        ctx.author.id,
        huntType,
        value,
        cooldown,
        rollsToUse || 0,
      );
      return { value, success, tries };
    };

    const result = await areYouTheHuntOrTheHunter(
      getUserHuntProbability(ctx.data.user.inUseItems, selected),
      selected,
    );

    const { rank } = await ctx.client.repositories.topRepository.getUserHuntRank(
      ctx.author.id,
      selected,
      await ctx.client.repositories.cacheRepository.getDeletedAccounts(),
    );

    if (selected === 'gods') {
      embed.setDescription(
        result.value > 0
          ? ctx.translate('god_hunted_success', {
              count: result.value,
              hunt: ctx.translate(selected),
              rank: rank + 1,
              toRun,
            })
          : ctx.translate('god_hunted_fail', { rank: rank + 1, count: toRun }),
      );
      if (result.value > 0) embed.setThumbnail('https://i.imgur.com/053khaH.gif');
    } else
      embed.setDescription(
        ctx.translate('hunt_description', {
          value: result.value,
          hunt: ctx.translate(selected),
          rank: rank + 1,
          count: toRun,
        }),
      );
    // @ts-expect-error HuntString is actually HuntHUNTYPE
    embed.setColor(COLORS[`Hunt${Util.capitalize(selected)}`]);

    const APIHuntTypes = {
      demons: 'demon',
      giants: 'giant',
      angels: 'angel',
      archangels: 'archangel',
      demigods: 'demigod',
      gods: 'god',
    };

    HttpRequests.postHuntCommand(ctx.author.id, APIHuntTypes[selected], result);

    await ctx.makeMessage({ embeds: [embed] });
  }
}
