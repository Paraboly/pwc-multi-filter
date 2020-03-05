import {
  Component,
  h,
  Method,
  State,
  Element,
  Listen,
  Event,
  EventEmitter
} from "@stencil/core";
import { PwcMultiFilterInterfaces } from "./PwcMultiFilterInterfaces";
import _ from "lodash";
import "@paraboly/pwc-filter";
import "@paraboly/pwc-tabview";
import { FilterChangedEventPayload } from "@paraboly/pwc-filter/dist/types/components/pwc-filter/FilterChangedEventPayload";
import { IState } from "@paraboly/pwc-tabview/dist/types/components/pwc-tabview/IState";

// This is the only way this works, and the export has to stay as well, otherwise it throws "PwcFilter not found".
export type _filterChangedEventType = CustomEvent<FilterChangedEventPayload>;

@Component({
  tag: "pwc-multi-filter",
  shadow: false
})
export class PwcMultiFilter {
  @Element() root: HTMLPwcMultiFilterElement;

  @State() filterConfigs: PwcMultiFilterInterfaces.IFilterTabConfig[] = [];

  private filterRefs: {
    [key: string]: HTMLPwcFilterElement;
  } = {};

  private filterChangedEventSubscribers: {
    [key: string]: ((filterChangedEvent: _filterChangedEventType) => void)[];
  } = {};

  private activeFilterName: string;

  private tabViewRef: HTMLPwcTabviewElement;

  @Event() activeFilterChanged: EventEmitter<
    PwcMultiFilterInterfaces.IActiveFilterChangedEventPayload
  >;

  @Listen("tabChanged")
  async tabChangedEventHandler(e: CustomEvent<IState>) {
    this.setActiveState(e.detail.title);
  }

  @Method()
  async getActiveState() {
    return {
      filterRef: this.filterRefs[this.activeFilterName],
      filterName: this.activeFilterName
    };
  }

  @Method()
  async switchToFilter(name: string) {
    if (!this.filterRefs.hasOwnProperty(name)) {
      throw new Error(
        `Cannot find a filter with name '${name}'. Refusing to switch.`
      );
    }

    // we set the tab's state -> tab emits an event -> we set our inner state -> we emit an event
    return this.tabViewRef.switchToTab(name);
  }

  @Method()
  async addFilter(config: PwcMultiFilterInterfaces.IFilterTabConfig) {
    if (!config || !config.name) {
      throw new Error(`Config is invalid. Refusing to add.`);
    }

    this.filterConfigs = _.unionBy(this.filterConfigs, [config], f => f.name);
  }

  @Method()
  async removeFilter(name: string) {
    if (_.findIndex(this.filterConfigs, { name }) === -1) {
      throw new Error(
        `Cannot find a filter with name '${name}'. Refusing to delete.`
      );
    }

    const filtered = this.filterConfigs.filter(val => val.name !== name);
    this.filterConfigs = [...filtered];
    // delete this.filterRefs[name];
  }

  @Method()
  async getFilter(name: string): Promise<HTMLPwcFilterElement> {
    return this.filterRefs[name];
  }

  @Method()
  async subscribeToFilterChange(
    name: string,
    callback: (filterChangedEvent: _filterChangedEventType) => void
  ) {
    if (_.findIndex(this.filterConfigs, { name }) === -1) {
      throw new Error(
        `Cannot find a filter with name '${name}'. Refusing to process subscription request.`
      );
    }

    this.filterChangedEventSubscribers[name] =
      this.filterChangedEventSubscribers[name] || [];
    this.filterChangedEventSubscribers[name].push(callback);
  }

  @Method()
  async getFilterResult(name: string): Promise<object[]> {
    if (!this.filterRefs.hasOwnProperty(name)) {
      // tslint:disable-next-line: no-console
      console.warn(
        `Cannot find a filter with name '${name}'. Returning empty array.`
      );

      return [];
    }

    return this.filterRefs[name].filter();
  }

  setActiveState(activeFilterName: string) {
    this.activeFilterName = activeFilterName;

    this.activeFilterChanged.emit({
      filterName: this.activeFilterName,
      filterRef: this.filterRefs[this.activeFilterName]
    });
  }

  handleChangeEvent(name: string, event: _filterChangedEventType) {
    const subscribers = this.filterChangedEventSubscribers[name];
    if (subscribers) {
      subscribers.forEach(callback => callback(event));
    }
  }

  registerFilterRef(name: string, filterRef: HTMLPwcFilterElement) {
    if (filterRef) {
      const existingRef = this.filterRefs[name];
      this.filterRefs[name] = filterRef;

      if (existingRef !== filterRef) {
        this.initialFilterSetup(name, filterRef);
      }
    }
  }

  initialFilterSetup(name: string, filterRef: HTMLPwcFilterElement) {
    filterRef.addEventListener(
      "filterChanged",
      this.handleChangeEvent.bind(this, name)
    );
  }

  switchToFirstFilter() {
    const firstTabName = this.filterConfigs[0].name;
    this.switchToFilter(firstTabName);
  }

  constructFilterTab(filter: PwcMultiFilterInterfaces.IFilterTabConfig) {
    return (
      <pwc-tabview-tab title={filter.name}>
        <pwc-filter
          data={filter.data}
          items={filter.items}
          ref={el => this.registerFilterRef(filter.name, el)}
        ></pwc-filter>
      </pwc-tabview-tab>
    );
  }

  render() {
    return (
      this.filterConfigs &&
      this.filterConfigs.length > 0 && (
        <pwc-tabview ref={el => (this.tabViewRef = el)}>
          {this.filterConfigs.map(filter => this.constructFilterTab(filter))}
        </pwc-tabview>
      )
    );
  }
}
