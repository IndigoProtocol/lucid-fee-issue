import {
  Emulator,
  EmulatorAccount,
  LucidEvolution,
  TxBuilder,
} from '@lucid-evolution/lucid';

type EmulatorAccountMap = Record<string, EmulatorAccount> & {
  admin: EmulatorAccount;
};

export type LucidContext<T extends EmulatorAccountMap = EmulatorAccountMap> = {
  lucid: LucidEvolution;
  users: T;
  emulator: Emulator;
};

/**
 * Complete, sign with wallet, submit a tx and wait for confirmation.
 */
export async function submitTx(
  lucid: LucidEvolution,
  tx: TxBuilder,
): Promise<void> {
  const txHash = await tx
    .complete()
    .then((t) => t.sign.withWallet().complete())
    .then((t) => t.submit());
  await lucid.awaitTx(txHash);
}