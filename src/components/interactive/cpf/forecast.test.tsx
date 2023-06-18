// Interest calculated monthly, compounded annually
// https://www.cpf.gov.sg/member/faq/growing-your-savings/cpf-interest-rates/how-is-my-cpf-interest-computed-and-credited-into-my-accounts

// User inputs
// Current OA Balance
// Current SA Balance
// Current MA Balance
// Current Salary
// Birth year
// Birth month (default to Jan)
// Intended retirement age
// Annual Bonus
// Salary Increment
// SA Top Up (Cash)
// OA to SA Transfer
// Current Housing Loan Balance
// Current Mortgage
// Current CPF Accrued Interest
// Months Left On Mortgage

// Section
// 1. Retirement
// 2. Housing

// Table
// Current year | Current month | Age (year & month) | Current Salary | Bonus | YTD Contributions | Current OA | MA | SA | Accrued Interest OA | MA | SA | OA Used for Housing | OA Accrued interest (pending) | OA Accrued interest

interface Timestamp {
  year: number;
  month: number;
}

type Age = Timestamp;

interface Account {
  sa: number;
  ma: number;
  oa: number;
}

interface Statement {
  date: Timestamp;
  age: Age;
  salary: number;
  bonus: number;
  saCashTopUp: number;
  oaToSaTransfer: number;
  currentBalances: Account;
  accruedInterest: Account;
  ytdContributions: Account;
  salaryContributions: Account;
  ytdAccruedInterest: Account;
  housingOaBalance: number;
  housingDeductions: number;
  housingYtdOaAccruedInterest: number;
  bhsLimit: number;
  frs: number;
}

interface UserInputs {
  now: Date;
  birthYear: number;
  birthMonth: number;
  currentSalary: number;
  annualBonusInMonths: number;
  annualCashTopUp: number;
  annualOaToSaTransfer: number;
  currentBalances: Account;
  housingOaBalance: number;
  housingDeductions: number;
  ageToStopWorking: Age;
  timeForLastMortgagePayment: Timestamp;
}

const mod = (a: number, b: number) => ((a % b) + b) % b;

const generateInitialStatement = ({
  now,
  birthYear,
  birthMonth,
  currentSalary,
  annualBonusInMonths,
  annualCashTopUp,
  annualOaToSaTransfer,
  currentBalances,
  housingOaBalance,
  housingDeductions,
}: UserInputs): Statement => {
  const date = { year: now.getFullYear(), month: now.getMonth() + 1 };
  const age = {
    year:
      date.month - birthMonth >= 0
        ? date.year - birthYear
        : date.year - birthYear - 1,
    month: mod(date.month - birthMonth, 12),
  };

  // Assumes cash top up and OA to SA transfer is done in January only
  const saCashTopUp = date.month === 1 ? annualCashTopUp : 0;
  const oaToSaTransfer = date.month === 1 ? annualOaToSaTransfer : 0;

  // TODO - calculate accrued interest assuming equal monthly contributions
  const ytdContributions = { oa: 0, sa: 0, ma: 0 };
  const ytdAccruedInterest = { oa: 0, sa: 0, ma: 0 };
  const accruedInterest = { oa: 0, sa: 0, ma: 0 };

  const salary = currentSalary;
  const salaryContributions = contributionsFromSalaryOrBonus({
    salary,
    date,
    age,
    ytdContributions,
  });

  // Assumes bonus is credited in December only
  const bonus = date.month === 12 ? annualBonusInMonths * salary : 0;

  // TODO - calculate accrued interest for housing OA
  const housingYtdOaAccruedInterest = 0;

  return {
    date,
    age,
    salary,
    bonus,
    saCashTopUp,
    oaToSaTransfer,
    currentBalances,
    ytdContributions,
    ytdAccruedInterest,
    accruedInterest,
    salaryContributions,
    housingOaBalance,
    housingDeductions,
    housingYtdOaAccruedInterest,
    bhsLimit: getBhs(date.year),
    frs: getFrs(date.year),
  };
};

