const CPF_CONTRIBUTION_CEILING = 102000;

export interface Account {
  sa: number;
  ma: number;
  ra: number;
  oa: number;
}

export interface ComputeNextParams {
  current: Account;
  birthYear: number;
  year: number;
  month: number;
  salary: number;
  accruedInterest: Account;
  stopWorkAge: number;
  topUp: number;
  transfer: number;
  bonusByMonths: number;
  salaryInflationPerYear: number;
}

export interface ForecastLine extends Account {
  year: number;
  month: number;
  age: number;
  accruedInterest: Account;
  creditedInterest: Account;
  currentFrs: number;
  currentBhs: number;
  salary?: number;
}

export interface ComputeCpfParams {
  current: Account;
  salary: number;
  topUp: number;
  transfer: number;
  stopWorkAge: number;
  bonusByMonths: number;
  salaryInflationPerYear: number;
  birthYear: number;
}

export const zeroAccount = (): Account => ({
  sa: 0,
  ma: 0,
  ra: 0,
  oa: 0,
});

export const getBhs = (year: number): number => {
  switch (true) {
    case year <= 2016:
      return 49800;
    case year === 2017:
      return 52000;
    case year === 2018:
      return 54500;
    case year === 2019:
      return 57200;
    case year === 2020:
      return 60000;
    default:
      return 1.0495 ** (year - 2020) * 60000;
  }
};

export const getFrs = (year: number): number => {
  switch (year) {
    case 2017:
      return 166000;
    case 2018:
      return 171000;
    case 2019:
      return 176000;
    case 2020:
      return 181000;
    case 2021:
      return 186000;
    case 2022:
      return 192000;
    default:
      return 1.03 ** (year - 2022) * 192000;
  }
};

export const overflowFromBhs = (cpf: Account, year: number): Account => {
  const bhs = getBhs(year);
  if (cpf.ma <= bhs) {
    return cpf;
  }
  const excess = cpf.ma - bhs;
  return {
    oa: cpf.oa,
    ra: cpf.ra,
    sa: cpf.sa + excess,
    ma: cpf.ma - excess,
  };
};

export const uncappedSalaryContribution = (
  eligibleSalary: number,
  age: number
): Account => {
  switch (true) {
    case age <= 35:
      return {
        oa: 0.23 * eligibleSalary,
        sa: 0.06 * eligibleSalary,
        ma: 0.08 * eligibleSalary,
        ra: 0,
      };
    case age <= 45:
      return {
        oa: 0.21 * eligibleSalary,
        sa: 0.07 * eligibleSalary,
        ma: 0.09 * eligibleSalary,
        ra: 0,
      };
    case age <= 50:
      return {
        oa: 0.19 * eligibleSalary,
        sa: 0.08 * eligibleSalary,
        ma: 0.1 * eligibleSalary,
        ra: 0,
      };
    case age <= 55:
      return {
        oa: 0.15 * eligibleSalary,
        sa: 0.115 * eligibleSalary,
        ma: 0.105 * eligibleSalary,
        ra: 0,
      };
    case age <= 60:
      return {
        oa: 0.12 * eligibleSalary,
        sa: 0.035 * eligibleSalary,
        ma: 0.105 * eligibleSalary,
        ra: 0,
      };
    case age <= 65:
      return {
        oa: 0.035 * eligibleSalary,
        sa: 0.025 * eligibleSalary,
        ma: 0.105 * eligibleSalary,
        ra: 0,
      };
    default:
      return {
        oa: 0.01 * eligibleSalary,
        sa: 0.01 * eligibleSalary,
        ma: 0.105 * eligibleSalary,
        ra: 0,
      };
  }
};

export const salaryContribution = (salary: number, age = 0): Account => {
  const eligibleSalary = Math.min(6000, salary);
  return uncappedSalaryContribution(eligibleSalary, age);
};

export const sumAccount = (account: Account, difference: Account): Account => ({
  oa: account.oa + difference.oa || 0,
  sa: account.sa + difference.sa || 0,
  ma: account.ma + difference.ma || 0,
  ra: account.ra + difference.ra || 0,
});

export const calculateAccruedInterest = (cpf: Account, age = 0): Account => {
  const oaInterest = 0.025 / 12;
  const maInterest = 0.04 / 12;
  const raInterest = 0.04 / 12;
  const saInterest = 0.04 / 12;

  const baseInterest = {
    oa: cpf.oa * oaInterest,
    sa: cpf.sa * saInterest,
    ra: cpf.ra * raInterest,
    ma: cpf.ma * maInterest,
  };

  // Calculate additional 1%
  const onePct = 0.01 / 12;
  let budget = age >= 55 ? 90000 : 60000;
  const additionalInterest = zeroAccount();
  if (budget >= cpf.ra) {
    budget -= cpf.ra;
    additionalInterest.ra += cpf.ra * onePct;
  } else {
    additionalInterest.ra += budget * onePct;
    budget = 0;
  }

  if (budget >= cpf.oa) {
    const effectiveOa = Math.min(20000, cpf.oa);
    budget -= effectiveOa;
    additionalInterest.oa += effectiveOa * onePct;
  } else {
    const effectiveOa = Math.min(20000, budget);
    additionalInterest.oa += effectiveOa * onePct;
    budget = 0;
  }

  if (budget >= cpf.sa) {
    budget -= cpf.sa;
    additionalInterest.sa += cpf.sa * onePct;
  } else {
    additionalInterest.sa += budget * onePct;
    budget = 0;
  }

  if (budget >= cpf.ma) {
    budget -= cpf.ma;
    additionalInterest.ma += cpf.ma * onePct;
  } else {
    additionalInterest.ma += budget * onePct;
    budget = 0;
  }

  return sumAccount(baseInterest, additionalInterest);
};

