/*
 * Support tool for buyers and their access password:
 *
 *   npm run buyers -- add comprador@email.com             libera à mão (presente, suporte, teste)
 *   npm run buyers -- remove comprador@email.com          tira da lista do app
 *   npm run buyers -- check comprador@email.com           compra e senha: situação atual
 *   npm run buyers -- reset-password comprador@email.com  apaga a senha (e o bloqueio): no próximo
 *                                                         acesso o comprador cria outra, e as
 *                                                         sessões abertas com a senha antiga caem
 */
import { env } from '../config/env.ts';
import { addAuthorizedEmail, findAccessSource, MANUAL_ORDER, removeAuthorizedEmail } from '../services/buyers.service.ts';
import { hasPassword, removePassword } from '../services/credentials.service.ts';
import { parseEmail } from '../validation/email.ts';

const COMMANDS = ['add', 'remove', 'check', 'reset-password'] as const;
type Command = (typeof COMMANDS)[number];
const USAGE = `Uso: npm run buyers -- <${COMMANDS.join('|')}> <email>`;

const isCommand = (value: string | undefined): value is Command => (COMMANDS as readonly (string | undefined)[]).includes(value);

async function main(): Promise<number> {
  const [command, rawEmail] = process.argv.slice(2);
  if (!env.paywall.upstash) {
    console.error('Configure UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN no .env antes.');
    return 1;
  }
  const email = parseEmail(rawEmail);
  if (!email || !isCommand(command)) {
    console.error(USAGE);
    return 1;
  }

  if (command === 'add') {
    await addAuthorizedEmail(email, MANUAL_ORDER);
    console.log(`✔ ${email} já pode entrar no app (no primeiro acesso, cria a senha).`);
  } else if (command === 'remove') {
    await removeAuthorizedEmail(email);
    console.log(`✔ ${email} foi removido da lista do app.`);
  } else if (command === 'reset-password') {
    const removed = await removePassword(email);
    console.log(removed ? `✔ Senha de ${email} apagada: no próximo acesso ele cria uma nova.` : `${email} não tinha senha cadastrada.`);
  } else {
    const [source, passwordSet] = await Promise.all([findAccessSource(email), hasPassword(email)]);
    const purchase =
      source === 'landing-page'
        ? 'comprador autorizado (compra registrada pela landing page)'
        : source === 'buyer-list'
          ? 'comprador autorizado (lista do app)'
          : 'não encontrado na base de compradores';
    console.log(`${email}: ${purchase} · senha ${passwordSet ? 'cadastrada' : 'ainda não criada'}`);
    if (!source && !env.paywall.landingGrants) {
      console.log('Obs.: sem LP_ACCESS_TOKEN_SECRET, as compras registradas pela landing page não são consultadas.');
    }
  }
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
