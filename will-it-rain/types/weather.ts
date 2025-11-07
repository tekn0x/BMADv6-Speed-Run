/**
 * OpenWeather API Data Type Definitions
 *
 * Defines interfaces for data returned by the OpenWeather One Call API 3.0.
 * Based on: https://openweathermap.org/api/one-call-3
 */

/**
 * Single forecast data point from OpenWeather 5-day/3-hour Forecast API
 * Data comes in 3-hour intervals (8 per day)
 */
export interface ForecastData {
  /** Unix timestamp (UTC) for this forecast period */
  dt: number;
  /** Main weather data */
  main: {
    /** Temperature in specified units (Fahrenheit for this app) */
    temp: number;
    /** "Feels like" temperature */
    feels_like: number;
    /** Minimum temperature */
    temp_min: number;
    /** Maximum temperature */
    temp_max: number;
    /** Atmospheric pressure at sea level, hPa */
    pressure: number;
    /** Atmospheric pressure at sea level, hPa */
    sea_level: number;
    /** Atmospheric pressure at ground level, hPa */
    grnd_level: number;
    /** Humidity percentage */
    humidity: number;
  };
  /** Weather condition data */
  weather: Array<{
    /** Weather condition ID */
    id: number;
    /** Group of weather parameters (Rain, Snow, Clouds, etc.) */
    main: string;
    /** Weather condition description */
    description: string;
    /** Weather icon ID */
    icon: string;
  }>;
  /** Cloud coverage percentage */
  clouds: {
    /** Cloud coverage percentage */
    all: number;
  };
  /** Wind data */
  wind: {
    /** Wind speed in specified units (mph for imperial) */
    speed: number;
    /** Wind direction in degrees */
    deg: number;
    /** Wind gust speed (optional) */
    gust?: number;
  };
  /** Visibility in meters (max 10km) */
  visibility: number;
  /** Probability of precipitation (0-1) */
  pop: number;
  /** Rain data (optional, only present if rain expected) */
  rain?: {
    /** Rain volume for the last 3 hours, mm */
    '3h': number;
  };
  /** Snow data (optional) */
  snow?: {
    /** Snow volume for the last 3 hours, mm */
    '3h': number;
  };
  /** Part of the day (n=night, d=day) */
  sys: {
    /** Part of the day */
    pod: 'n' | 'd';
  };
  /** Time of data forecasted (ISO 8601 format) */
  dt_txt: string;
}

/**
 * Response from OpenWeather 5-day/3-hour Forecast API
 *
 * Free tier API providing forecast data in 3-hour intervals.
 * Returns up to 40 data points (5 days × 8 intervals per day).
 */
export interface OpenWeatherResponse {
  /** Response code (e.g., "200" for success) */
  cod: string;
  /** Number of data points returned */
  cnt: number;
  /** Array of forecast data (3-hour intervals) */
  list: ForecastData[];
  /** City information */
  city: {
    /** City ID */
    id: number;
    /** City name */
    name: string;
    /** Geographic coordinates */
    coord: {
      /** Latitude */
      lat: number;
      /** Longitude */
      lon: number;
    };
    /** Country code (ISO 3166) */
    country: string;
    /** Population */
    population: number;
    /** Timezone offset from UTC in seconds */
    timezone: number;
    /** Sunrise time (Unix timestamp) */
    sunrise: number;
    /** Sunset time (Unix timestamp) */
    sunset: number;
  };
}

/**
 * Response from OpenWeather Geocoding API
 *
 * Used to convert location string to lat/lon coordinates.
 * Based on: https://openweathermap.org/api/geocoding-api
 */
export interface GeocodingResponse {
  /** Location name */
  name: string;
  /** Local names in different languages (optional) */
  local_names?: Record<string, string>;
  /** Latitude */
  lat: number;
  /** Longitude */
  lon: number;
  /** Country code (ISO 3166) */
  country: string;
  /** State/province (for US locations) */
  state?: string;
}
