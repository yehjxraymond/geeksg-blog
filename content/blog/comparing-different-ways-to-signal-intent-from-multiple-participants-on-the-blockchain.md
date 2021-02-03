---
template: blog-post
title: Comparing different ways to signal intent from multiple participants on
  the blockchain
publishedDate: 2021-02-03T03:35:58.298Z
description: Multisig wallets presents a way for different participants to issue
  a transaction on the blockchain but is that the only way? In this article I
  explore various options to represent the signalling of the intent for a
  transaction that requires more than one participant to agree on.
featured: false
img: ../../static/images/signature-on-document.png
imgAlt: Why was wet signature even used in the first place?
tags:
  - blockchain
  - architecture
  - design
  - law
  - abstraction
---
Multi-signature (or multisig) wallets presents a way for different participants to agree (or disagree) on a particular transaction on the blockchain (ie, issuance of a electronic bill of lading on a token registry), but is that the only way? In this article I explore various options to represent the signalling of the intent for a transaction that requires more than one participant to agree on. In addition, there will be suggestions on which methods to be used in different circumstances.

In each of the different methods, notice how there must be a layer of abstraction which amalgamates the different participants into a single entity.

The different types of solutions will be broken down into two broad categories, on-chain solutions and off-chain solutions.

## On-chain Signalling

On-chain solutions allow for all observers of the blockchain to see that the different participants of the transaction has agreed on the transaction. On-chain solutions are used in instances where the participants' public address are associated with known real-world identities from the perspective of observers. Should the participants' real-world identities not be associated with their address, the act of signalling intent via separate addresses has no meaning to the observer.

Useful scenario:

- Two universities issuing a set of [OpenCerts](https://opencerts.io/) under a joint program
- Two companies inking an MOU created using [OpenAttestation](https://openattestation.com/)

Pros

- Intents are public and non-repudiable
- Smart contracts can be written to process different set of rules
- Different entities can use different key management standards & systems

Cons

- Additional gas spent to store and process these transactions
- Requires a PKI (or local address book lookups) to identify the different participants
- Additional cognitive workload for observer to understand the structure of the joint entity

### Multi-signature (multisig) wallet abstraction

Multisig wallets are contracts that abstract the access controls from the contracts with the business contract. They play a role as the gatekeeper and usually the only address allowed to interact with the business contract from the joint entity point of view.

Several multisig contracts are readily available for immediate use and can be found [here](https://yenthanh.medium.com/list-of-multisig-wallet-smart-contracts-on-ethereum-3824d528b95e). If more complex access control patterns are needed, custom multisig contracts can be created.

With these contracts, there will be abstraction of internal controls since the smart contract handles the logic yet providing observers the transparency of the internal control via the public code.

## Off-chain Signalling

Off-chain solutions allow for business constraints be enforced without publishing these details which are not useful for other observers on the blockchain. In all solutions, observers on the blockchain will only see one transaction originating from one address associated with the joint entity. From the perspective of the observer, it does not need to know how the entity is being organized internally.

This is particularly useful when observing that a transaction originates from a business entity, as oppose to a transaction originating from two different directors, a secretary and a temporary admin clerk of the companies. In the latter, it's extra work for the recipient to:

1. know who are the different signalling parties
1. know the structure of the company
1. know who are the people who are needed to signal for the document to be valid (which can differ from documents to documents)
1. check the above information often for changes

Useful scenario:

- A shipping line issuing a [TradeTrust]()https://tradetrust.io/ Transferable Record only after the clerk keys in the information, the manager review it and the director approves it in their internal software.
- A bank issuing a loan approval letter after having the loan processed in different departments, some only used for loans with higher loan quantum.

Pros

- Savings on gas cost
- Abstraction of internal processes and controls from external observers
- Easily change and permute internal processes and controls for different business requirements

Cons

- Legislation may need to catch up to understand the abstraction
- Signalling are repudiable, additional logging and controls may be required

### Multi-party Computation (MPC)

[MPC](https://en.wikipedia.org/wiki/Secure_multi-party_computation) allows for different entities to jointly compute the signature to a transaction, with each having their own private keys without the need of a master private key or trusting any other entities to the process

Pros

- Participants of the joint entity do not need to trust one another or a central system to execute on behalf of the joint entity

Cons

- Nascency of technology and tools
- Limited customizability of rules

### Software Controlled

Transaction signing can also be controlled by softwares. Most businesses would have softwares that they use to manage internal workflow. These business could simply build the signing and publishing of blockchain transaction into their business process management platform and rely on the access controls and workflow they are most familiar with.

While the business can store the private key to the wallet on some VM or environment which the developers may gain access to, they may also consider secret management softwares like [Vault](https://www.vaultproject.io/) or even the use of hardware security modules (HSM) for key generation, storage, signing, etc.

Pros

- Tight integration with existing workflow
- Complete abstraction of the blockchain from the user
- Existing standards (ie [PCI-DSS](https://www.pcisecuritystandards.org/documents/PCI_DSS_v3-2-1.pdf)) exist as references

Cons

- High integration cost
- Longer time to market

## Notable Mention: Signatures Appended to Data

Aside from mentioned method, one common method continuously arise during discussions which is to append the signatures from multiple parties onto the data itself. From OpenAttestation documents perspective, it means that the signature is added as additional fields.

The idea likely stems from legacy reason where it is not possible to separate the joint entity from its multiple participants. For instance, it is impossible to have a company sign on a form, the proxy for that is to have a common requirement for authorized person (such as the [Singapore Company Act](https://www.acra.gov.sg/legislation/legislative-reform/companies-act-reform/companies-amendment-act-2017/removal-of-requirement-for-common-seal)) or have a common seal.

The problem with this method is that is separates the intent (the individual signatures) from the action (the actual blockchain transaction). Observers will not only have to validate the blockchain state but also additional business requirements not on the blockchain. This not only creates an opportunity for dispute where it is possible to have scenarios where the intent exist without the action and for the action to exist without the intent but also add complexity to programs interpreting these transactions.

As such, this method should be avoided at all cost.

The use of a common seal should be replaced by one of the off-chain signalling method since it is possible to establish the signing key as the "common seal".

The use of multiple signing parties should be replaced by the on-chain signalling methods if identity of the participants are known to intended observers.
