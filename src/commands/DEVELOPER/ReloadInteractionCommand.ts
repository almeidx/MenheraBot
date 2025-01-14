/* eslint-disable @typescript-eslint/ban-ts-comment */
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class ReloadSlashInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'reload',
      description: 'Recarrega algum comando',
      category: 'dev',
      options: [
        {
          type: 'STRING',
          name: 'opcao',
          description: 'Comando pra mete em maintenance',
          required: true,
        },
      ],
      defaultPermission: false,
      devsOnly: true,
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (ctx.options.getString('comando', true).toLowerCase() === 'locales') {
      // @ts-expect-error Reload command doesnt exist in client<boolean>
      await ctx.client.shard?.broadcastEval((c) => c.reloadLocales());
      ctx.makeMessage({ content: 'Locales Recarregados' });
      return;
    }

    const command = ctx.options.getString('comando', true).toLowerCase();

    if (!ctx.client.slashCommands.get(command)) {
      ctx.makeMessage({ content: 'NAO TEM NENHUM COMANDO COM, ESE NOME' });
      return;
    }

    // @ts-expect-error Reload command doesnt exist in client<boolean>
    await ctx.client.shard?.broadcastEval((c, { a }) => c.reloadCommand(a), {
      context: { a: command },
    });

    await ctx.makeMessage({ content: `${command} recarregado com sucesso!` });
  }
}
