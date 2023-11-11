import React, { FunctionComponent, useState } from "react";
import MLR from "ml-regression-multivariate-linear";
import axios from "axios";
import { groupBy, minBy, maxBy, meanBy } from "lodash";

interface LastTransaction {
  postalCode: string;
  flatType: string;
  registrationDate: string;
  block: string;
  levelRange: string;
  price: number;
  floorArea: number;
  leaseCommencementDate: number;
  balanceTenureYear: number;
  balanceTenureMonth: number;
  modelDescription: string;
}

interface NearbyTransaction {
  street: string;
  block: string;
  levelRange: string;
  floorArea: number;
  modelDescription: string;
  leaseCommencementDate: number;
  balanceTenureYear: number;
  balanceTenureMonth: number;
  price: number;
  registrationDate: string;
  flatType: string;
}

interface RentalRate {
  month: string;
  year: number;
  flatType: string;
  rent: number;
}

interface ResaleData {
  postalCode: string;
  lastTransactions: LastTransaction[];
  nearbyTransactions: NearbyTransaction[];
  rentalRates: RentalRate[];
}

const estimateLevel = (range: string) => {
  const [first, second] = range.split(" to ");
  return (Number(first) + Number(second)) / 2;
};

const psmToPsf = (num: number) => num / 10.764;

const formatPrice = (num: number) => `$${Math.floor(num).toLocaleString()}`;

const InfoTooltip = ({ children }: { children: string | string[] }) => {
  const [show, setShow] = useState(false);
  const toggle = () => {
    setShow(!show);
  };
  return (
    <div className="d-inline">
      <i
        data-toggle="tooltip"
        data-placement="top"
        data-html="true"
        title={children}
        className="fas fa-info-circle"
        onClick={toggle}
      />
      {show && (
        <div>
          <small style={{ opacity: 0.8 }}> {children}</small>
        </div>
      )}
    </div>
  );
};

