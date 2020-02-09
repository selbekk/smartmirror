import createEnturService, { EstimatedCall } from '@entur/sdk';

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
  const bislettDepartures = await service.getDeparturesFromStopPlace(
    bislettStopId,
    params,
  );
  const bogstadveienDepartures = await service.getDeparturesFromStopPlace(
    bogstadveienStopId,
    params,
  );
  return [
    { name: 'Bislett', departures: bislettDepartures.map(mapDeparture) },
    {
      name: 'Bogstadveien',
      departures: bogstadveienDepartures.map(mapDeparture),
    },
  ];
};
