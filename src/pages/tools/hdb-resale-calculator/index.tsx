import React, { FunctionComponent } from "react";
import { HdbResaleCalculator } from "../../../components/interactive/resale";
import { Layout } from "../../../components/layout";
import { SEO } from "../../../components/seo";

export const ResaleCalculator: FunctionComponent = () => {
  return (
    <>
      <SEO
        title="HDB Resale Price Calculator"
        description="The HDB Resale Price Calculator offers an accurate and
        instantaneous insight into the value of your property"
        image="/images/cpf-forecast-calculator.png"
      />
      <Layout>
        <h1 className="text-3xl sm:text-5xl text-center font-semibold mt-8 mb-2">
          HDB Resale Price Calculator
        </h1>
        <div className=" container mx-auto px-4 sm:px-6 lg:px-8 prose-2xl">
          <p>
            Welcome to Singapore's most comprehensive and user-friendly property
            valuation tool, designed exclusively for resale flat buyers and
            sellers. Powered by AI, our platform offers an accurate and
            instantaneous insight into the value of your property, using the
            most recent sales and rental data.
          </p>
          <p>Features:</p>
          <ul>
            <li>
              <strong>Average Price</strong>: Get an immediate sense of the
              market with our up-to-date average pricing metrics.
            </li>
            <li>
              <strong>Price Estimate</strong>: Using intricate details like the
              unit level, area, and lease remaining, our linear regression model
              delivers a precise estimation of your property's worth.
            </li>
            <li>
              <strong>Rental Yield</strong>: Find out your potential returns
              from renting out your property, helping you make smarter
              investment decisions.
            </li>
            <li>
              <strong>Past Transaction Data</strong>: For the savvy users who
              like to deep dive, we provide raw transaction data, enabling you
              to draw your own informed conclusions.
            </li>
          </ul>
          <p>
            It's as easy as 1-2-3! Simply key in the postal code of your
            property and click on "Fetch Data". Within moments, you'll have a
            detailed report at your fingertips.
          </p>
          <HdbResaleCalculator />
        </div>
      </Layout>
    </>
  );
};

export default ResaleCalculator;
