import {
  UserInputs,
  generateInitialStatement,
  getBhs,
  Statement,
  getFrs,
  generateNextStatement,
  getSalaryCeiling,
  contributionsFromSalaryOrBonus,
  monthlyBaseInterest,
  monthlyExtraInterest,
  generateForecast,
} from "./forecast";

describe("generateInitialStatement", () => {
  it("should generate the initial state correctly for months greater than current month", () => {
    const input: UserInputs = {
      now: new Date("2023-06-18"),
      birthYear: 1990,
      birthMonth: 8,
      currentSalary: 10000,
      annualSalaryIncrementPct: 0,
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
      annualSalaryIncrementPct: 0,
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
      annualSalaryIncrementPct: 0,
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

describe("generateForecast", () => {
  it("works", () => {
    const forecast = generateForecast({
      now: new Date("2023-06-01"),
      birthYear: 1990,
      birthMonth: 6,
      currentSalary: 5000,
      annualSalaryIncrementPct: 0,
      annualBonusInMonths: 1,
      annualCashTopUp: 0,
      annualOaToSaTransfer: 0,
      currentBalances: { oa: 10000, sa: 10000, ma: 10000 },
      housingOaBalance: 10000,
      housingDeductions: 200,
      ageToStopWorking: { year: 50, month: 0 },
      timeForLastMortgagePayment: { year: 2045, month: 9 },
    });
    expect(forecast).toMatchSnapshot();
  });
});
