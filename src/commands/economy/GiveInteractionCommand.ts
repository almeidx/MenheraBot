import { emojis } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton } from 'discord.js-light';
import Util, { disableComponents, resolveCustomId } from '@utils/Util';
import { HuntingTypes } from '@utils/Types';

export default class GiveInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'give',
      description: '「🎁」・Transfira algo de seu inventário para alguém',
      options: [
        {
          name: 'user',
          description: 'Usuário para transferir',
          type: 'USER',
          required: true,
        },
        {
          name: 'tipo',
          description: 'O tipo de item que quer transferir',
          type: 'STRING',
          choices: [
            {
              name: '⭐ | Estrelinhas',
              value: 'estrelinhas',
            },
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
          ],
          required: true,
        },
        {
          name: 'valor',
          description: 'A quantidade para transferir',
          type: 'INTEGER',
          required: true,
        },
      ],
      cooldown: 5,
      category: 'economy',
      authorDataFields: [
        'estrelinhas',
        'demons',
        'giants',
        'angels',
        'archangels',
        'gods',
        'demigods',
      ],
    });
  }

  static replyForYourselfError(ctx: InteractionCommandContext): void {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'self-mention'),
      ephemeral: true,
    });
  }

  static replyInvalidValueError(ctx: InteractionCommandContext): void {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'invalid-value'),
      ephemeral: true,
    });
  }

  static replyNoAccountError(ctx: InteractionCommandContext): void {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'no-dbuser'),
      ephemeral: true,
    });
  }

  static replyNotEnoughtError(ctx: InteractionCommandContext, localeField: string): void {
    ctx.deleteReply();
    ctx.send({
      content: ctx.prettyResponse('error', 'poor', { field: ctx.translate(localeField) }),
    });
  }

  static replySuccess(
    ctx: InteractionCommandContext,
    value: number,
    emoji: string,
    mentionString: string,
  ): void {
    ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('success', 'transfered', { value, emoji, user: mentionString }),
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const [toSendUser, selectedOption, input] = [
      ctx.options.getUser('user', true),
      ctx.options.getString('tipo', true) as HuntingTypes | 'estrelinhas',
      ctx.options.getInteger('valor', true),
    ];

    if (toSendUser.bot) return GiveInteractionCommand.replyNoAccountError(ctx);

    if (toSendUser.id === ctx.author.id) return GiveInteractionCommand.replyForYourselfError(ctx);

    if (input < 1) return GiveInteractionCommand.replyInvalidValueError(ctx);

    if (await ctx.client.repositories.blacklistRepository.isUserBanned(toSendUser.id)) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'banned-user'),
        ephemeral: true,
      });
      return;
    }

    const confirmButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | ACCEPT`)
      .setStyle('SUCCESS')
      .setLabel(ctx.locale('common:accept'));

    const negateButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | NEGATE`)
      .setStyle('DANGER')
      .setLabel(ctx.locale('common:negate'));

    await ctx.makeMessage({
      content: ctx.prettyResponse('question', 'confirm', {
        user: toSendUser.toString(),
        author: ctx.author.toString(),
        count: input,
        emoji: emojis[selectedOption],
      }),
      components: [{ type: 'ACTION_ROW', components: [confirmButton, negateButton] }],
    });

    const selectedButton = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      toSendUser.id,
      ctx.interaction.id,
    );

    if (!selectedButton) {
      ctx.makeMessage({
        components: [
          {
            type: 'ACTION_ROW',
            components: disableComponents(ctx.locale('common:timesup'), [
              confirmButton,
              negateButton,
            ]),
          },
        ],
      });
      return;
    }

    if (resolveCustomId(selectedButton.customId) === 'NEGATE') {
      ctx.makeMessage({
        content: ctx.translate('negated', { user: toSendUser.toString() }),
        components: [
          {
            type: 'ACTION_ROW',
            components: [
              confirmButton.setDisabled(true).setStyle('SECONDARY'),
              negateButton.setDisabled(true),
            ],
          },
        ],
      });
      return;
    }

    if (input > ctx.data.user[selectedOption])
      return GiveInteractionCommand.replyNotEnoughtError(ctx, selectedOption);

    ctx.client.repositories.giveRepository.executeGive(
      selectedOption,
      ctx.author.id,
      toSendUser.id,
      input,
    );

    GiveInteractionCommand.replySuccess(ctx, input, emojis[selectedOption], toSendUser.toString());
  }
}
