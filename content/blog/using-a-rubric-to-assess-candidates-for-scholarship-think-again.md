---
template: blog-post
title: Using a rubric to assess candidates for scholarship? Think again.
publishedDate: 2020-08-22T09:04:26.956Z
description: >
  Rubrics are useful tools used to assess students according to learning
  outcomes. However, outside of the education system we still see it being used
  everywhere, from case study competitions, to hackathons, interviews or
  scholarship assessments. 
featured: false
img: ../../static/images/girl-with-book.png
imgAlt: Drop the rubrics, this is not the school!
tags:
  - leadership
  - quadratic-voting
---
If you want exceptional candidates, throw away the rubrics. 

A rubric is "a scoring guide used to evaluate the quality of students' constructed responses". Put simply, it is a set of criteria for grading assignments.

That's [Wikipedia's entry](https://en.wikipedia.org/wiki/Rubric_(academic)) on a rubrics. 

Rubrics are very useful tools used in education systems to provide a standardized way to assess students according to learning outcomes. However, outside of the education system we still see it being used everywhere, from case study competitions, to hackathons, interviews or scholarship assessments. 

That's where the problem lies.

## This is no school

In the learning & development context, it is possible to clearly define the lesson outcome and assess the learner's abilities before and after the lessons were delivered. This allows the educator to calibrate their teaching material and the learner to calibrate on the way they learn or topics to focus on in subsequent interactions. Essentially it is part of a process for teaching & learning.

When an assessment matrix is used outside of the context of learning and development, for instance for scholarship award assessment, a few problem arises:

1. It is hard to calibrate individual performance to a scoring system especially if the candidate pool is diverse
1. It is hard to define the range of traits or dimension that deserves a score
1. It is hard to differentiate a candidate who is exceptional in a dimension from another who simply scores full marks on the rubrics
1. It is easy to overlook an exceptional candidate's strength simply because he has several weaknesses as well

## There is no 100 marks

Outside of the education system, there is no perfect score for a candidate. Just when you think a candidate is good, someone better appears at the door. The rubrics is made to measure a learner's ability according to well defined outcomes, you simply could not use it in a context of a competition, scholarship assessment or the likes of it. If you have tried that before you would find yourself re-calibrating the score on the previous candidates as new candidates presents themselves. Perhaps you would even encountered cases where you were trying to give more points to a candidate but have maxed out on one dimension and instead add points to another dimension instead!

So the question is... if we are bench-marking one candidate against other, why don't we start with that? Maybe, we could even remove multi-dimensions assessment? 

Let's throw away the rubrics and just focus on the deliberation...

## Simple Ranked List

Let's imagine a new way of assessing, using only simple priority list. Each assessor will simply maintain his own list of candidates ranked by the overall standing of the candidates. When the first candidate is being assessed, he will be placed in the center of the list. Each subsequent candidate will simply be inserted in above or below other candidates which were previously assessed.

For instance, for a list of 5 candidates, where the first is the most favored candidate, the score will look like:

```txt
Milana Redman - (5)
Abby Herman - (4)
Ellisha Chan - (3)
Arisha Cuevas - (2)
Zaki Kirby - (1)
```

Once the entire pool of candidates has been assessed, each assessor will have their own priority list. Now, they will simply combine their priority lists into one. They can do so by assigning an score to each candidate on the list. 

The scores will be added for all candidates and the overall priority list could then look like (in a scenario of 4 assessors): 


```txt
Abby Herman - (18)
Milana Redman - (17)
Ellisha Chan - (11)
Arisha Cuevas - (8)
Zaki Kirby - (6)
```

With this list, we can see the overall ranking of all the candidate against one another. One can then award competition prizes accordingly to the rank. 

One might think that the results of the rubrics would also achieve the same, but here are some stark difference: 

### Holistic Assessments

Without a rubrics, we allow the assessors to assess the candidates more holistically without the constraints of having fixed dimensions. That is very common in a panel of assessors where each of them has different priorities when it comes to a "perfect candidate". This method respects the professional opinion of each of these assessors, and we do not need them to calibrate the idea of the perfect candidate as they assess the candidates. 

### Strength Based

A rubrics allows one to assess a candidate against a well specified outcome. However, it is not useful in cases where all candidates are exceptional to begin with. 

In addition, if the culture is [strength-based](https://www.gallup.com/cliftonstrengths/en/290903/how-to-create-strengths-based-company-culture.aspx), this approach allows assessors to pit one candidate's strength against so long as their weaknesses are managed. This prevents the case where an above-average performer in all the different dimensions from scoring better than another candidates who has clear strengths that the panel values but has weaknesses in areas that could potentially be managed.  

## Quadratic Voting

While the simple ranked list is better than a rubrics for assessing candidates more holistically, there are still some problems:

- What if the assessor really could not decide on the ranking of two candidates?
- What if the assessor thinks that the top 2 candidates are in a league of their own?
- What if the assessor thinks that the bottom 2 candidates should not even be considered?
- What if the assessor would rather defer the decision of one candidate to other assessors?

One way for the assessors to send these signal is through [quadratic voting](/blog/quadratic-voting-group-consensus). 

Using a [quadratic voting program](https://qv.geek.sg/), we can allow the assessors to:

- signal preference intensity of a candidate by increased number of votes
- signal distaste through the use of negative votes
- signal indifference by not casting either positive or negative votes
- have moderated preferences to simulate the tradeoffs of the organization

With quadratic voting, the assessor will assign a prior score to the first candidates. With each subsequent candidates, the assessor may have re-calibrate scores given to previous candidates to establish the relative ranking of the candidates. After all the candidates have been assessed, the assessor will have a final chance to adjust his votes before it can be submitted to be automatically tallied.

Once the votes have been tallied, the panel will receive the final ranked list of the candidates which can be used to award the prizes. 

In addition, insights of the distribution of votes for each candidates can also be discussed in the postmortem.

## Final Note

I'm a strong proponent of strength based company culture where we champion and leverage on one another strengths instead of trying to create a homogeneous population of average performers. For that reason, I want to avoid using a rubrics which were not designed to describe top performing candidates. Instead, I propose a holistic strength based assessment which does not favor the average. 

The other purpose of this post is to draw parallels between assessments of candidates with typical elections. 

In the post I've noted that both ranked list and quadratic voting can be used for such assessments but the debate of "the best voting system" remain inconclusive. To understand the problems of voting systems, I highly recommend the [ballot simulation by Nicky Case](https://ncase.me/ballot/).