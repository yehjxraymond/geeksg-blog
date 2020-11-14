---
template: blog-post
title: ZKP in Civic Tech - Re-imagining Identity Infrastructures
publishedDate: 2020-11-14T15:27:53.677Z
description: In this article, I share how ZKP can be used in CivicTech to create
  the next generation of public goods where government, businesses and citizens
  can better infrastructure to collaborate with one another. Specifically, I
  will explore 3 use cases where ZKP can be applied.
featured: true
img: ../../static/images/blindfold.png
imgAlt: Share no more than required
tags:
  - zero-knowledge-proof
  - cryptography
  - civictech
  - privacy
  - data-dignity
---
Zero-knowledge proof(ZKP) is a nascent technology where one party can prove to another that they know the value of *something* without sharing what *something* is.

In this article, I hope to share how ZKP can be used in CivicTech to create the next generation of public goods where government, businesses and citizens can better infrastructure to collaborate with one another. Specifically, I will explore 3 use cases where ZKP can be applied.

### Whistle-blowing Schemes

Low-wage migrant workers in the construction, shipyard, cleaning and food services industries are often exposed to illegal and endangering work conditions. However, many of them are reluctant to lodge complaints against their employers, [for fear of being dismissed and repatriated](http://twc2.org.sg/wp-content/uploads/2019/08/meera_rajah_2014_what_plagues.pdf).

One way to mitigate employees’ fear of repercussion is to enable them to blow the whistle on their employer anonymously. An employee should be able to simultaneously:

* prove membership in a certain company to improve credibility, but also
* conceal their personal identity to protect themselves.

The application can similarly help:

* employees in companies whose management are engaged in corrupt practices to report such behavior in a confidential but verifiable manner to Corrupt Practices Investigation Bureau
* managers to receive feedback and review from their team

### Anonymous Goods Distribution Schemes

Some government programs involve distribution of vouchers, grants, or physical items to the public based on need. For instance, the Singapore government has conducted multiple distribution exercise during the pandemic where it distributed masks and [TraceTogether](https://www.tracetogether.gov.sg/) tokens using the [SupplyAlly](https://www.supplyally.gov.sg/) application.

However, not all distributions exercises are large scale and conducted by the government. Some of them are by NGOs for a subset of the population, which often involves vulnerable groups of the population.

An application which respect the dignity of the individuals should be able to:

* prove membership in a certain subset of the population, but also
* conceal their personal identity to protect themselves, and
* prevent abuse of the “privilege” or double-dipping, and
* allow different NGOs to collaborate on distribution efforts

An example of how this application can work will look like this:

1. A government agency will perform means-testing and set up an identity group for the vulnerable subset. In this example we will use “schooling children from financially challenged families”.
2. Private F&B companies, like [Stuff’d](https://www.channelnewsasia.com/news/cnainsider/stuffd-free-food-for-kids-hunger-food-insecurity-singapore-12073570), can collaborate to provide free lunches to the group.
3. Beneficiaries, from the identity group, can then generate a proof that satisfy the constraint “I’m a children from a financially challenged family AND I’ve not claimed my lunch for 12th December 2020”, without leaking more information about their identities (including data that can be correlated with past activities).
4. The company can distribute the lunch to the child. They are now in possession of “claimant proof” which they could use to invite more citizens to donate to their cause to fund the program or submit them during the tax season for tax waiver.
5. The different companies may even be provided a common infrastructure by the government to ensure that the beneficiary has not collected the lunch from ANY of the participating F&B companies on a given day, again, without leaking information about the identities of the individuals.

### Public Identity Infrastructure

Several governments around the world like Singapore & Estonia has formal national identity systems. In Singapore, the [SingPass](https://www.singpass.gov.sg/singpass/common/aboutus) is used by citizens to interact with all Government e-services as well as services from [42 private organisations](https://www.ifaq.gov.sg/singpass/apps/fcd_faqmain.aspx?TOPIC=210779#FAQ_2110237) (as of 14 November 2020). In Estonia, the state issued [e-identity](https://e-estonia.com/solutions/e-identity/id-card) allows citizens to use digital signatures to interact with both Government and private e-services — it can even be used to [cast votes during an election](https://www.id.ee/en/article/e-voting-and-e-elections/)!

In both cases, when citizens interacts with a non-government e-services the citizens share their unique personal identifiers such NRIC in Singapore’s case and the public key Estonia’s case. This subjects the citizen to additional risks such as:

* Private organisation aggregating personal information across services
* Leakage of PII, which are attested by the Government, during a hack on the private organisation infrastructure

As we know it would be very hard to have all the private organisations using the identity infrastructure to uphold the same data protection standards as the governments themselves. Governments may be in a pickle to choose between an identity infrastructure that is inclusive and allows any developers to build on, versus one that is secured but may only be used to interact with government e-services.

Ideally, the digital identity infrastructure provided by the government which citizens may use to interact with private organisations should:

* allow users to prove that they are indeed a citizen of the nation and
* allow users to prove that they do not have multiple account on that platform, but also
* prevents the organisation from gaining more information of the individual, ie NRIC or public key

If more assertions needs to be made during the interactions with the private organisations’ e-services, ZKP may also be used to prove conditions like:

* age is above 21 (ie. e-commerce delivering alcohol)
* income is above $30,000 (ie. credit card applications)
* income is below $12,000 (ie. NGO providing financial assistance)
* a set of vaccination has been taken (ie. airlines’ online ticketing)

With these constraints, it allows companies such as telecommunication, utility companies, e-commerce or even [cryptocurrency exchanges](https://geek.sg/blog/complete-guide-to-buying-bitcoin-ethereum-or-other-cryptocurrencies-in-singapore) to provide service to the user and in cases of disputes or investigations, that the account could be frozen to prevent the individual from accessing their services or creating new accounts.

All of these, without revealing more information than required.

### The case for a novel identity infrastructure

One might think that the use cases mentioned might be a pipe dream, but what if I could tell you that the tools are readily available for a proof-of-concept (POC) work to solve all of the 3 use cases?

In fact, components from [Semaphore](https://semaphore.appliedzkp.org/) could be used to solve all 3 use cases, with exception to the range proves on the additional properties in the last use case which is really easy to solve with a ZKP framework with range proof available.

In a following blog post, I will take a deep dive into how we can build a POC using semaphore for the anonymous goods distribution use case (the most complex of the 3 in my opinion).

[Subscribe to my mailing list](https://geek.us2.list-manage.com/subscribe?u=bfcc21792349f4f0eaff4a2a3&id=694896a0df) if you like to be notified on how to build such identity infrastructures.

- - -

**Additional Readings**

* [Introduction to Zero-Knowledge Proof](https://www.youtube.com/watch?v=ewUs2fqBGhI)
* [ZKProof Community Reference](https://docs.zkproof.org/reference.pdf)
* [Semaphore Spec](https://github.com/appliedzkp/semaphore/blob/master/spec/Semaphore%20Spec.pdf)

- - -

Special thanks to Lai Ying Tong from Electric Coin Company & Koh Wei Jie from Ethereum Foundation for contributions to the original memo titled “[Zero-knowledge in civic tech: an overview of three use-cases](https://hackmd.io/H2fWMskdT828skWYfJ3xrQ)” where this article is based on.