declare module "react-big-calendar/lib/Month" {
  import { Component } from "react";

  class MonthView extends Component<Record<string, unknown>, Record<string, unknown>> {
    static range: (...args: unknown[]) => unknown;
    static navigate: (...args: unknown[]) => Date;
    static title: (...args: unknown[]) => string;
    measureRowLimit: () => void;
  }

  export default MonthView;
}
