export const ONBOARD_CONTRACT_ABI = [
  [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: '_from',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'bytes',
          name: 'userKey1',
          type: 'bytes',
        },
        {
          indexed: false,
          internalType: 'bytes',
          name: 'userKey2',
          type: 'bytes',
        },
      ],
      name: 'AccountOnboarded',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'bytes',
          name: 'publicKey',
          type: 'bytes',
        },
        {
          internalType: 'bytes',
          name: 'signedEK',
          type: 'bytes',
        },
      ],
      name: 'onboardAccount',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
];

export const ONBOARD_CONTRACT_ADDRESS =
  '0x24D6c44eaB7aA09A085dDB8cD25c28FFc9917EC9';
