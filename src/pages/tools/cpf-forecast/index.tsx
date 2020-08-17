import React, { FunctionComponent } from "react";
import { CpfCalculator } from "../../../components/interactive/cpf";
import { Layout } from "../../../components/layout";
import { SEO } from "../../../components/seo";

export const NotFound: FunctionComponent = () => {
  return (
    <>
      <SEO
        title="CPF Forecast Calculator"
        description="The CPF Forecast Calculator is used to estimate the contributions and balances of the multiple CPF accounts based on current account information and various assumptions to help you plan for retirement. The calculator predicts your CPF balances up to age 55."
        image="/images/cpf-forecast-calculator.png"
      />
      <Layout>
        <h1 className="text-3xl sm:text-5xl text-center font-semibold mt-8 mb-2">
          CPF Forecast Calculator
        </h1>
        <div className=" container mx-auto px-4 sm:px-6 lg:px-8 prose-2xl">
          <p>
            The CPF Forecast Calculator is used to estimate the contributions
            and balances of the multiple CPF accounts based on current account
            information and various assumptions to help you plan for retirement.
            The calculator predicts your CPF balances up to age 55.
          </p>
          <p>
            The tool was created with the intention to showcase how choices you
            make now can affect your retirement. These choices can be found in
            "Additional Information" section of the calculator.
          </p>
          <p>
            You may start by entering your "Basic Information" in the boxes
            below before clicking on "Calculate".
          </p>
          <CpfCalculator />
        </div>
      </Layout>
    </>
  );
};

export default NotFound;
