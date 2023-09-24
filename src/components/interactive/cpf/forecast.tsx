// Interest calculated monthly, compounded annually
// https://www.cpf.gov.sg/member/faq/growing-your-savings/cpf-interest-rates/how-is-my-cpf-interest-computed-and-credited-into-my-accounts

export interface Timestamp {
  year: number;
  month: number;
}

export type Age = Timestamp;

export interface Account {
  sa: number;
  ma: number;
  oa: number;
}

export interface Statement {
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

export interface UserInputs {
  now: Date;
  birthYear: number;
  birthMonth: number;
  currentSalary: number;
  annualSalaryIncrementPct: number;
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

export const generateInitialStatement = ({
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
export const getAllocationRate = (age: Age): Account => {
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
export const getSalaryCeiling = (time: Timestamp) => {
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

export const contributionsFromSalaryOrBonus = (
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
export const monthlyBaseInterest = (currentBalances: Account): Account => {
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
export const monthlyExtraInterest = (currentBalances: Account): Account => {
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

export const generateNextStatement = (
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

  // Salary after adjustments
  const salary = isCurrentlyWorking
    ? (1 + settings.annualSalaryIncrementPct / 100 / 12) *
      previousStatement.salary
    : 0;

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
  const housingDeductions = isCurrentlyPayingHousing
    ? settings.housingDeductions
    : 0;
  if (isCurrentlyPayingHousing) {
    nextBalance.oa -= housingDeductions;
    nextHousingOaBalance += housingDeductions;
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
    housingDeductions,
    housingYtdOaAccruedInterest: nextHousingYtdOaAccruedInterest,
    bhsLimit,
    frs: getFrs(currentDate.year),
  };
};

export const generateForecast = (settings: UserInputs): Statement[] => {
  const initialStatement = generateInitialStatement(settings);
  const statements = [initialStatement];
  let lastStatement = initialStatement;
  let sanityCounter = 55 * 12;
  while (lastStatement.age.year <= 54 && sanityCounter >= 0) {
    const nextStatement = generateNextStatement(lastStatement, settings);
    statements.push(nextStatement);
    lastStatement = nextStatement;
    sanityCounter--;
  }
  return statements;
};