export const PastTransaction = ({ resaleData }: { resaleData: ResaleData }) => {
  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapsed = () => setCollapsed(!collapsed);
  const { lastTransactions } = resaleData;
  return (
    <div>
      <h3>
        Past Transactions
        <div
          className="d-inline small cursor-pointer"
          onClick={toggleCollapsed}
        >
          {collapsed ? " (show)" : " (hide)"}
        </div>
      </h3>
      {!collapsed && (
        <table className="table text-center w-full">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="py-2">Flat Type</th>
              <th className="py-2">Level</th>
              <th className="py-2">Floor Area (sqm)</th>
              <th className="py-2">Price</th>
              <th className="py-2">Transaction Date</th>
            </tr>
          </thead>
          <tbody>
            {lastTransactions.map((txn, key) => (
              <tr key={key}>
                <td>{txn.flatType}</td>
                <td>{txn.levelRange}</td>
                <td>{txn.floorArea}</td>
                <td>${txn.price.toLocaleString()}</td>
                <td>{txn.registrationDate}</td>
              </tr>
            ))}
            {(!lastTransactions || lastTransactions.length === 0) && (
              <tr>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export const NearbyPastTransactions = ({
  resaleData,
}: {
  resaleData: ResaleData;
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapsed = () => setCollapsed(!collapsed);

  const { nearbyTransactions } = resaleData;
  return (
    <div>
      <h3>
        Nearby Past Transactions
        <div
          className="d-inline small cursor-pointer"
          onClick={toggleCollapsed}
        >
          {collapsed ? " (show)" : " (hide)"}
        </div>
      </h3>
      {!collapsed && (
        <table className="table text-center w-full">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="py-2">Block</th>
              <th className="py-2">Flat Type</th>
              <th className="py-2">Level</th>
              <th className="py-2">Floor Area (sqm)</th>
              <th className="py-2">Lease</th>
              <th className="py-2">Price</th>
              <th className="py-2">Transaction Date</th>
            </tr>
          </thead>
          <tbody>
            {nearbyTransactions.map((txn, key) => (
              <tr key={key}>
                <td>{txn.block}</td>
                <td>
                  {txn.flatType} ({txn.modelDescription})
                </td>
                <td>{txn.levelRange}</td>
                <td>{txn.floorArea}</td>
                <td>{txn.leaseCommencementDate}</td>
                <td>${txn.price.toLocaleString()}</td>
                <td>{txn.registrationDate}</td>
              </tr>
            ))}
            {(!nearbyTransactions || nearbyTransactions.length === 0) && (
              <tr>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export const PastRentalRate = ({ resaleData }: { resaleData: ResaleData }) => {
  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapsed = () => setCollapsed(!collapsed);
  const { rentalRates } = resaleData;
  return (
    <div>
      <h3>
        Rental Rates
        <div
          className="d-inline small cursor-pointer"
          onClick={toggleCollapsed}
        >
          {collapsed ? " (show)" : " (hide)"}
        </div>
      </h3>
      {!collapsed ? (
        rentalRates.length > 0 ? (
          <table className="table text-center w-full">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="py-2">Flat Type</th>
                <th className="py-2">Agreement Date</th>
                <th className="py-2">Rent</th>
              </tr>
            </thead>
            <tbody>
              {rentalRates.map((txn, key) => (
                <tr key={key}>
                  <td>{txn.flatType}</td>
                  <td>
                    {txn.month} {txn.year}
                  </td>
                  <td>${txn.rent.toLocaleString()}</td>
                </tr>
              ))}
              {(!rentalRates || rentalRates.length === 0) && (
                <tr>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div>No rental data available</div>
        )
      ) : null}
    </div>
  );
};

const InputField = ({
  title,
  tooltip,
  rgb = "136, 132, 216",
  value,
  onChange,
  col = 6,
}: {
  title: string;
  tooltip?: string;
  rgb?: string;
  value: string;
  onChange: (value: string) => void;
  col?: string | number;
}) => {
  return (
    <div className={`col-md-${col} my-2 text-center`}>
      <div className="p-2" style={{ backgroundColor: `rgba(${rgb}, 0.5)` }}>
        <h5>
          {title} {tooltip && <InfoTooltip>{tooltip}</InfoTooltip>}
        </h5>
      </div>
      <div
        style={{ backgroundColor: `rgba(${rgb}, 0.3)` }}
        className="py-3 px-2"
      >
        <input
          className="no-outline-focus text-center w-full"
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            borderWidth: "0 0 2px 0",
            borderColor: "black",
            fontSize: "1.2em",
          }}
          onChange={(e) => onChange(e.target.value)}
          value={value}
        ></input>
      </div>
    </div>
  );
};

const ValueField = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className="col text-center">
      <div
        className="p-2"
        style={{ backgroundColor: "rgba(130, 202, 157, 0.9)" }}
      >
        <h5>{title}</h5>
      </div>
      <div
        className="p-3"
        style={{ backgroundColor: "rgba(130, 202, 157, 0.7)" }}
      >
        <h4>{value}</h4>
      </div>
    </div>
  );
};

const TwoVariateRegression = ({ resaleData }: { resaleData: ResaleData }) => {
  if (resaleData.lastTransactions.length === 0) return null;
  const { leaseCommencementDate } = resaleData.lastTransactions[0];
  const sampleFloorArea = resaleData.lastTransactions[0].floorArea;
  const eligibleTransactions = resaleData.nearbyTransactions.filter(
    (txn) => txn.leaseCommencementDate === leaseCommencementDate
  );
  const x = eligibleTransactions.map((txn) => [
    txn.floorArea,
    estimateLevel(txn.levelRange),
  ]);
  const y = eligibleTransactions.map((txn) => [txn.price]);
  const model = new MLR(x, y);
  const floorAreaCof = model.weights[0][0];
  const levelCof = model.weights[1][0];

  const [area, setArea] = useState(sampleFloorArea.toString());
  const [level, setLevel] = useState("1");
  const [estimate, setEstimate] = useState<undefined | number>(undefined);
  const [showInfo, setShowInfo] = useState(false);

  const toggleInfo = () => setShowInfo(!showInfo);

  const onEstimate = () => {
    const est = model.predict([Number(area), Number(level)])[0];
    setEstimate(est);
  };

  const onButtonClick = () => {
    if (estimate) {
      setEstimate(undefined);
    } else {
      onEstimate();
    }
  };

  return (
    <div>
      <h2>Estimate based on similar flats</h2>
      <p>
        This calculator provides an estimate based on information of nearby
        flats with the same lease commencement date.
      </p>
      <p>Simply enter the unit's level and unit size to get an estimate.</p>
      {!estimate && (
        <div className="grid grid-cols-2 gap-2">
          <InputField title="Level" value={level} onChange={setLevel} />
          <InputField title="Area (sqm)" value={area} onChange={setArea} />
        </div>
      )}
      {estimate && (
        <div className="row mt-2 mb-2">
          <ValueField
            title="Estimate"
            value={`$${Math.floor(estimate).toLocaleString()}`}
          />
        </div>
      )}
      <button
        className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold p-2 px-4 rounded w-full"
        onClick={onButtonClick}
      >
        {estimate ? "Try Again" : "Calculate"}
      </button>
      <div className="mt-2 cursor-pointer" onClick={toggleInfo}>
        <h6>{showInfo ? "Hide" : "Show"} More info</h6>
      </div>
      {showInfo && (
        <div>
          Based on the 2-variable linear regression model:
          <div>
            Every extra sqm cost extra{" "}
            <strong>${Math.floor(floorAreaCof).toLocaleString()}</strong>
          </div>
          <div>
            Every extra level cost extra{" "}
            <strong>${Math.floor(levelCof).toLocaleString()}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

const ThreeVariateRegression = ({ resaleData }: { resaleData: ResaleData }) => {
  const hasLastTransaction = resaleData.lastTransactions.length > 0;
  if (!hasLastTransaction && resaleData.nearbyTransactions.length === 0)
    return null;
  const sampleLeaseCommencementDate = hasLastTransaction
    ? resaleData.lastTransactions[0].leaseCommencementDate
    : resaleData.nearbyTransactions[0].leaseCommencementDate;
  const sampleFloorArea = hasLastTransaction
    ? resaleData.lastTransactions[0].floorArea
    : resaleData.nearbyTransactions[0].floorArea;
  const eligibleTransactions = resaleData.nearbyTransactions;
  const x = eligibleTransactions.map((txn) => [
    txn.floorArea,
    estimateLevel(txn.levelRange),
    txn.leaseCommencementDate,
  ]);
  const y = eligibleTransactions.map((txn) => [txn.price]);
  const model = new MLR(x, y);
  const floorAreaCof = model.weights[0][0];
  const levelCof = model.weights[1][0];
  const leaseCof = model.weights[2][0];

  const [area, setArea] = useState(sampleFloorArea.toString());
  const [level, setLevel] = useState("1");
  const [leaseCommencement, setLeaseCommencement] = useState(
    sampleLeaseCommencementDate.toString()
  );
  const [estimate, setEstimate] = useState<undefined | number>(undefined);
  const [showInfo, setShowInfo] = useState(false);

  const toggleInfo = () => setShowInfo(!showInfo);

  const onEstimate = () => {
    const est = model.predict([
      Number(area),
      Number(level),
      Number(leaseCommencement),
    ])[0];
    setEstimate(est);
  };

  const onButtonClick = () => {
    if (estimate) {
      setEstimate(undefined);
    } else {
      onEstimate();
    }
  };
  return (
    <div>
      <h2>Estimate based on all nearby flats</h2>

      <p>
        This calculator provides an estimate based on information of all nearby
        flats. This assumes a linear depreciation of the units around the area.
      </p>
      <p>
        Simply enter the unit's level, unit size &amp; lease commencement date
        to get an estimate.
      </p>
      {!estimate && (
        <div className="grid grid-cols-3 gap-2">
          <InputField title="Level" value={level} onChange={setLevel} col="4" />
          <InputField
            title="Area (sqm)"
            value={area}
            onChange={setArea}
            col="4"
          />
          <InputField
            title="Lease Commencement"
            value={leaseCommencement}
            onChange={setLeaseCommencement}
            col="4"
          />
        </div>
      )}
      {estimate && (
        <div className="row mt-2 mb-2">
          <ValueField
            title="Estimate"
            value={`$${Math.floor(estimate).toLocaleString()}`}
          />
        </div>
      )}
      <button
        className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold p-2 px-4 rounded w-full"
        onClick={onButtonClick}
      >
        {estimate ? "Try Again" : "Calculate"}
      </button>
      <div className="mt-2 cursor-pointer" onClick={toggleInfo}>
        <h6>{showInfo ? "Hide" : "Show"} More info</h6>
      </div>
      {showInfo && (
        <div>
          Based on the 3-variable linear regression model:
          <div>
            Every extra sqm cost extra{" "}
            <strong>${Math.floor(floorAreaCof).toLocaleString()}</strong>
          </div>
          <div>
            Every extra level cost extra{" "}
            <strong>${Math.floor(levelCof).toLocaleString()}</strong>
          </div>
          <div>
            Every year of lease cost extra{" "}
            <strong>${Math.floor(leaseCof).toLocaleString()}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

const Summary = ({ resaleData }: { resaleData: ResaleData }) => {
  if (!resaleData.lastTransactions[0]) return null;
  const now = new Date();
  const remainingLease =
    99 -
    (now.getFullYear() - resaleData.lastTransactions[0].leaseCommencementDate);
  const averageNearbyPsm =
    resaleData.nearbyTransactions
      .map((txn) => txn.price / txn.floorArea)
      .reduce((prev, curr) => prev + curr) /
    resaleData.nearbyTransactions.length;
  const averagePsm =
    resaleData.lastTransactions
      .map((txn) => txn.price / txn.floorArea)
      .reduce((prev, curr) => prev + curr) / resaleData.lastTransactions.length;
  const groupedLastTransactions = groupBy(
    resaleData.lastTransactions,
    "flatType"
  );
  const groupedRentalRates = groupBy(resaleData.rentalRates, "flatType");
  const flatTypes = Object.keys(groupedLastTransactions);
  return (
    <div className="mt-2">
      <h2>Summary</h2>
      <div className="grid grid-cols-3 mb-6 gap-2">
        <ValueField title="Remaining Lease" value={remainingLease.toFixed()} />
        <ValueField
          title="Average PSF"
          value={`$${Math.floor(psmToPsf(averagePsm)).toLocaleString()}`}
        />
        <ValueField
          title="Average PSF (nearby)"
          value={`$${Math.floor(psmToPsf(averageNearbyPsm)).toLocaleString()}`}
        />
      </div>
      <table className="table text-center w-full">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="py-2">Flat Type</th>
            <th className="py-2">Floor Area (sqm)</th>
            <th className="py-2">Avg. Price</th>
            <th className="py-2">Avg. Rental</th>
            <th className="py-2">Avg. Rental Yield</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {flatTypes.map((type, key) => {
            const lastTransactions = groupedLastTransactions[type];
            const hasTransactions = !!lastTransactions;
            if (!hasTransactions) return null;
            const rentalRates = groupedRentalRates[type];
            const hasRentalData = lastTransactions && rentalRates;
            const min = minBy(lastTransactions, "floorArea");
            const max = maxBy(lastTransactions, "floorArea");
            if (!min || !max) return null;
            const minFloorArea = min.floorArea;
            const maxFloorArea = max.floorArea;
            const avgPrice = meanBy(lastTransactions, "price");
            const avgRental = meanBy(rentalRates, "rent");
            const avgYield = (avgRental * 12 * 100) / avgPrice;

            const floorAreaRange =
              minFloorArea === maxFloorArea
                ? maxFloorArea
                : `${minFloorArea} - ${maxFloorArea}`;
            const price = lastTransactions ? formatPrice(avgPrice) : "NA";
            return (
              <tr key={key}>
                <td>{type}</td>
                <td>{floorAreaRange}</td>
                <td>{price}</td>
                <td>{hasRentalData ? formatPrice(avgRental) : "NA"}</td>
                <td>{hasRentalData ? `${avgYield.toFixed(2)}%` : "NA"}</td>
                <td>
                  <InfoTooltip>
                    Based on {lastTransactions.length.toString()} transactions
                    &amp; {(hasRentalData ? rentalRates.length : 0).toFixed()}{" "}
                    rental data{" "}
                  </InfoTooltip>
                </td>
              </tr>
            );
          })}
          {(!flatTypes || flatTypes.length === 0) && (
            <tr>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export const Disclaimer = () => {
  return (
    <div>
      <h5>Disclaimer</h5>
      <small>
        The calculator serves as a guide for general reference. If you require a
        certified appraisal for any property sale or mortgage, please order a
        full inspection and valuation report.
      </small>
    </div>
  );
};

export const CalculatorContent = ({
  resaleData,
}: {
  resaleData: ResaleData;
}) => {
  if (
    resaleData.lastTransactions.length === 0 &&
    resaleData.nearbyTransactions.length === 0
  )
    return (
      <div>
        <div className="pt-4">
          <p>Sorry! We are unable to find any data for this postal code.</p>
          <p>Please try again with another postal code.</p>
        </div>
      </div>
    );
  return (
    <div>
      <Summary resaleData={resaleData} />
      <TwoVariateRegression resaleData={resaleData} />
      <ThreeVariateRegression resaleData={resaleData} />
      <hr />
      <PastTransaction resaleData={resaleData} />
      <NearbyPastTransactions resaleData={resaleData} />
      <PastRentalRate resaleData={resaleData} />
      <hr />
      <Disclaimer />
    </div>
  );
};

export const HdbResaleCalculator: FunctionComponent<{ location: Location }> = ({
  location,
}) => {
  const urlParams = new URLSearchParams(location.search);
  const reference = urlParams.get("r");

  const [postalCode, setPostalCode] = useState("");
  const [pendingData, setPendingData] = useState(false);
  const [resaleData, setResaleData] = useState<undefined | ResaleData>(
    undefined
  );

  const fetchData = async () => {
    if (postalCode.length != 6 || isNaN(Number(postalCode)))
      return alert("Postal code is invalid");
    if (pendingData) return;
    setResaleData(undefined);
    setPendingData(true);
    const { data } = await axios.get(
      `https://api.geek.sg/getResaleInfo/${postalCode}?r=${reference}`
    );
    setResaleData(data);
    setPendingData(false);
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchData();
        }}
      >
        <div className="row">
          <InputField
            title="Postal Code"
            value={postalCode}
            onChange={setPostalCode}
            col={12}
          />
        </div>
        <button
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold p-2 px-4 rounded w-full"
          onClick={fetchData}
        >
          Fetch Data
        </button>
      </form>
      {resaleData && <CalculatorContent resaleData={resaleData} />}
    </div>
  );
};