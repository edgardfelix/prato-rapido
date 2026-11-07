/*
 * Manages the buyer list by hand: support cases, gifts, or testing the
 * activation screen without a real purchase.
 *
 *   npm run buyers -- add comprador@email.com
 *   npm run buyers -- remove comprador@email.com
 *   npm run buyers -- check comprador@email.com
 */
import { env } from '../config/env.ts';
import { addAuthorizedEmail, isEmailAuthorized, MANUAL_ORDER, removeAuthorizedEmail } from '../services/buyers.service.ts';
import { parseEmail } from '../validation/email.ts';

const USAGE = 'Uso: npm run buyers -- <add|remove|check> <email>';

async function main(): Promise<number> {
  const [command, rawEmail] = process.argv.slice(2);
  if (!env.paywall.upstash) {
    console.error('Configure UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN no .env antes.');
    return 1;
  }
  const email = parseEmail(rawEmail);
  if (!email || (command !== 'add' && command !== 'remove' && command !== 'check')) {
    console.error(USAGE);
    return 1;
  }

  if (command === 'add') {
    await addAuthorizedEmail(email, MANUAL_ORDER);
    console.log(`✔ ${email} já pode ativar o acesso no app.`);
  } else if (command === 'remove') {
    await removeAuthorizedEmail(email);
    console.log(`✔ ${email} foi removido da base de compradores.`);
  } else {
    const authorized = await isEmailAuthorized(email);
    console.log(`${email}: ${authorized ? 'comprador autorizado' : 'não encontrado na base de compradores'}`);
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
