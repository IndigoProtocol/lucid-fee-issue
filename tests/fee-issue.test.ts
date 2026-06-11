import { beforeEach, describe, expect, test } from 'vitest';
import {
  Data,
  Emulator,
  EmulatorAccount,
  Lucid,
  Script,
  generateEmulatorAccount,
  validatorToAddress,
} from '@lucid-evolution/lucid';
import { LucidContext, submitTx } from './test-helpers';

type TestContext = LucidContext<{
  admin: EmulatorAccount;
}>;


describe('Fee Issue', () => {
  beforeEach<TestContext>(async (context: TestContext) => {
    context.users = {
      admin: generateEmulatorAccount({
        lovelace: BigInt(100_000_000),
      }),
    };

    context.emulator = new Emulator(
      [context.users.admin],
    );
    context.lucid = await Lucid(context.emulator, 'Custom');
    context.lucid.selectWallet.fromSeed(context.users.admin.seedPhrase);
  });

  test('reproduce fee issue', async (context: TestContext) => {
    /**
     * Aiken script derived from:
     * use cardano/transaction.{OutputReference, Transaction}
     * 
     * validator fee_issue {
     *   spend(
     *     _datum: Option<Data>,
     *     _redeemer: Data,
     *     _own_ref: OutputReference,
     *     tx: Transaction,
     *   ) {
     * 
     *     trace tx.fee
     *     
     *     /// Fee below 5_000_000
     *     expect tx.fee > 5_000_000
     * 
     *     True
     *   }
     * 
     *   else(_) {
     *     fail
     *   }
     * }
     * 
     */
    const feeIssue: Script = {
      type: 'PlutusV3',
      script: '59037b59037801010029800aba4aba2aba1aab9faab9eaab9dab9cab9a4888888896600264653001300800198041804800cc0200092225980099b8748008c020dd500144ca60026018003300c300d00191806980718071807000a444a660166e64c8c8cc88ca6002003300630123754015488100400444464b30010038991919911980500119b8a48901280059800800c4cdc52441035b5d2900006899b8a489035b5f20009800800ccdc52441025d2900006914c00402a00530070014029229800805400a002805100920345980099b880014803a266e0120f2010018acc004cdc4000a41000513370066e01208014001480362c80a10141bac3017002375a602a0026466ec0dd4180a8009ba73016001375400713259800800c4cdc52441027b7d00003899b8a489037b5f20003232330010010032259800800c400e264b30010018994c00402a6034003337149101023a200098008054c06c00600a805100a180e00144ca6002015301a00199b8a489023a200098008054c06c006600e66008008004805100a180e0012036301c001406866e29220102207d00003405c6eac00e264b3001001899b8a489025b5d00003899b8a489035b5f20009800800ccdc52441015d00003914c00401e0053004001401d229800803c00a0028039006202e3758007133006375a0060051323371491102682700329800800ccdc01b8d0024800666e292210127000044004444b3001337100049000440062646645300100699b800054800666e2ccdc00012cc004cdc4001240291481822903720323371666e000056600266e2000520148a40c11481b9019002200c33706002901019b8600148080cdc7002001202c375c00680c8dc5245022c2000223233001001003225980099b8700148002266e292210130000038acc004cdc4000a40011337149101012d0033002002337029000000c4cc014cdc2000a402866e2ccdc019b85001480512060003404080808888c8cc004004014896600200310058992cc004006266008603000400d133005301800233003003001405c603000280b0c0040048896600266e2400920008800c6600200733708004900a4cdc599b803370a004900a240c0002801900d0acc004cdc4241015bc4086eb4c004c034dd5002c528c54cc02d2411e3c65787065637465643e204665652062656c6f7720355f3030305f3030300016402830093754005164018300800130043754013149a26cac8009'
    }

    const feeIssueAddress = validatorToAddress(context.lucid.config().network!, feeIssue);

    await submitTx(
      context.lucid,
      context.lucid.newTx().pay.ToAddress(feeIssueAddress, { lovelace: BigInt(10_000_000) })
    )

    const feeIssueUtxos = await context.lucid.utxosAt(feeIssueAddress);

    expect(feeIssueUtxos.length).toBe(1);

    const feeIssueUtxo = feeIssueUtxos[0];

    await submitTx(
      context.lucid,
      context.lucid.newTx()
        .attach.Script(feeIssue)
        .collectFrom([feeIssueUtxo], Data.void())
        .setMinFee(BigInt(8_000_000))
    );
  });
});
