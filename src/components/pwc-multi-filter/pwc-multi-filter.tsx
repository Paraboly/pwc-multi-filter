import { Component, h, Method, State } from "@stencil/core";
import { PwcMultiFilterInterfaces } from "./PwcMultiFilterInterfaces";
import _ from "lodash";

@Component({
  tag: "pwc-multi-filter",
  shadow: false
})
export class PwcMultiFilter {
  @State() filterConfigs: PwcMultiFilterInterfaces.IFilterTabConfig[] = [];
  private filterRefs: {
    [key: string]: HTMLPwcFilterElement;
  } = {};

  @Method()
  async addFilter(config: PwcMultiFilterInterfaces.IFilterTabConfig) {
    this.filterConfigs = _.unionBy(this.filterConfigs, [config], f => f.name);
  }

  @Method()
  async removeFilter(name: string) {
    this.filterConfigs = _.remove(this.filterConfigs, f => f.name === name);
  }

  @Method()
  async getFilter(name: string): Promise<HTMLPwcFilterElement> {
    return this.filterRefs[name];
  }

  @Method()
  async subscribeToFilterChange(
    name: string,
    callback: (
      filterChangedEvent
    ) => void
  ) {
    const filter = this.filterRefs[name];
    filter.addEventListener("filterChanged", callback);
  }

  @Method()
  async getFilterResult(name: string): Promise<object[]> {
    return this.filterRefs[name].filter();
  }

  constructFilterTab(filter: PwcMultiFilterInterfaces.IFilterTabConfig) {
    const name = filter.name;
    const filterData = filter.data;
    const filterItems = filter.items;

    return (
      <pwc-tabview-tab handle={name}>
        <pwc-filter data={filterData} items={filterItems} ref={this.registerFilterRef.bind(this, name)}></pwc-filter>
      </pwc-tabview-tab>
    );
  }

  registerFilterRef(name: string, filterRef: HTMLPwcFilterElement) {
    this.filterRefs[name] = filterRef;
  }

  render() {
    return (
      this.filterConfigs && this.filterConfigs.length > 0 &&
      <pwc-tabview>
        {this.filterConfigs.map(filter => this.constructFilterTab(filter))}
      </pwc-tabview>
    );
  }
}
