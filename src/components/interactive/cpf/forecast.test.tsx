// Interest rate calculation
// https://www.cpf.gov.sg/member/growing-your-savings/earning-higher-returns/earning-attractive-interest
// OA - 2.5% (using floor)
// SA & MA - 4% (using floor)
// RA - 4%

// Interest calculated monthly, compounded annually
// https://www.cpf.gov.sg/member/faq/growing-your-savings/cpf-interest-rates/how-is-my-cpf-interest-computed-and-credited-into-my-accounts

// Extra interest on first $60k
// https://www.cpf.gov.sg/member/faq/growing-your-savings/cpf-interest-rates/how-much-extra-interest-can-i-earn-on-my-cpf-savings
// Your accounts are used to compute your combined CPF balances in the following order:
// - 1st: Retirement Account (RA), including any CPF LIFE premium balance
// - 2nd: OA, with a cap of $20,000*
// - 3rd: Special Account (SA)
// - 4th: MediSave Account (MA)

// CPF Contribution Rate
// https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPF%20allocation%20rates%20from%201%20January%202023.pdf

// CPF Annual Ceiling
// https://www.cpf.gov.sg/employer/faq/employer-obligations/what-payments-attract-cpf-contributions/what-are-the-changes-to-the-cpf-salary-ceilings-from-1-sep-2023
// The CPF Annual limit will also remain at $37,740.

// CPF Monthly salary ceiling
// https://www.cpf.gov.sg/member/infohub/news/media-news/budget-2023-cpf-monthly-salary-ceiling-to-be-raised-to-8000-by-2026
// Current - 6k
// Sep 2023 - 6.3k
// Jan 2024 - 6.8k
// Jan 2025 - 7.4k
// Jan 2026 - 8k

// Basic Health Sum (BHS) ie Max limit on MA
// https://www.cpf.gov.sg/member/faq/healthcare-financing/basic-healthcare-sum/what-is-the-basic-healthcare-sum-when-i-turn-65-years-old
// Any contributions beyond the BHS will be transferred to SA/RA

// Retirement sums
// https://www.cpf.gov.sg/member/faq/retirement-income/general-information-on-retirement/what-are-the-retirement-sums-applicable-to-me-

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

it("works", () => {
  console.log("hi");
});

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
  ytdContributions: Account;
  ytdAccruedInterest: Account;
  housingOaBalance: number;
  housingDeductions: number;
  housingYtdOaAccruedInterest: number;
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
  const salary = currentSalary;

  // Assumes bonus is credited in December only
  const bonus = date.month === 12 ? annualBonusInMonths * salary : 0;

  // Assumes cash top up and OA to SA transfer is done in January only
  const saCashTopUp = date.month === 1 ? annualCashTopUp : 0;
  const oaToSaTransfer = date.month === 1 ? annualOaToSaTransfer : 0;

  // TODO - calculate accrued interest assuming equal monthly contributions
  const ytdContributions = { oa: 0, sa: 0, ma: 0 };
  const ytdAccruedInterest = { oa: 0, sa: 0, ma: 0 };

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
    housingOaBalance,
    housingDeductions,
    housingYtdOaAccruedInterest,
  };
};

describe("generateInitialStatement", () => {
  it("should generate the initial state correctly for months greater than current month", () => {
    const input = {
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
    };
    expect(generateInitialStatement(input)).toMatchInlineSnapshot(`
      Object {
        "age": Object {
          "month": 10,
          "year": 32,
        },
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
        "housingDeductions": 500,
        "housingOaBalance": 50000,
        "housingYtdOaAccruedInterest": 0,
        "oaToSaTransfer": 0,
        "saCashTopUp": 0,
        "salary": 10000,
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
    const input = {
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
    };
    expect(generateInitialStatement(input)).toMatchInlineSnapshot(`
      Object {
        "age": Object {
          "month": 2,
          "year": 33,
        },
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
        "housingDeductions": 500,
        "housingOaBalance": 50000,
        "housingYtdOaAccruedInterest": 0,
        "oaToSaTransfer": 0,
        "saCashTopUp": 0,
        "salary": 10000,
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
