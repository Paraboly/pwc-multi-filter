import "@paraboly/pwc-filter";
import "@paraboly/pwc-tabview";
import { PwcFilter } from "@paraboly/pwc-filter/dist/types/utils/PwcFilter";

// tslint:disable-next-line: no-namespace
export namespace PwcMultiFilterInterfaces {
  export interface IFilterTabConfig {
    name: string;
    items: string | PwcFilter.ItemConfig[];
    data: string | object[];
  }

  export interface IActiveFilterChangedEventPayload {
    filterName: string;
    filterRef: HTMLPwcFilterElement;
  }
}
