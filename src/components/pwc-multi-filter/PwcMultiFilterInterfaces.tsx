import "@paraboly/pwc-filter";
import "@paraboly/pwc-tabview";
import { ItemConfig } from "@paraboly/pwc-filter/dist/types/components/pwc-filter/ItemConfig";

// tslint:disable-next-line: no-namespace
export namespace PwcMultiFilterInterfaces {
  export interface IFilterTabConfig {
    name: string;
    items: string | ItemConfig[];
    data: string | object[];
  }

  export interface IActiveFilterChangedEventPayload {
    filterName: string;
    filterRef: HTMLPwcFilterElement;
  }
}
