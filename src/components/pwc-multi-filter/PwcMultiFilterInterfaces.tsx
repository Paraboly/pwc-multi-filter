import "@paraboly/pwc-filter";
import "@paraboly/pwc-tabview";
import { PwcFilter } from "@paraboly/pwc-filter/dist/types/utils/PwcFilter";
import { PwcTabviewInterfaces } from "@paraboly/pwc-tabview/dist/types/interfaces/PwcTabviewInterfaces";

// tslint:disable-next-line: no-namespace
export namespace PwcMultiFilterInterfaces {
  export interface IFilterTabConfig {
    name: string;
    items: string | PwcFilter.ItemConfig[];
    data: string | object[];
  }

  export interface IActiveFilterChangedEventPayload {
    originalEvent: CustomEvent<PwcTabviewInterfaces.ITabChangedEventPayload>,
    filterName: string,
    filterRef: HTMLPwcFilterElement
  }
}
