import createEnturService, { EstimatedCall, DeparturesById } from '@entur/sdk';
import app from 'src/app';

const service = createEnturService({
  clientName: 'giltvedt-selbekk - smart-mirror',
});

const bislettStopId = 'NSR:StopPlace:58353';
const bogstadveienStopId = 'NSR:StopPlace:58403';
const params = {
  whiteListedLines: [
    'RUT:Line:11',
    'RUT:Line:17',
    'RUT:Line:18',
    'RUT:Line:19',
    'RUT:Line:21',
  ],
  timeRange: 60 * 60 * 2, // 2 hours
};

const mapDeparture = (departure: EstimatedCall) => ({
  transportationType:
    departure.serviceJourney.journeyPattern?.line.transportMode === 'tram',
  lineNumber: departure.serviceJourney.journeyPattern?.line.publicCode,
  lineDescription: departure.serviceJourney.journeyPattern?.line.name,
  departureTime: departure.expectedDepartureTime,
});

export const getAllDepartures = async () => {
  const allDepartures = (await service.getDeparturesFromStopPlaces(
    [bislettStopId, bogstadveienStopId],
    params,
  )) as DeparturesById[];

  return allDepartures
    .map(({ departures }) => departures.map(mapDeparture))
    .reduce((acc, departures) => acc.concat(departures))
    .sort((a, b) => {
      if (a.departureTime < b.departureTime) {
        return -1;
      }
      if (b.departureTime > b.departureTime) {
        return 1;
      }
      return 0;
    });
};
