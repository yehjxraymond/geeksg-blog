import React, { useState, FunctionComponent } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { computeCpf, ForecastLine } from "./computation";
import { InfoIcon } from "./icons";

interface ReprocessedLineItem extends ForecastLine {
  total: number;
}

interface ComputedResults {
  computedResult?: ReprocessedLineItem[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatNumber: any = (num: number) =>
  isNaN(num) ? "NA" : num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); // eslint-disable-line no-restricted-globals

const InfoTooltip: FunctionComponent = ({ children }) => {
  const [show, setShow] = useState(false);
  const toggle = () => {
    setShow(!show);
  };
  return (
    <div className="inline">
      <div className="inline-block" onClick={toggle}>
        <InfoIcon />
      </div>
      {show && (
        <div>
          <small style={{ opacity: 0.8 }}> {children}</small>
        </div>
      )}
    </div>
  );
};

const CpfForecastChart = ({ computedResult }: ComputedResults) => {
  if (!computedResult) return null;
  return (
    <>
      <div className="row my-4">
        <div className="col text-center">
          <h3>CPF Balance Forecast:</h3>
        </div>
      </div>
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <AreaChart
            data={computedResult}
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: 40,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" />
            <YAxis />
            <Tooltip formatter={formatNumber} />
            <Area
              name="Ordinary"
              type="monotone"
              dataKey="oa"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
            />
            <Area
              name="Special"
              type="monotone"
              dataKey="sa"
              stackId="1"
              stroke="#82ca9d"
              fill="#82ca9d"
            />
            <Area
              name="Medical"
              type="monotone"
              dataKey="ma"
              stackId="1"
              stroke="#ffc658"
              fill="#ffc658"
            />
            <Area
              name="Total"
              type="monotone"
              dataKey="total"
              stackId="2"
              strokeOpacity={0}
              fillOpacity={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

const CpfSummary = ({ computedResult }: ComputedResults) => {
  if (!computedResult) return null;
  const finalAmount = computedResult[computedResult.length - 1];
  return (
    <>
      <div className="my-4 text-center">
        <h3>Balances at age 55:</h3>
      </div>
      <div className="md:flex text-center">
        <div className="md:w-1/4 p-2">
          <div
            className="p-2"
            style={{ backgroundColor: "rgba(136, 132, 216, 0.9)" }}
          >
            <h5>OA</h5>
          </div>
          <div
            className="p-3"
            style={{ backgroundColor: "rgba(136, 132, 216, 0.7)" }}
          >
            <div className="text-4xl p-2 m-2">
              {formatNumber(finalAmount.oa)}
            </div>
          </div>
        </div>
        <div className="md:w-1/4 p-2">
          <div
            className="p-2"
            style={{ backgroundColor: "rgba(130, 202, 157, 0.9)" }}
          >
            <h5>SA</h5>
          </div>
          <div
            className="p-3"
            style={{ backgroundColor: "rgba(130, 202, 157, 0.7)" }}
          >
            <div className="text-4xl p-2 m-2">
              {formatNumber(finalAmount.sa)}
            </div>
          </div>
        </div>
        <div className="md:w-1/4 p-2">
          <div
            className="p-2"
            style={{ backgroundColor: "rgba(255, 198, 88, 0.9)" }}
          >
            <h5>MA</h5>
          </div>
          <div
            className="p-3"
            style={{ backgroundColor: "rgba(255, 198, 88, 0.7)" }}
          >
            <div className="text-4xl p-2 m-2">
              {formatNumber(finalAmount.ma)}
            </div>
          </div>
        </div>
        <div className="md:w-1/4 p-2">
          <div
            className="p-2"
            style={{ backgroundColor: "rgba(52, 73, 94, 0.5)" }}
          >
            <h5>Total</h5>
          </div>
          <div
            className="p-3"
            style={{ backgroundColor: "rgba(52, 73, 94, 0.3)" }}
          >
            <div className="text-4xl p-2 m-2">
              {formatNumber(finalAmount.total)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const frsColor = (sum: number, frs: number): string => {
  switch (true) {
    case sum >= 1.5 * frs:
      return "rgba(130, 202, 157, 0.9)";
    case sum >= frs:
      return "rgba(130, 202, 157, 0.5)";
    case sum >= 0.5 * frs:
      return "rgba(130, 202, 157, 0.3)";
    default:
      return "rgba(130, 202, 157, 0)";
  }
};

export const CpfTable: FunctionComponent<ComputedResults> = ({
  computedResult,
}) => {
  if (!computedResult) return null;
  const brsAge = computedResult.find(
    (val) => val.oa + val.sa >= val.currentFrs * 0.5
  );
  const frsAge = computedResult.find(
    (val) => val.oa + val.sa >= val.currentFrs
  );
  const ersAge = computedResult.find(
    (val) => val.oa + val.sa >= val.currentFrs * 1.5
  );
  return (
    <>
      <div className="my-4 text-center">
        <h3>Key OA + SA Milestones:</h3>
      </div>
      <div className="md:flex text-center">
        <div className="md:w-1/3 p-2">
          <div
            className="p-2"
            style={{ backgroundColor: "rgba(130, 202, 157, 0.4)" }}
          >
            <h5>
              Age Achieving BRS{" "}
              <InfoTooltip>
                Based on estimated 0.5 * FRS inflated at 3% per year.
              </InfoTooltip>
            </h5>
          </div>
          <div
            className="p-3"
            style={{ backgroundColor: "rgba(130, 202, 157, 0.3)" }}
          >
            <div className="text-4xl p-2 m-2">
              {brsAge ? brsAge.age : "Not Achieved Before 55"}
            </div>
          </div>
        </div>
        <div className="md:w-1/3 p-2">
          <div
            className="p-2"
            style={{ backgroundColor: "rgba(130, 202, 157, 0.6)" }}
          >
            <h5>
              Age Achieving FRS{" "}
              <InfoTooltip>
                Based on estimated FRS inflated at 3% per year.
              </InfoTooltip>
            </h5>
          </div>
          <div
            className="p-3"
            style={{ backgroundColor: "rgba(130, 202, 157, 0.5)" }}
          >
            <div className="text-4xl p-2 m-2">
              {frsAge ? frsAge.age : "Not Achieved Before 55"}
            </div>
          </div>
        </div>
        <div className="md:w-1/3 p-2">
          <div
            className="p-2"
            style={{ backgroundColor: "rgba(130, 202, 157, 1)" }}
          >
            <h5>
              Age Achieving ERS{" "}
              <InfoTooltip>
                Based on estimated 1.5 * FRS inflated at 3% per year.
              </InfoTooltip>
            </h5>
          </div>
          <div
            className="p-3"
            style={{ backgroundColor: "rgba(130, 202, 157, 0.9)" }}
          >
            <div className="text-4xl p-2 m-2">
              {ersAge ? ersAge.age : "Not Achieved Before 55"}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="my-4 text-center">
          <h3>Balances At Year Ends:</h3>
        </div>
        <div className="md:hidden block">
          Yearly balances are hidden in mobile view, to view the table of the
          balance for each year, please view this page on the desktop.
        </div>
        <table className="hidden md:table text-center w-full">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-2">Age</th>
              <th className="p-2">Salary</th>
              <th className="p-2">OA</th>
              <th className="p-2">SA</th>
              <th className="p-2">MA</th>
              <th className="p-2">Total</th>
              <th className="p-2">
                Interest{" "}
                <InfoTooltip>
                  Interest is credited in Jan for the balance for the previous
                  year. Value is shown to showcase the effect of compounding
                  interest rates on the balances.
                </InfoTooltip>
              </th>
              <th className="p-2">
                FRS{" "}
                <InfoTooltip>
                  Estimated based on 3% increment per year
                </InfoTooltip>
              </th>
              <th className="p-2">
                BHS{" "}
                <InfoTooltip>
                  Estimated based on 4.95% increment per year
                </InfoTooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {computedResult.map((cpf, index) => (
              <tr
                key={index}
                className="leading-3"
                style={{
                  backgroundColor: frsColor(cpf.oa + cpf.sa, cpf.currentFrs),
                }}
              >
                <td>{cpf.age}</td>
                <td>{formatNumber(cpf.salary)}</td>
                <td>{formatNumber(cpf.oa)}</td>
                <td>{formatNumber(cpf.sa)}</td>
                <td>{formatNumber(cpf.ma)}</td>
                <td>{formatNumber(cpf.total)}</td>
                <td>
                  {formatNumber(
                    computedResult[index].creditedInterest.oa +
                      computedResult[index].creditedInterest.sa +
                      computedResult[index].creditedInterest.ma
                  )}
                </td>
                <td>{formatNumber(cpf.currentFrs)}</td>
                <td>{formatNumber(cpf.currentBhs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="hidden md:block text-sm mt-2">
          * The BRS/FRS/ERS is considered to be achieved when the monies in OA +
          SA exceeds the target value.
        </div>
      </div>
    </>
  );
};

export const Disclaimer: FunctionComponent<{
  show: boolean;
  toggle: () => void;
}> = ({ show, toggle }) => {
  return (
    <>
      <h6 className="mt-4">
        Calculator Disclaimers{" "}
        <div className="inline text-gray-600 cursor-pointer" onClick={toggle}>
          ({show ? "hide" : "show"})
        </div>
      </h6>
      {show && (
        <div>
          <p>
            This CPF calculator is not endorsed by CPF or any other entities and
            is created only for educational and financial planning purposes.
          </p>
          <p>
            The product is not intended as financial advice or as an offer or
            recommendation of securities or other financial products.
          </p>
          <p>
            While attempts has been made to reflect the forecast correctly
            according to the parameters the calculator may fail to forecast the
            actual amount accurately for multiple reasons.
          </p>
          <p>In addition, there are few assumptions made:</p>
          <ul>
            <li>CPF SA top up and transfers are made only in January.</li>
            <li>Bonus for the year is credited only in December.</li>
            <li>CPF FRS will inflate at a constant rate of 3% per year.</li>
            <li>CPF BHS will inflate at a constant rate of 4.95% per year.</li>
          </ul>
          <p>Finally, there are few known limitations to the product:</p>
          <ul>
            <li>
              Simplified calculation of age by using birth year instead of full
              birth date
            </li>
            <li>Missing accrued interest for months prior to current month</li>
          </ul>
          <p>
            If you noticed any inaccuracies or errors, please{" "}
            <a href="/contact">contact me</a>.
          </p>
        </div>
      )}
    </>
  );
};

export const CpfCalculator: FunctionComponent = () => {
  const [birthYear, setBirthYear] = useState("1990");
  const [stopWorkAge, setStopWorkAge] = useState("55");
  const [salary, setSalary] = useState("3000");
  const [oa, setOa] = useState("23000");
  const [sa, setSa] = useState("6000");
  const [ma, setMa] = useState("8000");
  const [salaryInflationPerYear, setSalaryInflationPerYear] = useState("2.5");
  const [bonusByMonths, setBonusByMonths] = useState("1");
  const [showAdvanceSettings, setShowAdvanceSettings] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const [topUp, setTopUp] = useState("0");
  const [transfer, setTransfer] = useState("0");

  const [computedResult, setComputedResult] = useState<ReprocessedLineItem[]>();

  const toggleAdvancesSettings = () =>
    setShowAdvanceSettings(!showAdvanceSettings);
  const toggleShowDisclaimer = () => {
    setShowDisclaimer(!showDisclaimer);
  };

  const calculate = () => {
    const result = computeCpf({
      current: {
        oa: Number(oa),
        ma: Number(ma),
        sa: Number(sa),
        ra: 0,
      },
      salary: Number(salary),
      stopWorkAge: Number(stopWorkAge),
      birthYear: Number(birthYear),
      topUp: Number(topUp),
      transfer: Number(transfer),
      bonusByMonths: Number(bonusByMonths),
      salaryInflationPerYear: Number(salaryInflationPerYear),
    })
      .filter((item) => item.month === 0)
      .map((cpf) => ({ ...cpf, total: cpf.oa + cpf.ma + cpf.ra + cpf.sa }));
    setComputedResult(result);
  };

  return (
    <div className="my-4 prose-2xl">
      <h3>Basic Information</h3>
      <div className="md:flex text-center">
        <div className="md:w-1/3 p-2">
          <div
            className="p-2"
            style={{ backgroundColor: "rgba(52, 73, 94, 0.5)" }}
          >
            <h5>
              Year of Birth <InfoTooltip>For calculating age</InfoTooltip>
            </h5>
          </div>
          <div
            style={{ backgroundColor: "rgba(52, 73, 94, 0.3)" }}
            className="py-3"
          >
            <input
              className="no-outline-focus text-center w-40"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderWidth: "0 0 2px 0",
                borderColor: "black",
                fontSize: "1.2em",
              }}
              onChange={(e) => setBirthYear(e.target.value)}
              value={birthYear}
            ></input>
          </div>
        </div>
        <div className="md:w-1/3 p-2">
          <div
            className="p-2"
            style={{ backgroundColor: "rgba(52, 73, 94, 0.5)" }}
          >
            <h5>
              Current Salary{" "}
              <InfoTooltip>Gross wage without bonuses.</InfoTooltip>
            </h5>
          </div>
          <div
            style={{ backgroundColor: "rgba(52, 73, 94, 0.3)" }}
            className="py-3"
          >
            <input
              className="no-outline-focus text-center w-40"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderWidth: "0 0 2px 0",
                borderColor: "black",
                fontSize: "1.2em",
              }}
              onChange={(e) => setSalary(e.target.value)}
              value={salary}
            ></input>
          </div>
        </div>
        <div className="md:w-1/3 p-2">
          <div
            className="p-2"
            style={{ backgroundColor: "rgba(52, 73, 94, 0.5)" }}
          >
            <h5>
              Intended Retirement Age{" "}
              <InfoTooltip>
                At this age, you will be having no salary contribution.
              </InfoTooltip>
            </h5>
          </div>
          <div
            style={{ backgroundColor: "rgba(52, 73, 94, 0.3)" }}
            className="py-3"
          >
            <input
              className="no-outline-focus text-center w-40"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderWidth: "0 0 2px 0",
                borderColor: "black",
                fontSize: "1.2em",
              }}
              onChange={(e) => setStopWorkAge(e.target.value)}
              value={stopWorkAge}
            ></input>
          </div>
        </div>
      </div>
      <div className="md:flex text-center">
        <div className="md:w-1/3 p-2">
          <div
            className="p-2"
            style={{ backgroundColor: "rgba(136, 132, 216, 0.9)" }}
          >
            <h5>Current OA Balance</h5>
          </div>
          <div
            style={{ backgroundColor: "rgba(136, 132, 216, 0.7)" }}
            className="py-3"
          >
            <input
              className="no-outline-focus text-center w-40"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderWidth: "0 0 2px 0",
                borderColor: "black",
                fontSize: "1.2em",
              }}
              onChange={(e) => setOa(e.target.value)}
              value={oa}
            ></input>
          </div>
        </div>
        <div className="md:w-1/3 p-2">
          <div
            className="p-2"
            style={{ backgroundColor: "rgba(130, 202, 157, 0.9)" }}
          >
            <h5>Current SA Balance</h5>
          </div>
          <div
            style={{ backgroundColor: "rgba(130, 202, 157, 0.7)" }}
            className="py-3"
          >
            <input
              className="no-outline-focus text-center w-40"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderWidth: "0 0 2px 0",
                borderColor: "black",
                fontSize: "1.2em",
              }}
              onChange={(e) => setSa(e.target.value)}
              value={sa}
            ></input>
          </div>
        </div>
        <div className="md:w-1/3 p-2">
          <div
            className="p-2"
            style={{ backgroundColor: "rgba(255, 198, 88, 0.9)" }}
          >
            <h5>Current MA Balance</h5>
          </div>
          <div
            style={{ backgroundColor: "rgba(255, 198, 88, 0.7)" }}
            className="py-3"
          >
            <input
              className="no-outline-focus text-center w-40"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderWidth: "0 0 2px 0",
                borderColor: "black",
                fontSize: "1.2em",
              }}
              onChange={(e) => setMa(e.target.value)}
              value={ma}
            ></input>
          </div>
        </div>
      </div>

      <h3 className="mt-4">
        Additional Information{" "}
        <div
          onClick={toggleAdvancesSettings}
          className="inline text-gray-600 cursor-gray-600-pointer"
        >
          ({showAdvanceSettings ? "hide" : "show"})
        </div>
      </h3>

      {showAdvanceSettings && (
        <>
          <div className="md:flex text-center">
            <div className="md:w-1/3 p-2">
              <div
                className="p-2"
                style={{ backgroundColor: "rgba(52, 73, 94, 0.5)" }}
              >
                <h5>
                  Bonus (months){" "}
                  <InfoTooltip>
                    Bonus will be credited in December. Generally includes
                    performance, 13th month and corporate bonus.
                  </InfoTooltip>
                </h5>
              </div>
              <div
                style={{ backgroundColor: "rgba(52, 73, 94, 0.3)" }}
                className="py-3"
              >
                <input
                  className="no-outline-focus text-center w-40"
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    fontSize: "1.2em",
                  }}
                  onChange={(e) => setBonusByMonths(e.target.value)}
                  value={bonusByMonths}
                ></input>
              </div>
            </div>
            <div className="md:w-1/3 p-2">
              <div
                className="p-2"
                style={{ backgroundColor: "rgba(52, 73, 94, 0.5)" }}
              >
                <h5>
                  Annual Salary Increment (%){" "}
                  <InfoTooltip>
                    Estimated salary increment. Salary will be incremented in
                    January each year.
                  </InfoTooltip>
                </h5>
              </div>
              <div
                style={{ backgroundColor: "rgba(52, 73, 94, 0.3)" }}
                className="py-3"
              >
                <input
                  className="no-outline-focus text-center w-40"
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    fontSize: "1.2em",
                  }}
                  onChange={(e) => setSalaryInflationPerYear(e.target.value)}
                  value={salaryInflationPerYear}
                ></input>
              </div>
            </div>
            <div className="md:w-1/3 p-2">
              <div
                className="p-2"
                style={{ backgroundColor: "rgba(52, 73, 94, 0.5)" }}
              >
                <h5>
                  SA Cash Top Up{" "}
                  <InfoTooltip>
                    CPF top up to SA account is assumed to be performed in
                    January each year
                  </InfoTooltip>
                </h5>
              </div>
              <div
                style={{ backgroundColor: "rgba(52, 73, 94, 0.3)" }}
                className="py-3"
              >
                <input
                  className="no-outline-focus text-center w-40"
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    fontSize: "1.2em",
                  }}
                  onChange={(e) => setTopUp(e.target.value)}
                  value={topUp}
                ></input>
              </div>
            </div>
          </div>
          <div className="md:flex text-center">
            <div className="md:w-1/3 p-2">
              <div
                className="p-2"
                style={{ backgroundColor: "rgba(52, 73, 94, 0.5)" }}
              >
                <h5>
                  OA to SA Transfer{" "}
                  <InfoTooltip>
                    Transfer from CPF OA to SA account is assumed to be
                    performed in January each year
                  </InfoTooltip>
                </h5>
              </div>
              <div
                style={{ backgroundColor: "rgba(52, 73, 94, 0.3)" }}
                className="py-3"
              >
                <input
                  className="no-outline-focus text-center w-40"
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    fontSize: "1.2em",
                  }}
                  onChange={(e) => setTransfer(e.target.value)}
                  value={transfer}
                ></input>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-4 p-2">
        <button
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold p-2 px-4 rounded w-full"
          onClick={calculate}
        >
          Calculate
        </button>
      </div>

      <CpfSummary computedResult={computedResult} />
      <CpfForecastChart computedResult={computedResult} />
      <CpfTable computedResult={computedResult} />

      {computedResult && (
        <Disclaimer show={showDisclaimer} toggle={toggleShowDisclaimer} />
      )}

      <hr />
    </div>
  );
};
