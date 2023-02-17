---
template: blog-post
title: Get the implementation contract of a minimal proxy using this Solidity
  code snippet
publishedDate: 2023-02-17T02:50:53.040Z
description: "Solidity code to get the target contract of a OpenZeppelin's
  minimal proxy (ie Clone). "
featured: false
img: ../../static/images/finding-the-clone.png
imgAlt: Where are the clones coming from?
tags:
  - code-snippet
  - solidity
---
P﻿art of the Bluejay's Earn architecture uses [OpenZeppelin's Minimal Proxy (or Clones)](https://docs.openzeppelin.com/contracts/4.x/api/proxy#Clones) to create copies of smart contract without deploying them to save gas cost. 

Specifically, it has templates for different type of loan repayment schedules - Amortized and Balloon (or Bullet). Using a factory contract, we create loan pools which utilizes one of the two repayment schedule. The problem with this approach is that the frontend will not be able to tell which of the two repayment schedule is being used in the loan pool and therefore unable to show the type of loan on the application. 

T﻿he solution to this problem is to figure out which is the implementation contract for the proxy. And we can do that via some assembly level hacks on the Solidity contract:

```
  function getMinimalProxyTarget(address proxy)
    public
    view
    returns (address targetAddr)
  {
    bytes memory target = new bytes(20);
    assembly {
      let size := 0x14
      extcodecopy(proxy, add(target, 0x20), 0x0A, size)
    }
    targetAddr = address(bytes20(target));
  }
`﻿``


T﻿he function above will get the implementation contract address of a minimal proxy deployed through OZ's Clone contract by reading the address directly from the proxy's code itself. 

Take note that the function does not perform separate validation to ensure that the address is indeed a minimal proxy (which you can easily assert by comparing the bytecodes before and after the address and asserting the right code length).