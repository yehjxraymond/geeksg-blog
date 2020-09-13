import React from "react";
import { storiesOf } from "@storybook/react";
import { Newsletter } from "./newsletter";

const story = storiesOf("Components|Layout", module);

story.add("Newsletter", () => <Newsletter />);
