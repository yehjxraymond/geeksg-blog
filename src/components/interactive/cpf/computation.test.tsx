import {
  nextMonth,
  getBhs,
  getFrs,
  zeroAccount,
  overflowFromBhs,
} from "./computation";

describe("overflowFromBhs", () => {
  it("should return input if MA is less than BHS", () => {
    const cpf = {
      oa: 10000,
      sa: 10000,
      ma: 10000,
      ra: 0,
    };
    expect(overflowFromBhs(cpf, 2020)).toEqual(cpf);
  });

  it("should return input if MA is less than BHS", () => {
    const cpf = {
      oa: 10000,
      sa: 10000,
      ma: 65000,
      ra: 0,
    };
    expect(overflowFromBhs(cpf, 2020)).toEqual({
      oa: 10000,
      sa: 15000,
      ma: 60000,
      ra: 0,
    });
  });
});

describe("getBhs", () => {
  it("should be correct for years defined", () => {
    expect(getBhs(2020)).toBe(60000);
    expect(getBhs(2019)).toBe(57200);
    expect(getBhs(2018)).toBe(54500);
    expect(getBhs(2017)).toBe(52000);
    expect(getBhs(2016)).toBe(49800);
    expect(getBhs(2015)).toBe(49800);
  });

  it("should inflate at 4.95% each year for years not defined", () => {
    expect(getBhs(2021)).toBe(60000 * 1.0495);
    expect(getBhs(2022)).toBe(60000 * 1.0495 * 1.0495);
  });
});

describe("getFrs", () => {
  it("should be correct for years defined", () => {
    expect(getFrs(2022)).toBe(192000);
  });

  it("should be correct for estimates", () => {
    expect(getFrs(2023)).toBe(197760);
    expect(getFrs(2024)).toBe(203692.8);
  });
});

describe("nextMonth", () => {
  describe("salary inflation", () => {
    it("increases salary in Jan", () => {
      const { salary } = nextMonth({
        current: zeroAccount(),
        birthYear: 1990,
        year: 1990,
        month: 11,
        salary: 1000,
        accruedInterest: zeroAccount(),
        stopWorkAge: 40,
        topUp: 0,
        transfer: 0,
        bonusByMonths: 0,
        salaryInflationPerYear: 3,
      });
      expect(salary).toBe(1030);
    });

    it("does not increases salary in other months", () => {
      const { salary } = nextMonth({
        current: zeroAccount(),
        birthYear: 1990,
        year: 1990,
        month: 0,
        salary: 1000,
        accruedInterest: zeroAccount(),
        stopWorkAge: 40,
        topUp: 0,
        transfer: 0,
        bonusByMonths: 0,
        salaryInflationPerYear: 3,
      });
      expect(salary).toBe(1000);
    });
  });
});

/*
References

Calculation
- Current balance
- Contribution (from salary)
- Contribution (volunteer top-up or transfer)
- Interest

*RA is created at age 55, savings up to FRS is transferred. May opt in to ERS

Base interest
OA - 2.5%
SA - 4%
MA - 4%
RA - 4%

Additional interest (60k) - 1%
RA
OA - up to $20k
SA
MA

Additional interest (30k) - 1%




https://www.ifa.sg/cpf-interest/
*/