// Basic Health Sum (BHS) ie Max limit on MA
// https://www.cpf.gov.sg/member/faq/healthcare-financing/basic-healthcare-sum/what-is-the-basic-healthcare-sum-when-i-turn-65-years-old
// https://blog.seedly.sg/basic-healthcare-sum-bhs-cpf-singapore/
// Any contributions beyond the BHS will be transferred to SA/RA
export const getBhs = (currentYear: number): number => {
  const lastPublishedYear = 2023;
  const lastCohortBhs = 68500;
  return 1.047 ** (currentYear - lastPublishedYear) * lastCohortBhs;
};

// Retirement sums
// https://www.cpf.gov.sg/member/faq/retirement-income/general-information-on-retirement/what-are-the-retirement-sums-applicable-to-me-
export const getFrs = (currentYear: number): number => {
  const lastPublishedYear = 2027;
  const lastCohortFrs = 228200;
  switch (currentYear) {
    case 2023:
      return 198800;
    case 2024:
      return 205800;
    case 2025:
      return 213000;
    case 2026:
      return 220400;
    case lastPublishedYear: // For 2027
      return lastCohortFrs;
    default:
      return 1.03 ** (currentYear - lastPublishedYear) * lastCohortFrs;
  }
};
// CPF Allocation Rate
// https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPF%20allocation%20rates%20from%201%20January%202023.pdf
const getAllocationRate = (age: Age): Account => {
  switch (true) {
    case age.year <= 35:
      return { oa: 0.6217, sa: 0.1621, ma: 0.2162 };
    case age.year <= 45:
      return { oa: 0.5677, sa: 0.1891, ma: 0.2432 };
    case age.year <= 50:
      return { oa: 0.5136, sa: 0.2162, ma: 0.2702 };
    default:
      // age.year <= 55
      return { oa: 0.4055, sa: 0.3108, ma: 0.2837 };
  }
};

// CPF Monthly salary ceiling
// https://www.cpf.gov.sg/member/infohub/news/media-news/budget-2023-cpf-monthly-salary-ceiling-to-be-raised-to-8000-by-2026
// Current - 6k
// Sep 2023 - 6.3k
// Jan 2024 - 6.8k
// Jan 2025 - 7.4k
// Jan 2026 - 8k
const getSalaryCeiling = (time: Timestamp) => {
  switch (true) {
    case time.year <= 2023 && time.month <= 8:
      return 6000;
    case time.year < 2024:
      return 6300;
    case time.year < 2025:
      return 6800;
    case time.year < 2026:
      return 7400;
    default:
      return 8000;
  }
};

// CPF Contribution Rate
// https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay
const getSalaryContributionRate = () => 0.37; // 17% by self, 20% by employer

const accountAdd = (a: Account, b: Account): Account => ({
  oa: a.oa + b.oa,
  sa: a.sa + b.sa,
  ma: a.ma + b.ma,
});

const accountBalanceSum = (a: Account): number => a.oa + a.sa + a.ma;

// CPF Annual Ceiling
// https://www.cpf.gov.sg/employer/faq/employer-obligations/what-payments-attract-cpf-contributions/what-are-the-changes-to-the-cpf-salary-ceilings-from-1-sep-2023
// The CPF Annual limit will also remain at $37,740.
const annualContributionLimit = () => 37740;

const contributionsFromSalaryOrBonus = (
  {
    salary,
    date,
    age,
    ytdContributions,
  }: {
    salary: number;
    age: Age;
    date: Timestamp;
    ytdContributions: Account;
  },
  isBonus = false
): Account => {
  const allocationRate = getAllocationRate(age);
  const salaryContributed =
    (isBonus ? salary : Math.min(salary, getSalaryCeiling(date))) *
    getSalaryContributionRate();
  const oa = salaryContributed * allocationRate.oa;
  const sa = salaryContributed * allocationRate.sa;
  const ma = salaryContributed * allocationRate.ma;
  const contribution = { oa, sa, ma };

  // Checks if contribution would exceed annual limit
  const totalYtdContributions = accountBalanceSum(ytdContributions);
  const allowanceForContribution = Math.max(
    annualContributionLimit() - totalYtdContributions,
    0
  );

  // Return contribution if it does not exceed annual limit
  if (accountBalanceSum(contribution) <= allowanceForContribution)
    return contribution;

  // Otherwise, return contribution that does not exceed annual limit
  return {
    oa: allocationRate.oa * allowanceForContribution,
    sa: allocationRate.sa * allowanceForContribution,
    ma: allocationRate.ma * allowanceForContribution,
  };
};

