import { useMemo } from "react";
import { City, Country, State } from "country-state-city";

export type LocationValue = {
  country: string;
  stateRegion: string;
  city: string;
  areaAddress: string;
};

type Props = {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
  countryDisabled?: boolean;
};

const countries = Country.getAllCountries();

export const LocationFields = ({ value, onChange, countryDisabled = false }: Props) => {
  const country = useMemo(() => countries.find((item) => item.name === value.country), [value.country]);
  const states = useMemo(() => country ? State.getStatesOfCountry(country.isoCode) : [], [country]);
  const state = useMemo(() => states.find((item) => item.name === value.stateRegion), [states, value.stateRegion]);
  const cities = useMemo(() => {
    if (!country) return [];
    return state ? City.getCitiesOfState(country.isoCode, state.isoCode) : City.getCitiesOfCountry(country.isoCode) || [];
  }, [country, state]);

  return <>
    <div className="private-form-row">
      <label>Country
        <select required disabled={countryDisabled} value={value.country} onChange={(event) => onChange({ ...value, country: event.target.value, stateRegion: "", city: "", areaAddress: "" })}>
          <option value="">Select country</option>
          {countries.map((item) => <option key={item.isoCode} value={item.name}>{item.name}</option>)}
        </select>
      </label>
      <label>State/Region
        <select disabled={!country || states.length === 0} value={value.stateRegion} onChange={(event) => onChange({ ...value, stateRegion: event.target.value, city: "", areaAddress: "" })}>
          <option value="">{states.length ? "Select state/region" : "Not applicable"}</option>
          {states.map((item) => <option key={item.isoCode} value={item.name}>{item.name}</option>)}
        </select>
      </label>
    </div>
    <div className="private-form-row">
      <label>City
        <select required disabled={!country || cities.length === 0} value={value.city} onChange={(event) => onChange({ ...value, city: event.target.value, areaAddress: "" })}>
          <option value="">{cities.length ? "Select city" : "No cities available"}</option>
          {cities.map((item, index) => <option key={`${item.name}-${index}`} value={item.name}>{item.name}</option>)}
        </select>
      </label>
      <label>Area/Address summary
        <input required value={value.areaAddress} placeholder="Neighborhood, street, building..." onChange={(event) => onChange({ ...value, areaAddress: event.target.value })} />
      </label>
    </div>
  </>;
};
