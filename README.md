# Leave Tung Chung Safe

A mobile-first Next.js app for checking Hong Kong bus routes, stop ETAs,
favourites, MTR services, and road traffic notices.

## Transit data

- KMB, Citybus (CTB), and NLB route and ETA data use the operators' public
  Data.gov.hk APIs. The matching API specifications are in [`api_docs/`](./api_docs/).
- Cross-operator stop matching uses the daily-updated
  [hkbus/hk-bus-crawling](https://github.com/hkbus/hk-bus-crawling) feed. It
  groups KMB, CTB, and NLB stop IDs by physical location and supplies the
  associated route metadata. The app refreshes this feed hourly.
- MTR Bus ETAs use the MTR Bus `getSchedule` API. Its route list and stop
  locations come from the maintained data in [`shared/data/`](./shared/data/),
  as the ETA API does not offer a route-list endpoint.
- Stop maps are embedded from OpenStreetMap and recenter on the selected stop.

This app uses and attributes HK Bus Crawling data:
[HK Bus Crawling](https://github.com/hkbus/hk-bus-crawling).

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Run a production build with `npm run build`.