// Interest rate calculation
// https://www.cpf.gov.sg/member/growing-your-savings/earning-higher-returns/earning-attractive-interest
// OA - 2.5% (using floor)
// SA & MA - 4% (using floor)
// RA - 4%
const monthlyBaseInterest = (currentBalances: Account): Account => {
  const oa = (currentBalances.oa * 0.025) / 12;
  const sa = (currentBalances.sa * 0.04) / 12;
  const ma = (currentBalances.ma * 0.04) / 12;
  return { oa, sa, ma };
};

// Extra interest on first $60k
// https://www.cpf.gov.sg/member/faq/growing-your-savings/cpf-interest-rates/how-much-extra-interest-can-i-earn-on-my-cpf-savings
// Your accounts are used to compute your combined CPF balances in the following order:
// - 1st: Retirement Account (RA), including any CPF LIFE premium balance
// - 2nd: OA, with a cap of $20,000*
// - 3rd: Special Account (SA)
// - 4th: MediSave Account (MA)
const monthlyExtraInterest = (currentBalances: Account): Account => {
  let considerationsBudget = 60000;

  // Apply to OA
  const oaConsiderations = Math.min(
    currentBalances.oa,
    considerationsBudget,
    20000
  );
  considerationsBudget -= oaConsiderations;
  const oa = (oaConsiderations * 0.01) / 12;

  // Apply to SA
  const saConsiderations = Math.min(currentBalances.sa, considerationsBudget);
  considerationsBudget -= saConsiderations;
  const sa = (saConsiderations * 0.01) / 12;

  // Apply to MA
  const maConsiderations = Math.min(currentBalances.ma, considerationsBudget);
  considerationsBudget -= maConsiderations;
  const ma = (maConsiderations * 0.01) / 12;

  return { oa, sa, ma };
};

const zeroAccount = (): Account => ({ oa: 0, sa: 0, ma: 0 });

const isTimeBefore = (a: Timestamp, b: Timestamp): boolean => {
  return a.year < b.year || (a.year === b.year && a.month < b.month);
};

