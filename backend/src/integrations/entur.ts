import createEnturService from '@entur/sdk';

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

export const getAllDepartures = async () => {
  const bislettDepartures = await service.getDeparturesFromStopPlace(
    bislettStopId,
    params,
  );
  const bogstadveienDepartures = await service.getDeparturesFromStopPlace(
    bogstadveienStopId,
    params,
  );
  return [...bislettDepartures, ...bogstadveienDepartures].map((entry) => ({
    transportationType:
      entry.serviceJourney.journeyPattern?.line.transportMode === 'tram',
    lineNumber: entry.serviceJourney.journeyPattern?.line.publicCode,
    lineDescription: entry.serviceJourney.journeyPattern?.line.name,
    departureTime: entry.expectedDepartureTime,
  }));
};