interface MonthlyState {
  cpf: Account;
  age: number;
  accruedInterest: Account;
  salary: number;
  currentFrs: number;
  currentBhs: number;
}

export const nextMonth = ({
  current,
  birthYear,
  year,
  month,
  salary,
  accruedInterest,
  stopWorkAge,
  topUp,
  transfer,
  bonusByMonths,
  salaryInflationPerYear,
}: ComputeNextParams): MonthlyState => {
  let cpf = current;
  let currentAccruedInterest = accruedInterest;
  const currentAge = year - birthYear;
  const currentFrs = getFrs(year);

  // Credit all bonus in December.
  // If this is a variable, we have to consider the limit to be exercised throughout the year.
  const bonusCreditMonth = 11;

  // Currently december, credit interest in the following month and zero accrued interest
  if (month === 11) {
    cpf = sumAccount(cpf, currentAccruedInterest);
    currentAccruedInterest = zeroAccount();
  }

  if (month === 0 && cpf.sa < currentFrs) {
    // Credit cpf SA top up in Jan
    if (topUp) {
      let availableTopUpBudget = currentFrs - cpf.sa;
      const actualAmount = Math.min(availableTopUpBudget, topUp);
      cpf.sa += actualAmount;
      availableTopUpBudget -= actualAmount;
    }

    // Transfer cpf OA to SA in Jan
    if (transfer) {
      const availableTopUpBudget = currentFrs - cpf.sa;
      const actualAmount = Math.min(availableTopUpBudget, cpf.oa, transfer);
      cpf.sa += actualAmount;
      cpf.oa -= actualAmount;
    }
  }

  // Add salary if still working
  if (currentAge < stopWorkAge) {
    const currentSalaryContribution = salaryContribution(salary, currentAge);
    cpf = sumAccount(cpf, currentSalaryContribution);
  }

  // Credit additional wages in december
  if (month === bonusCreditMonth) {
    const bonus = bonusByMonths * salary;
    const bonusCeiling = Math.max(CPF_CONTRIBUTION_CEILING - 12 * salary, 0);
    const contributionByBonus = Math.min(bonus, bonusCeiling);
    const bonusContribution = uncappedSalaryContribution(
      contributionByBonus,
      currentAge
    );
    cpf = sumAccount(cpf, bonusContribution);
  }

  // Add accrued interest
  const additionalInterest = calculateAccruedInterest(cpf, currentAge);
  currentAccruedInterest = sumAccount(
    currentAccruedInterest,
    additionalInterest
  );

  // Finally overflow MA excess of BHS to SA
  cpf = overflowFromBhs(cpf, year);

  // Salary inflation
  const nextSalary =
    month === 11 ? (salaryInflationPerYear / 100 + 1) * salary : salary;

  return {
    cpf,
    age: currentAge,
    accruedInterest: currentAccruedInterest,
    salary: nextSalary,
    currentFrs,
    currentBhs: getBhs(year),
  };
};

export const computeCpf = ({
  current,
  salary,
  topUp = 0,
  transfer = 0,
  stopWorkAge = 0,
  bonusByMonths = 0,
  salaryInflationPerYear = 0,
  birthYear,
}: ComputeCpfParams): ForecastLine[] => {
  const forecast: ForecastLine[] = [];
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth(); // Starts with 0
  let ageThisYear = currentYear - birthYear;
  let accruedInterest = zeroAccount();
  let currentSalary = salary;

  forecast.push({
    ...current,
    year: currentYear,
    month: currentMonth,
    age: ageThisYear,
    accruedInterest: zeroAccount(),
    creditedInterest: zeroAccount(),
    currentFrs: getFrs(currentYear),
    currentBhs: getBhs(currentYear),
    salary,
  });

  while (ageThisYear <= 55) {
    const lastBalance = forecast[forecast.length - 1];
    ageThisYear = currentYear - birthYear;

    const nextState = nextMonth({
      current: lastBalance,
      birthYear,
      year: currentYear,
      month: currentMonth,
      salary: currentSalary,
      accruedInterest,
      topUp,
      transfer,
      stopWorkAge,
      bonusByMonths,
      salaryInflationPerYear,
    });

    currentMonth = (currentMonth + 1) % 12;
    currentYear = currentMonth === 0 ? currentYear + 1 : currentYear;

    forecast.push({
      ...nextState.cpf,
      currentBhs: nextState.currentBhs,
      currentFrs: nextState.currentFrs,
      salary: nextState.salary,
      age: nextState.age,
      accruedInterest: nextState.accruedInterest,
      creditedInterest: currentMonth === 0 ? accruedInterest : zeroAccount(),
      year: currentYear,
      month: currentMonth,
    });

    accruedInterest = nextState.accruedInterest;
    currentSalary = nextState.salary;
  }
  return forecast;
};