const generateNextStatement = (
  previousStatement: Statement,
  settings: UserInputs
): Statement => {
  const currentDate = {
    year:
      previousStatement.date.month === 12
        ? previousStatement.date.year + 1
        : previousStatement.date.year,
    month:
      previousStatement.date.month === 12
        ? 1
        : previousStatement.date.month + 1,
  };
  const currentAge = {
    year:
      previousStatement.age.month === 11
        ? previousStatement.age.year + 1
        : previousStatement.age.year,
    month: (previousStatement.age.month + 1) % 12,
  };
  const nextBalance = {
    oa: previousStatement.currentBalances.oa,
    sa: previousStatement.currentBalances.sa,
    ma: previousStatement.currentBalances.ma,
  };
  const nextYtdContributions =
    currentDate.month === 1
      ? zeroAccount()
      : {
          oa: previousStatement.ytdContributions.oa,
          sa: previousStatement.ytdContributions.sa,
          ma: previousStatement.ytdContributions.ma,
        };
  let nextHousingOaBalance = previousStatement.housingOaBalance;
  let nextHousingYtdOaAccruedInterest =
    currentDate.month === 1 ? 0 : previousStatement.housingYtdOaAccruedInterest;
  const isCurrentlyWorking = isTimeBefore(
    currentAge,
    settings.ageToStopWorking
  );
  const isCurrentlyPayingHousing = isTimeBefore(
    currentDate,
    settings.timeForLastMortgagePayment
  );
  const salaryContributions = zeroAccount();

  // Accrue interest on previous balances
  const baseInterest = monthlyBaseInterest(previousStatement.currentBalances);
  const extraInterest = monthlyExtraInterest(previousStatement.currentBalances);
  const accruedInterest = accountAdd(baseInterest, extraInterest);
  const ytdAccruedInterest = accountAdd(
    currentDate.month === 1
      ? zeroAccount()
      : previousStatement.ytdAccruedInterest,
    accruedInterest
  );

  // Credit accrued interest if in December
  if (currentDate.month === 12) {
    nextBalance.oa += ytdAccruedInterest.oa;
    nextBalance.sa += ytdAccruedInterest.sa;
    nextBalance.ma += ytdAccruedInterest.ma;
  }

  // TODO Add salary adjustments
  const salary = isCurrentlyWorking ? settings.currentSalary : 0;

  // Add salary contributions
  if (isCurrentlyWorking) {
    const contributionFromSalary = contributionsFromSalaryOrBonus({
      salary,
      date: currentDate,
      age: currentAge,
      ytdContributions: nextYtdContributions,
    });

    salaryContributions.oa += contributionFromSalary.oa;
    salaryContributions.sa += contributionFromSalary.sa;
    salaryContributions.ma += contributionFromSalary.ma;
    nextBalance.oa += contributionFromSalary.oa;
    nextBalance.sa += contributionFromSalary.sa;
    nextBalance.ma += contributionFromSalary.ma;
  }

  // Add bonus contributions (if still working)
  const isCreditingBonus = isCurrentlyWorking && currentDate.month === 12;
  const bonus = isCreditingBonus ? settings.annualBonusInMonths * salary : 0;
  if (isCreditingBonus) {
    const contributionFromBonus = contributionsFromSalaryOrBonus(
      {
        salary: bonus,
        date: currentDate,
        age: currentAge,
        ytdContributions: nextYtdContributions,
      },
      true
    );
    salaryContributions.oa += contributionFromBonus.oa;
    salaryContributions.sa += contributionFromBonus.sa;
    salaryContributions.ma += contributionFromBonus.ma;
    nextBalance.oa += contributionFromBonus.oa;
    nextBalance.sa += contributionFromBonus.sa;
    nextBalance.ma += contributionFromBonus.ma;
  }

  nextYtdContributions.oa += salaryContributions.oa;
  nextYtdContributions.sa += salaryContributions.sa;
  nextYtdContributions.ma += salaryContributions.ma;

  // Deduct housing payments from OA
  if (isCurrentlyPayingHousing) {
    nextBalance.oa -= settings.housingDeductions;
    nextHousingOaBalance += settings.housingDeductions;
  }
  nextHousingYtdOaAccruedInterest += (nextHousingOaBalance * 0.025) / 12;
  // Credit accrued interest from mortgage if in December
  if (currentDate.month === 12) {
    nextHousingOaBalance += nextHousingYtdOaAccruedInterest;
  }

  // Overflow MA in excess of BHS to SA
  const bhsLimit = getBhs(currentDate.year);
  if (nextBalance.ma > bhsLimit) {
    nextBalance.sa += nextBalance.ma - bhsLimit;
    nextBalance.ma = bhsLimit;
  }

  // Top ups & transfers in January
  let saCashTopUp = 0;
  let oaToSaTransfer = 0;
  if (currentDate.month === 1) {
    saCashTopUp = settings.annualCashTopUp;
    nextBalance.sa += saCashTopUp;

    oaToSaTransfer = settings.annualOaToSaTransfer;
    nextBalance.oa -= oaToSaTransfer;
    nextBalance.sa += oaToSaTransfer;
  }

  return {
    date: currentDate,
    age: currentAge,
    salary,
    bonus,
    saCashTopUp,
    oaToSaTransfer,
    currentBalances: nextBalance,
    ytdContributions: nextYtdContributions,
    salaryContributions,
    accruedInterest,
    ytdAccruedInterest,
    housingOaBalance: nextHousingOaBalance,
    housingDeductions: settings.housingDeductions,
    housingYtdOaAccruedInterest: nextHousingYtdOaAccruedInterest,
    bhsLimit,
    frs: getFrs(currentDate.year),
  };
};

describe("generateInitialStatement", () => {
  it("should generate the initial state correctly for months greater than current month", () => {
    const input: UserInputs = {
      now: new Date("2023-06-18"),
      birthYear: 1990,
      birthMonth: 8,
      currentSalary: 10000,
      annualBonusInMonths: 1,
      annualCashTopUp: 0,
      annualOaToSaTransfer: 0,
      currentBalances: {
        oa: 10000,
        sa: 10000,
        ma: 10000,
      },
      housingOaBalance: 50000,
      housingDeductions: 500,
      ageToStopWorking: {
        year: 60,
        month: 0,
      },
      timeForLastMortgagePayment: {
        year: 2050,
        month: 0,
      },
    };
    expect(generateInitialStatement(input)).toMatchInlineSnapshot(`
      Object {
        "accruedInterest": Object {
          "ma": 0,
          "oa": 0,
          "sa": 0,
        },
        "age": Object {
          "month": 10,
          "year": 32,
        },
        "bhsLimit": 68500,
        "bonus": 0,
        "currentBalances": Object {
          "ma": 10000,
          "oa": 10000,
          "sa": 10000,
        },
        "date": Object {
          "month": 6,
          "year": 2023,
        },
        "frs": 198800,
        "housingDeductions": 500,
        "housingOaBalance": 50000,
        "housingYtdOaAccruedInterest": 0,
        "oaToSaTransfer": 0,
        "saCashTopUp": 0,
        "salary": 10000,
        "salaryContributions": Object {
          "ma": 479.964,
          "oa": 1380.174,
          "sa": 359.86199999999997,
        },
        "ytdAccruedInterest": Object {
          "ma": 0,
          "oa": 0,
          "sa": 0,
        },
        "ytdContributions": Object {
          "ma": 0,
          "oa": 0,
          "sa": 0,
        },
      }
    `);
  });
  it("should generate the initial state correctly for months less than current month", () => {
    const input: UserInputs = {
      now: new Date("2023-06-18"),
      birthYear: 1990,
      birthMonth: 4,
      currentSalary: 10000,
      annualBonusInMonths: 1,
      annualCashTopUp: 0,
      annualOaToSaTransfer: 0,
      currentBalances: {
        oa: 10000,
        sa: 10000,
        ma: 10000,
      },
      housingOaBalance: 50000,
      housingDeductions: 500,
      ageToStopWorking: {
        year: 60,
        month: 0,
      },
      timeForLastMortgagePayment: {
        year: 2050,
        month: 0,
      },
    };
    expect(generateInitialStatement(input)).toMatchInlineSnapshot(`
      Object {
        "accruedInterest": Object {
          "ma": 0,
          "oa": 0,
          "sa": 0,
        },
        "age": Object {
          "month": 2,
          "year": 33,
        },
        "bhsLimit": 68500,
        "bonus": 0,
        "currentBalances": Object {
          "ma": 10000,
          "oa": 10000,
          "sa": 10000,
        },
        "date": Object {
          "month": 6,
          "year": 2023,
        },
        "frs": 198800,
        "housingDeductions": 500,
        "housingOaBalance": 50000,
        "housingYtdOaAccruedInterest": 0,
        "oaToSaTransfer": 0,
        "saCashTopUp": 0,
        "salary": 10000,
        "salaryContributions": Object {
          "ma": 479.964,
          "oa": 1380.174,
          "sa": 359.86199999999997,
        },
        "ytdAccruedInterest": Object {
          "ma": 0,
          "oa": 0,
          "sa": 0,
        },
        "ytdContributions": Object {
          "ma": 0,
          "oa": 0,
          "sa": 0,
        },
      }
    `);
  });
});
describe("getSalaryCeiling", () => {
  it("should be correct for legacy rates", () => {
    expect(getSalaryCeiling({ year: 2021, month: 1 })).toEqual(6000);
    expect(getSalaryCeiling({ year: 2023, month: 8 })).toEqual(6000);
  });
  it("should be correct from Sep 2023 to Jan 2024", () => {
    expect(getSalaryCeiling({ year: 2023, month: 9 })).toEqual(6300);
    expect(getSalaryCeiling({ year: 2023, month: 12 })).toEqual(6300);
  });
  it("should be correct from Jan 2024 to Dec 2024", () => {
    expect(getSalaryCeiling({ year: 2024, month: 1 })).toEqual(6800);
    expect(getSalaryCeiling({ year: 2024, month: 12 })).toEqual(6800);
  });
  it("should be correct from Jan 2025 to Dec 2025", () => {
    expect(getSalaryCeiling({ year: 2025, month: 1 })).toEqual(7400);
    expect(getSalaryCeiling({ year: 2025, month: 12 })).toEqual(7400);
  });
  it("should be correct from Jan 2026 and beyond", () => {
    expect(getSalaryCeiling({ year: 2026, month: 1 })).toEqual(8000);
    expect(getSalaryCeiling({ year: 2200, month: 12 })).toEqual(8000);
  });
});
describe("contributionsFromSalaryOrBonus", () => {
  it("should be correct for salaries below the salary ceiling", () => {
    const contribution = contributionsFromSalaryOrBonus({
      salary: 2000,
      age: { year: 30, month: 0 },
      date: { year: 2023, month: 6 },
      ytdContributions: { ma: 0, oa: 0, sa: 0 },
    });
    expect(contribution).toMatchInlineSnapshot(`
      Object {
        "ma": 159.988,
        "oa": 460.05800000000005,
        "sa": 119.954,
      }
    `);
    expect(contribution.ma + contribution.oa + contribution.sa).toEqual(
      0.37 * 2000
    );
  });
  it("should be correct for salaries above the salary ceiling", () => {
    const contribution = contributionsFromSalaryOrBonus({
      salary: 8000,
      age: { year: 30, month: 0 },
      date: { year: 2023, month: 6 },
      ytdContributions: { ma: 0, oa: 0, sa: 0 },
    });
    expect(contribution).toMatchInlineSnapshot(`
      Object {
        "ma": 479.964,
        "oa": 1380.174,
        "sa": 359.86199999999997,
      }
    `);
    expect(contribution.ma + contribution.oa + contribution.sa).toEqual(
      0.37 * 6000
    );
  });
  it("should be correct for salaries above the salary ceiling, even after adjustments", () => {
    const contribution = contributionsFromSalaryOrBonus({
      salary: 20000,
      age: { year: 30, month: 0 },
      date: { year: 2025, month: 6 },
      ytdContributions: { ma: 0, oa: 0, sa: 0 },
    });
    expect(contribution).toMatchInlineSnapshot(`
      Object {
        "ma": 591.9556,
        "oa": 1702.2146,
        "sa": 443.8298,
      }
    `);
    expect(contribution.ma + contribution.oa + contribution.sa).toEqual(
      0.37 * 7400
    );
  });
  it("should be correct for amounts exceeding annual contributions", () => {
    const contribution = contributionsFromSalaryOrBonus(
      {
        salary: 20000,
        age: { year: 30, month: 0 },
        date: { year: 2025, month: 6 },
        ytdContributions: { ma: 12000, oa: 12000, sa: 10000 },
      },
      true
    );
    expect(contribution).toMatchInlineSnapshot(`
      Object {
        "ma": 808.588,
        "oa": 2325.158,
        "sa": 606.254,
      }
    `);
    expect(contribution.ma + contribution.oa + contribution.sa).toEqual(3740);
  });
  it("should no longer contribute if annual limits are met", () => {
    const contribution = contributionsFromSalaryOrBonus(
      {
        salary: 20000,
        age: { year: 30, month: 0 },
        date: { year: 2025, month: 6 },
        ytdContributions: { ma: 0, oa: 37740, sa: 0 },
      },
      true
    );
    expect(contribution).toMatchInlineSnapshot(`
      Object {
        "ma": 0,
        "oa": 0,
        "sa": 0,
      }
    `);
  });
  it("should not have negative values", () => {
    const contribution = contributionsFromSalaryOrBonus(
      {
        salary: 20000,
        age: { year: 30, month: 0 },
        date: { year: 2025, month: 6 },
        ytdContributions: { ma: 0, oa: 100000, sa: 0 },
      },
      true
    );
    expect(contribution).toMatchInlineSnapshot(`
      Object {
        "ma": 0,
        "oa": 0,
        "sa": 0,
      }
    `);
  });
});
describe("monthlyBaseInterest", () => {
  it("calculates correctly", () => {
    const interest = monthlyBaseInterest({
      oa: 10000,
      sa: 10000,
      ma: 10000,
    });
    expect(interest).toMatchInlineSnapshot(`
      Object {
        "ma": 33.333333333333336,
        "oa": 20.833333333333332,
        "sa": 33.333333333333336,
      }
    `);
  });
});
describe("monthlyExtraInterest", () => {
  it("calculates correctly for total balance under 60k", () => {
    const interest = monthlyExtraInterest({
      oa: 10000,
      sa: 10000,
      ma: 10000,
    });
    expect(interest).toMatchInlineSnapshot(`
      Object {
        "ma": 8.333333333333334,
        "oa": 8.333333333333334,
        "sa": 8.333333333333334,
      }
    `);
  });
  it("calculates correctly for total balance over 60k, where OA is maxed out", () => {
    const interest = monthlyExtraInterest({
      oa: 30000,
      sa: 30000,
      ma: 30000,
    });
    expect(interest).toMatchInlineSnapshot(`
      Object {
        "ma": 8.333333333333334,
        "oa": 16.666666666666668,
        "sa": 25,
      }
    `);
  });
});
describe("getBhs", () => {
  it("calculates correctly", () => {
    expect(getBhs(2023)).toBe(68500);
    expect(getBhs(2024)).toBe(71719.5);
    expect(getBhs(2050)).toBe(236728.7346942958);
  });
});
describe("generateNextStatement", () => {
  it("calculates correctly for over a year", () => {
    let lastStatement: Statement = {
      date: { year: 2023, month: 12 },
      age: { year: 30, month: 0 },
      salary: 6000,
      bonus: 0,
      saCashTopUp: 0,
      oaToSaTransfer: 0,
      currentBalances: { oa: 10000, sa: 10000, ma: 10000 },
      salaryContributions: { oa: 10000, sa: 10000, ma: 10000 },
      accruedInterest: { oa: 0, sa: 0, ma: 0 },
      ytdContributions: { oa: 0, sa: 0, ma: 0 },
      ytdAccruedInterest: { oa: 0, sa: 0, ma: 0 },
      housingOaBalance: 10000,
      housingDeductions: 200,
      housingYtdOaAccruedInterest: 0,
      bhsLimit: getBhs(2023),
      frs: getFrs(2023),
    };
    const settings: UserInputs = {
      now: new Date("2023-06-01"),
      birthYear: 1993,
      birthMonth: 12,
      currentSalary: 6000,
      annualBonusInMonths: 2,
      annualCashTopUp: 1000,
      annualOaToSaTransfer: 1000,
      currentBalances: { oa: 10000, sa: 10000, ma: 10000 },
      housingOaBalance: 10000,
      housingDeductions: 200,
      ageToStopWorking: { year: 62, month: 0 },
      timeForLastMortgagePayment: { year: 2050, month: 0 },
    };
    const statements = [lastStatement];
    for (let i = 0; i < 13; i++) {
      const nextStatement = generateNextStatement(lastStatement, settings);
      statements.push(nextStatement);
      lastStatement = nextStatement;
    }
    expect(statements).toMatchSnapshot();
  });
});
// monthly input
// - age
// - accounts (oa, sa, ma)
// - salary
// - bonus
// - housing balance

// monthly output
// - accrued interest (oa, sa, ma)
// - mortgage interest

// * limitations, does not know your accrued interest before this month
